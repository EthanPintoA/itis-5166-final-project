import bodyParser from "body-parser";
import express, { NextFunction, Request, Response } from "express";
import compression from "compression";
import helmet from "helmet";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

import { hostname, port } from "./config";
import { pool } from "./database";
import router from "./routes";

const app = express();

app.use(helmet());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(compression({ threshold: 0 }));

app.use("/api", router);

// Override the default 404 or not found handler
app.use((_req, res, _next) => {
  res.status(StatusCodes.NOT_FOUND).json({ message: "Not Found" });
});

// Override the default error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
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
