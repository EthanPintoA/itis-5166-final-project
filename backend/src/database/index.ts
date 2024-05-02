import mysql from "mysql2/promise";
import util from "./util";

import { mysqlConnectionConfig } from "../config";

const pool = mysql.createPool(mysqlConnectionConfig);

export { pool, util };
