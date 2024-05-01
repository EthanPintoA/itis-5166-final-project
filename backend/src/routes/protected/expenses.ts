import { Router, Request, Response } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.status(StatusCodes.NOT_IMPLEMENTED).send(ReasonPhrases.NOT_IMPLEMENTED);
});

router.put("/update", (_req: Request, res: Response) => {
  res.status(StatusCodes.NOT_IMPLEMENTED).send(ReasonPhrases.NOT_IMPLEMENTED);
});

export default router;
