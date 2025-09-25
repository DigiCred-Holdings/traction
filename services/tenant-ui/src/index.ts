import config from "config";
import cors from "cors";
import express from "express";
import path from "path";

import { router } from "./routes/router";

import { configureLogStream } from "./services/log-stream";

const API_ROOT: string = config.get("server.apiPath");
const LOKI_URL: string = config.get("server.lokiUrl");
const PORT: number = parseInt(config.get("server.port") as string, 10);
const STATIC_FILES_PATH: string = config.get("server.staticFiles");
import history from "connect-history-api-fallback";

const app = express();

// Disable X-Powered-By header for security
app.disable("x-powered-by");

app.use(function (req, res, next) {
  res.setHeader(
    'Content-Security-Policy', config.get("server.content-security-policy")
  );
  
  next();
});

app.use(history());

app.use(cors({
  origin: config.get("server.corsAllowedOrigins"),
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Host the static frontend assets
app.use("/favicon.ico", (_, res) => {
  res.redirect("/favicon.ico");
});
app.use("/", express.static(path.join(__dirname, STATIC_FILES_PATH)));

// Since the server config can have important secret values in, you must opt-in
// for server values (or other non FE config) that should return from /config
function _setupConfig() {
  return {
    frontend: config.get("frontend"),
    image: config.get("image"),
    server: {
      tractionUrl: config.get("server.tractionUrl"),
    },
  };
}

// Frontend configuration endpoint, return config section at /config so UI can get it
app.use("/config", (_, res, next) => {
  try {
    res.status(200).json(_setupConfig());
  } catch (err) {
    next(err);
  }
});

// This service's api endpoints
app.use(API_ROOT, router);

if (LOKI_URL) {
  configureLogStream(
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}, apiroot: ${API_ROOT}`);
    })
  );
}
