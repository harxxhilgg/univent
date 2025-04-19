import { Pool } from "pg";
import dotenv from "dotenv";
// import { API_URL } from "../utils/api";

dotenv.config();

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: Number(process.env.DB_PORT),
// });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const verifyConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("connected to postgresql.");
    client.release();
  } catch (err) {
    console.error("postgresql connection error: ", err);
  }
};

if (!process.env.VERCEL) {
  verifyConnection();
}

// pool
//   .connect()
//   .then(() => console.log("Connected to PostgreSQL"))
//   .then(() => console.log(`API is accessible at: ${API_URL}`))
//   .catch((err) => console.error("PostgrSQL connection error: ", err));

export default pool;
