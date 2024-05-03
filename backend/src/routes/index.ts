import { Router, Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

import authRouter from "./auth";
import protectedRouter from "./protected";

const router = Router();

router.use("/auth", authRouter);
router.use("/protected", protectedRouter);

router.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  // Handle validation error from Joi
  if (err.name !== "ValidationError") {
    return next(err);
  }

  res.status(StatusCodes.BAD_REQUEST).json({ message: err.message });
});

export default router;
