import dotenv from "dotenv";

dotenv.config();

const hostname = process.env.HOSTNAME ?? "127.0.0.1";
const port = parseInt(process.env.PORT ?? "3000");
const secretKey =
  process.env.SECRET_KEY ||
  // Pattern is known as IIFE (Immediately Invoked Function Expression)
  (() => {
    console.error("SECRET_KEY is not defined in environment variables.");
    process.exit(1);
  })();

export { hostname, port, secretKey };
