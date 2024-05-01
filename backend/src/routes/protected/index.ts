import { Router, Request, Response, NextFunction } from "express";
import { expressjwt } from "express-jwt";
import { StatusCodes } from "http-status-codes";

import { secretKey } from "../../config";

const router = Router();

// Middleware
router.use(
  expressjwt({
    secret: secretKey,
    algorithms: ["HS256"],
  })
);

router.get("/dashboard", (_req, res) => {
  res.status(StatusCodes.OK).send("Dashboard");
});

// Error handlers
router.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  // Handle unauthorized error from express-jwt
  if (err.name !== "UnauthorizedError") {
    next(err);
    return;
  }

  res.status(StatusCodes.UNAUTHORIZED).send(err.message);
});

export default router;
