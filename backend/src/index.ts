import bodyParser from "body-parser";
import express from "express";
import compression from "compression";
import { StatusCodes } from "http-status-codes";

import { hostname, port } from "./config";
import { pool } from "./database";
import router from "./routes";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(compression({ threshold: 0 }));

app.use("/api", router);

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
