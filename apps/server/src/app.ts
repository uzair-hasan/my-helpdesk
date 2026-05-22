import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import cookieParser from "cookie-parser";
import { timeStamp } from "console";
import authRoutes from "./routes/auth.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

// security middleware
app.use(helmet());

// CORS
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// body parsing
app.use(express.json());

// cookie parsing
app.use(cookieParser());

// Health Check
app.get("/health", (_req, res) => {
  res.json({ status: "Ok", timeStamp: new Date().toISOString() });
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/users", userRoutes);

export default app;
