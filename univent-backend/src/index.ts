import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./config/db";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

app.get("/api", (req, res) => {
  res.json({ message: "API root is working" });
});

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Univent backend is up");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
