import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const environment = process.env.NODE_ENV || "production";
const isProduction = environment === "production";

console.log(`(db) environment: ${environment.toUpperCase()}`);

const poolConfig = isProduction
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT),
      ssl: false,
    };

const pool = new Pool({
  ...poolConfig,
});

const verifyConnection = async () => {
  try {
    const client: any = await pool.connect();
    client.release();
  } catch (err) {
    console.error("PostgreSQL Connection Error: ", err);
  }
};

if (!isProduction) {
  verifyConnection();
}

export default pool;
