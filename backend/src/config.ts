import dotenv from "dotenv";

dotenv.config();

const hostname = process.env.HOSTNAME ?? "127.0.0.1";
const port = parseInt(process.env.PORT ?? "3000");

export { hostname, port };
