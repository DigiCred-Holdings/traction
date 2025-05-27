import express, { Request, Response } from "express";
import config from "config";
import * as emailComponent from "../components/email";
import * as innkeeperComponent from "../components/innkeeper";
import { body, validationResult } from "express-validator";
import { NextFunction } from "express";
import oidcMiddleware from "../middleware/oidcMiddleware";
import acaPyService from "../services/acapy-service";
import messageService from "../services/message-service";
import redisService from "../services/redis-service";

export const router = express.Router();

router.use(express.json());

const extractTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log('Token extraction middleware running...');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  const authHeader = req.headers.authorization;
  if (authHeader) {
    console.log('Found Authorization header:', authHeader);
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      console.log('Extracted token from Authorization header:', token || 'empty string');
      req.headers['acapy-token'] = token;
      acaPyService.setToken(token);
    } else {
      console.log('Authorization header does not start with Bearer');
    }
  } else {
    console.log('No Authorization header found');
  }
  
  const acapyToken = req.headers['acapy-token'];
  if (acapyToken && !req.headers.authorization) {
    console.log('Found token in acapy-token header:', acapyToken);
    acaPyService.setToken(acapyToken.toString());
  }
  
  if (req.query.token && !req.headers.authorization && !req.headers['acapy-token']) {
    const queryToken = req.query.token.toString();
    console.log('Found token in query parameters:', queryToken);
    acaPyService.setToken(queryToken);
  }
  
  next();
};

router.get(
  "/innkeeperLogin",
  oidcMiddleware,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      console.log(req.claims);
      if (
        req.claims.realm_access &&
        req.claims.realm_access.roles &&
        req.claims.realm_access.roles.includes(
          config.get("server.oidc.roleName")
        )
      ) {
        const result = await innkeeperComponent.login();
        res.status(200).send(result);
      } else {
        res.status(403).send();
      }
    } catch (error) {
      console.error(`Error logging in: ${error}`);
      next(error);
    }
  }
);

router.post(
  "/innkeeperReservation",
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const { token } = await innkeeperComponent.login();

      const result = await innkeeperComponent.createReservation(req, token);
      res.status(201).send(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/email/reservationConfirmation",
  body("contactEmail").isEmail(),
  body("reservationId").not().isEmpty(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
      }

      const result = await emailComponent.sendConfirmationEmail(req);
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/email/reservationStatus",
  body("contactEmail").isEmail(),
  body("reservationId").not().isEmpty(),
  body("state").not().isEmpty(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
      }

      const result = await emailComponent.sendStatusEmail(req);
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/items/summary",
  extractTokenMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Router: Getting item type summary with ACA-Py connections");
      
      const forceRefresh = req.query.forceRefresh === 'true';
      console.log(`Router: forceRefresh parameter is ${forceRefresh}`);
      
      const cachedResults = await redisService.redisClient.get('summary:items_by_kind');
      
      if (forceRefresh || !cachedResults) {
        console.log("Router: Queueing summary update request");
        const token = req.headers['acapy-token'] as string || '';
        await messageService.queueSummaryUpdate(token);
        
        if (cachedResults) {
          console.log("Router: Returning cached results while update is queued");
          res.status(200).json(JSON.parse(cachedResults));
        } else {
          console.log("Router: No cached data available, returning empty summary data");
          const defaultSummary = [
            { kind: "Connection", kind_id: 1, count: 0, source: 'acapy' },
            { kind: "StudentID", kind_id: 2, count: 0, source: 'acapy' },
            { kind: "Transcript", kind_id: 3, count: 0, source: 'acapy' },
            { kind: "Invited", kind_id: 4, count: 0, source: 'acapy' },
            { kind: "Failed", kind_id: 5, count: 0, source: 'acapy' },
            { kind: "Message", kind_id: 6, count: 0, source: 'acapy' }
          ];
          res.status(200).json(defaultSummary);
        }
        return;
      }
      
      console.log("Router: Returning cached summary data");
      res.status(200).json(JSON.parse(cachedResults));
    } catch (error: any) {
      console.error("Router: Error handling summary request:", error);
      res.status(500).json({
        error: "Database or API error",
        details: error.message,
      });
      next(error);
    }
  }
);

router.get(
  "/health",
  async (_req: Request, res: Response) => {
    try {
      const redisStatus = await redisService.checkRedisHealth();
      
      res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        redis: redisStatus ? "connected" : "disconnected"
      });
    } catch (error: any) {
      console.error("Health check failed:", error);
      res.status(500).json({
        status: "error",
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  }
);

router.post(
  "/messages/broadcast",
  extractTokenMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        res.status(400).json({ error: "Message is required" });
        return;
      }
      
      const token = req.headers['acapy-token'] as string || '';
      
      const result = await messageService.queueBroadcastMessage(message, token);
      
      res.status(200).json({
        status: "success",
        queued: result.queuedCount,
        connections: result.connections.length
      });
    } catch (error: any) {
      console.error("Error broadcasting message:", error);
      res.status(500).json({
        error: "Failed to broadcast message",
        details: error.message
      });
      next(error);
    }
  }
);

router.post(
  "/messages/send/:connectionId",
  extractTokenMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { connectionId } = req.params;
      const { message } = req.body;
      
      if (!connectionId) {
        res.status(400).json({ error: "Connection ID is required" });
        return;
      }
      
      if (!message) {
        res.status(400).json({ error: "Message is required" });
        return;
      }
      
      const token = req.headers['acapy-token'] as string || '';
      
      const result = await messageService.sendMessageToConnection(connectionId, message, token);
      
      res.status(200).json({
        status: "success",
        result
      });
    } catch (error: any) {
      console.error(`Error sending message to connection ${req.params.connectionId}:`, error);
      res.status(500).json({
        error: "Failed to send message",
        details: error.message
      });
      next(error);
    }
  }
);