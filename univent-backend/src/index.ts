import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./config/db";
import authRoutes from "./routes/authRoutes";
import eventRoutes from "./routes/eventRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const environment = process.env.NODE_ENV || "development";
const CLIENT_URL =
  process.env.CLIENT_URL || (environment === "production" ? "" : "*");

console.log(`(index) environment: ${environment.toUpperCase()}`);

app.use(express.json());
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Univent backend is up.");
});
app.get("/api", (req, res) => {
  res.json({ message: "API endpoint is working." });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

app.listen(PORT, () => {
  console.log("Server running on port:", PORT);
});

export default app;
