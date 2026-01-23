import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";
import config from "config";
import { Request, Response, NextFunction } from "express";
import axios from "axios";

// Extend Express Request to include claims
interface AuthenticatedRequest extends Request {
  claims?: JWTPayload;
}

const jwksUri = new URL(config.get("server.oidc.jwksUri"));
const jwks = createRemoteJWKSet(jwksUri);

const oidcMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const { payload } = await jwtVerify(token, jwks);
    req.claims = payload;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token", error });
  }
};

console.log("OIDC Middleware loaded");
const oidcGoogleMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
  // console.log("OIDC Google Middleware invoked");
  const authHeader = req.headers.authorization;
  // console.log("OIDC Google Middleware - Auth Header:", authHeader);
  const { state, response } = req.body;
  // console.error("OIDC Google Middleware - State:", state);
  // console.error("OIDC Google Middleware - Response:", response);
  // console.error("OIDC Google Middleware - Beginning token exchange process");
  
  // Fetch .well-known/openid-configuration to get token_endpoint
  const authority: string = config.get("server.oidc.authority");
  const configId: string = config.get("server.oidc.clientId");
  const tenantId: string = config.get("server.innkeeper.user");
  const configSecret: string = config.get("server.oidc.clientSecret");
  const oid_config = await axios.get(`${authority}/.well-known/openid-configuration`);
  const tokenEndpoint = oid_config.data.token_endpoint;
  
  // Exchange code
  const tokenResponse = await axios.post(tokenEndpoint, {
    grant_type: "authorization_code",
    code: response.code,
    code_verifier: state.code_verifier,
    client_id: configId,
    client_secret: configSecret,
    redirect_uri: state.redirect_uri,
  });

  // console.error("Token Response:", tokenResponse.data);
  
  // if (!authHeader || !authHeader.startsWith("Bearer ")) {
  //   res.status(401).json({ message: "Unauthorized" });
  //   return;
  // }
  // const token = authHeader.split(" ")[1];
  const token = tokenResponse.data.id_token;
    const { payload } = await jwtVerify(token, jwks);
    // console.log(`User "${payload.name} <${payload.email}> ($${payload.sub})" logged in via OpenID Connect as ${tenantId}`);
    req.claims = payload;
    next();
  } catch (error) {
    console.error("OIDC Middleware Error:", error);
    res.status(401).json({ message: "Invalid token", error });
  }
};

export default oidcMiddleware;
export { oidcGoogleMiddleware };
