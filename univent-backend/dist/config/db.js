"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const environment = process.env.NODE_ENV || "production";
const isProduction = environment === "production";
console.log(`(db) environment: ${environment.toUpperCase()}`);
const poolConfig = isProduction
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT),
        ssl: false,
    };
const pool = new pg_1.Pool(Object.assign(Object.assign({}, poolConfig), { connectionTimeoutMillis: 5000 }));
const verifyConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield pool.connect();
        client.release();
    }
    catch (err) {
        console.error("PostgreSQL Connection Error: ", err);
        process.exit(1);
    }
});
if (!isProduction) {
    verifyConnection();
}
pool.on("error", (err) => {
    console.error("Database Pool Error: ", err);
});
exports.default = pool;
