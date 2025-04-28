"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
require("./config/db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const environment = process.env.NODE_ENV || "development";
const CLIENT_URL = process.env.CLIENT_URL || (environment === "production" ? "" : "*");
console.log(`(index) environment: ${environment.toUpperCase()}`);
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: CLIENT_URL,
    credentials: true,
}));
app.get("/", (req, res) => {
    res.send("Univent backend is up.");
});
app.get("/api", (req, res) => {
    res.json({ message: "API endpoint is working." });
});
app.use("/api/auth", authRoutes_1.default);
app.use("/api/events", eventRoutes_1.default);
app.listen(PORT, () => {
    console.log("Server running on port:", PORT);
});
exports.default = app;
