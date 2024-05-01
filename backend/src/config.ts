import mysql from "mysql2";

function errorOut(envVar: string): never {
  console.error(`${envVar} is not defined in environment variables.`);
  process.exit(1);
}

const hostname = process.env.HOSTNAME ?? "127.0.0.1";
const port = parseInt(process.env.PORT ?? "3000");
const secretKey = process.env.SECRET_KEY || errorOut("SECRET_KEY");

const mysqlConnectionConfig: mysql.PoolOptions = {
  host: process.env.MYSQL_HOST || "localhost",
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER || errorOut("MYSQL_USER"),
  password: process.env.MYSQL_PASSWORD || errorOut("MYSQL_PASSWORD"),
  database: process.env.MYSQL_DATABASE || errorOut("MYSQL_DATABASE"),
};

export { hostname, port, secretKey, mysqlConnectionConfig };
