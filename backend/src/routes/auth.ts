import { Router, Request } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { RowDataPacket } from "mysql2";
import bcrypt from "bcrypt";
import Joi from "joi";

import { generateJwt } from "../util";
import { pool } from "../database";

interface UserRequest {
  username: string | undefined;
  password: string | undefined;
}

/** The number of rounds to use to generate a salt in bcrypt. */
const saltRounds = 10;

const router = Router();

const signupSchema = Joi.object({
  username: Joi.string().trim().alphanum().max(20).required(),
  password: Joi.string().trim().required(),
});

router.post("/signup", async (req: Request<{}, {}, UserRequest>, res, next) => {
  let { username, password } = req.body;

  try {
    await signupSchema.validateAsync({ username, password });
    username = username as string;
    password = password as string;
  } catch (err) {
    return next(err);
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

    const passwordHash = await bcrypt.hash(password, saltRounds);

    await pool.query("INSERT INTO user (username, password) VALUES (?, ?)", [
      username,
      passwordHash,
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

const loginSchema = Joi.object({
  username: Joi.string().trim().required(),
  password: Joi.string().trim().required(),
});

router.post("/login", async (req: Request<{}, {}, UserRequest>, res, next) => {
  let { username, password } = req.body;

  try {
    await loginSchema.validateAsync({ username, password });
    username = username as string;
    password = password as string;
  } catch (err) {
    return next(err);
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT password FROM user WHERE username = ?",
      [username]
    );

    const userExists = rows.length !== 0;
    const passwordMatches =
      userExists && (await bcrypt.compare(password, rows[0].password));

    if (!passwordMatches) {
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
