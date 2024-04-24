import { Router, Request } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";

import { secretKey } from "./config";

interface UserRequest {
  username: string | undefined;
  password: string | undefined;
}

function generateJwt(username: string): string {
  return jwt.sign({ username }, secretKey, { expiresIn: "1m" });
}

// This is a simple in-memory database
const users = new Map<string, string>();

const router = Router();

router.post("/signup", (req: Request<{}, {}, UserRequest>, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send("Username and password are required!");
    return;
  }

  if (users.has(username)) {
    res.status(StatusCodes.CONFLICT).send("User already exists");
    return;
  }

  users.set(username, password);

  let token = generateJwt(username);

  res.status(StatusCodes.OK).json({ token });
});

router.post("/login", (req: Request<{}, {}, UserRequest>, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send("Username and password are required!");
    return;
  }

  if (!users.has(username) || users.get(username) !== password) {
    res.status(StatusCodes.UNAUTHORIZED).send("Invalid username or password");
    return;
  }

  let token = generateJwt(username);

  res.status(StatusCodes.OK).json({ token });
});

// NOTE: There isn't a logout endpoint because the client needs to delete the token.

export default router;
