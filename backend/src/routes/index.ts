import { Router, Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

import authRouter from "./auth";
import protectedRouter from "./protected";

const router = Router();

router.get("/", (_, res) => {
  res.status(StatusCodes.OK).send("Hello World!");
});

router.use("/", authRouter);
router.use("/", protectedRouter);

router.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  // Handle validation error from Joi
  if (err.name !== "ValidationError") {
    return next(err);
  }

  res.status(StatusCodes.BAD_REQUEST).json({ message: err.message });
});

export default router;
