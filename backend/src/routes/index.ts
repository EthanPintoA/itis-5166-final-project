import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import authRouter from "./auth";
import protectedRouter from "./protected";

const router = Router();

router.get("/", (_, res) => {
  res.status(StatusCodes.OK).send("Hello World!");
});

router.use("/", authRouter);
router.use("/", protectedRouter);

export default router;
