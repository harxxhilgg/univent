import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

// pool.query("SELECT NOW()", (err, res) => {
//   console.log("Attempting to connect to the database...");
//   if (err) console.error("Database connection error: ", err);
//   else console.log("Database connected: ", res.rows[0]);
// });

pool
  .connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("PostgrSQL connection error: ", err));

export default pool;
