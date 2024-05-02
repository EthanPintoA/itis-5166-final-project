import { Router, Request, Response } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { RowDataPacket } from "mysql2";
import Joi from "joi";

import { getJwtUsername } from "../../util";
import { pool, util as dbUtil } from "../../database";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const username = getJwtUsername(req);

  if (!username) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token" });
    return;
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT name, amount FROM budget WHERE user_id = (SELECT id FROM user WHERE username = ?)",
      [username]
    );

    res.status(StatusCodes.OK).json({ budget: rows });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
  }
});

const addSchema = Joi.object({
  name: Joi.string().trim().required(),
  /** Decimal number of 11 digits before the decimal point */
  amount: Joi.number().positive().max(99999999999).required(),
});

router.post("/add", async (req: Request, res: Response, next) => {
  const username = getJwtUsername(req);

  if (!username) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token" });
    return;
  }

  const name = req.body.name;
  let amount = parseFloat(req.body.amount);
  amount = Number(amount.toFixed(2));

  try {
    await addSchema.validateAsync({ name, amount });
  } catch (err) {
    return next(err);
  }

  try {
    const connection = await pool.getConnection();
    const user_id = await dbUtil.getUserId(username, connection);

    if (!user_id) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send({ message: "User does not exist" });
    }

    const [row] = await connection.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM budget WHERE user_id = ? AND name = ?",
      [user_id, name]
    );

    console.log(row[0].count);

    if (row[0].count) {
      console.log("Budget already exists");
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Budget already exists",
      });
    }

    await connection.query(
      "INSERT INTO budget (user_id, name, amount) VALUES (?, ?, ?)",
      [user_id, name, amount]
    );

    connection.release();

    res.status(StatusCodes.CREATED).send({
      message: "Budget added successfully",
    });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
});

router.put("/update", (_req: Request, res: Response) => {
  res.status(StatusCodes.NOT_IMPLEMENTED).send(ReasonPhrases.NOT_IMPLEMENTED);
});

router.delete("/delete", (_req: Request, res: Response) => {
  res.status(StatusCodes.NOT_IMPLEMENTED).send(ReasonPhrases.NOT_IMPLEMENTED);
});

export default router;
