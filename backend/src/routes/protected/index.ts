import { Router, Request, Response, NextFunction } from "express";
import { expressjwt } from "express-jwt";
import { StatusCodes } from "http-status-codes";

import { secretKey } from "../../config";
import budgetRouter from "./budget";
import expensesRouter from "./expenses";

import { generateJwt, getJwtUsername } from "../../util";

const router = Router();

// Middleware
router.use(
  expressjwt({
    secret: secretKey,
    algorithms: ["HS256"],
  })
);

router.post("/renew", async (req, res) => {
  const username = getJwtUsername(req);

  if (!username) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token" });
    return;
  }

  const token = generateJwt(username);

  res.status(StatusCodes.OK).json({ token });
});

router.use("/budget", budgetRouter);
router.use("/expenses", expensesRouter);

// Error handlers
router.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  // Handle unauthorized error from express-jwt
  if (err.name !== "UnauthorizedError") {
    next(err);
    return;
  }

  res.status(StatusCodes.UNAUTHORIZED).json({ message: err.message });
});

export default router;
