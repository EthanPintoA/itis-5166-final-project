import express from "express";
import dotenv from "dotenv";
import { StatusCodes } from "http-status-codes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (_, res) => {
  res.status(StatusCodes.OK).send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running at http://127.0.0.1:${port}`);
});
