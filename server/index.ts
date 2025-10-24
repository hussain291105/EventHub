import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors"; // ✅ ADD THIS
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";

const app = express();

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// ✅ Enable CORS for your deployed frontend
app.use(
  cors({
    origin: [
      "https://eventhub-frontend.onrender.com", // replace with your actual frontend Render URL
      "http://localhost:5173", // for local dev (optional)
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false }));

// Serve static assets
app.use("/assets", express.static("attached_assets"));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await seedDatabase();
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ✅ Test route (optional)
  app.get("/api/test", (_req: Request, res: Response) => {
    res.json({ message: "Backend working ✅" });
  });

  // ✅ Always use dynamic port and 0.0.0.0 for Render
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`✅ Server running on port ${port}`);
  });
})();
