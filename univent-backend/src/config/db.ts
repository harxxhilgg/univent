import { Pool } from "pg";
import dotenv from "dotenv";
import { API_URL } from "../utils/api";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

pool
  .connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .then(() => console.log(`API is accessible at: ${API_URL}`))
  .catch((err) => console.error("PostgrSQL connection error: ", err));

export default pool;
