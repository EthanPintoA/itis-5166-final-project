import mysql from "mysql2/promise";

import { mysqlConnectionConfig } from "../config";

const pool = mysql.createPool(mysqlConnectionConfig);

export { pool };
