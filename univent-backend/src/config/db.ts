import dotenv from "dotenv";
import logger from "../utils/logger";
import { Pool } from "pg";

dotenv.config();

const environment = process.env.NODE_ENV || "production";
const isProduction = environment === "production";

logger.debug(`(db) environment: ${environment.toUpperCase()}`);

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
    logger.debug(`Conntected Postgres`);
  } catch (err) {
    logger.error(`PostgreSQL Connection Error: ${err}`);
  }
};

if (!isProduction) {
  verifyConnection();
}

export default pool;
