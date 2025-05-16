import config from "config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
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

// Apply Helmet's default security headers
app.use(helmet());

// Apply a specific Content Security Policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      // It's likely need to adjust this later to allow resources from CDNs or other trusted domains that our application uses.
      defaultSrc: ["'self'"], // Which means that the only sources of content are the same origin
      // Add other directives here as needed, for example:
      // scriptSrc: ["'self'", "trusted-cdn.com"],
      // styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles if necessary
      // imgSrc: ["'self'", "data:"] // Allow data URIs for images
    },
  })
);

app.use(history());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
