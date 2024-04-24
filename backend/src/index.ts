import bodyParser from "body-parser";
import express from "express";
import { StatusCodes } from "http-status-codes";

import { hostname, port } from "./config";
import authRouter from "./auth";
import protectedRouter from "./protected";

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Routers
app.use("/", authRouter);
app.use("/", protectedRouter);

app.get("/", (_, res) => {
  res.status(StatusCodes.OK).send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running at http://${hostname}:${port}`);
});
