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

export default { getUserId };
