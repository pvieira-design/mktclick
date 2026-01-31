import { Pool } from "pg";
import { env } from "@marketingclickcannabis/env/server";

const pool = new Pool({
  connectionString: env.EXTERNAL_DATABASE_URL,
  max: 5,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

export async function queryAdsDb(
  text: string,
  params?: any[]
): Promise<any[]> {
  try {
    const result = await pool.query(text, params);
    return result.rows;
  } catch (error) {
    throw new Error("Nao foi possivel conectar ao banco de anuncios");
  }
}

export { pool };
