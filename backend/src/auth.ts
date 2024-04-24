import { Router, Request } from "express";
import { StatusCodes } from "http-status-codes";

interface UserRequest {
  username: string | undefined;
  password: string | undefined;
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

  res.status(StatusCodes.CREATED).send("User created successfully");
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

  res.status(StatusCodes.OK).send("Login successful");
});

export default router;
