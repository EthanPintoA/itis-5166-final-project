import { RowDataPacket } from "mysql2";
import { PoolConnection } from "mysql2/promise";

async function getUserId(
  username: string,
  connection: PoolConnection
): Promise<number | null> {
  const [row] = await connection.query<RowDataPacket[]>(
    "SELECT id FROM user WHERE username = ?",
    [username]
  );

  if (!row.length) {
    return null;
  }
  return row[0].id as number;
}

async function getBudgetCount(
  user_id: number,
  name: string,
  connection: PoolConnection
): Promise<number> {
  const [row] = await connection.query<RowDataPacket[]>(
    "SELECT COUNT(*) as count FROM budget WHERE user_id = ? AND name = ?",
    [user_id, name]
  );

  return row[0].count as number;
}

export default { getUserId, getBudgetCount };
