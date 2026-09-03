import express, { type Express } from "express";
import cors, { type CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        const path = req.url
          ?.split("?")[0]
          ?.replace(/(\/api\/auth\/invitations\/)[^/]+/, "$1[redacted]");
        return {
          id: req.id,
          method: req.method,
          url: path,
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
const configuredOrigins = new Set(
  (process.env["TRUSTED_ORIGINS"] ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.use(cors((req, callback) => {
  const origin = req.get("origin");
  const forwardedProto = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = req.get("x-forwarded-host")?.split(",")[0]?.trim();
  const protocol = forwardedProto || req.protocol;
  const host = forwardedHost || req.get("host");
  const sameOrigin = host ? `${protocol}://${host}` : "";
  const allowed = !origin || origin === sameOrigin || configuredOrigins.has(origin);
  const options: CorsOptions = {
    origin: allowed,
    credentials: true,
  };
  callback(allowed ? null : new Error("Origin is not allowed"), options);
}));
app.use(cookieParser());
app.use(express.json({
  verify(req, _res, buffer) {
    (req as RequestWithRawBody).rawBody = Buffer.from(buffer);
  },
}));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;

type RequestWithRawBody = express.Request & { rawBody?: Buffer };
