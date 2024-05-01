import bodyParser from "body-parser";
import express from "express";
import { StatusCodes } from "http-status-codes";

import { hostname, port } from "./config";
import authRouter from "./auth";
import protectedRouter from "./protected";
import { pool } from "./database";

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Routers
app.use("/", authRouter);
app.use("/", protectedRouter);

app.get("/", (_, res) => {
  res.status(StatusCodes.OK).send("Hello World!");
});

const server = app.listen(port, () => {
  console.log(`Server is running at http://${hostname}:${port}`);
});

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    console.log("Shutting down server...");

    server.close(async () => {
      console.log("Server has shut down.");

      await pool.end();
      console.log("Connection pool has closed.");

      process.exit(0);
    });

    setTimeout(() => {
      console.error("Forcing shut down.");
      process.exit(1);
    }, 5000);
  });
});
