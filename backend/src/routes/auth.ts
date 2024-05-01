import { Router, Request } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { RowDataPacket } from "mysql2";

import { secretKey } from "../config";
import { pool } from "../database";

interface UserRequest {
  username: string | undefined;
  password: string | undefined;
}

function generateJwt(username: string): string {
  return jwt.sign({ username }, secretKey, { expiresIn: "1m" });
}

const router = Router();

router.post("/signup", async (req: Request<{}, {}, UserRequest>, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send("Username and password are required!");
    return;
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT username FROM user WHERE username = ?",
      [username]
    );

    if (rows.length !== 0) {
      res.status(StatusCodes.CONFLICT).send("User already exists");
      return;
    }

    await pool.query("INSERT INTO user (username, password) VALUES (?, ?)", [
      username,
      password,
    ]);

    let token = generateJwt(username);

    res.status(StatusCodes.OK).json({ token });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    return;
  }
});

router.post("/login", async (req: Request<{}, {}, UserRequest>, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send("Username and password are required!");
    return;
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT password FROM user WHERE username = ?",
      [username]
    );

    if (rows.length === 0 || rows[0].password !== password) {
      res.status(StatusCodes.UNAUTHORIZED).send("Invalid username or password");
      return;
    }

    let token = generateJwt(username);

    res.status(StatusCodes.OK).json({ token });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    return;
  }
});

// NOTE: There isn't a logout endpoint because the client needs to delete the token.

export default router;
