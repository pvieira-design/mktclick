import { Pool } from "pg";
import { env } from "@marketingclickcannabis/env/server";

const pool = env.CLICK_DATABASE_URL
  ? new Pool({
      connectionString: env.CLICK_DATABASE_URL,
      max: 3,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    })
  : null;

export async function queryClickDb(
  text: string,
  params?: any[]
): Promise<any[]> {
  if (!pool) {
    throw new Error("CLICK_DATABASE_URL não configurada");
  }
  try {
    const result = await pool.query(text, params);
    return result.rows;
  } catch (error) {
    throw new Error("Não foi possível conectar ao banco da Click");
  }
}
