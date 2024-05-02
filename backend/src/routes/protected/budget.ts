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

const budgetSchema = Joi.object({
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
    await budgetSchema.validateAsync({ name, amount });
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

    const count = await dbUtil.getBudgetCount(user_id, name, connection);

    if (count) {
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

router.put("/update", async (req: Request, res: Response, next) => {
  const username = getJwtUsername(req);

  if (!username) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token" });
    return;
  }

  const name = req.body.name;
  let amount = parseFloat(req.body.amount);
  amount = Number(amount.toFixed(2));

  try {
    await budgetSchema.validateAsync({ name, amount });
  } catch (err) {
    return next(err);
  }

  try {
    const connection = await pool.getConnection();
    const user_id = await dbUtil.getUserId(username, connection);

    if (!user_id) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "User does not exist" });
    }

    const count = await dbUtil.getBudgetCount(user_id, name, connection);

    if (!count) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Budget does not exist",
      });
    }

    await connection.query(
      "UPDATE budget SET amount = ? WHERE user_id = ? AND name = ?",
      [amount, user_id, name]
    );

    connection.release();

    res.status(StatusCodes.OK).json({
      message: "Budget updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
});

const nameSchema = Joi.object({ name: Joi.string().trim().required() });

router.delete("/delete", async (req: Request, res: Response, next) => {
  const username = getJwtUsername(req);

  if (!username) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token" });
    return;
  }

  const name = req.body.name;

  try {
    await nameSchema.validateAsync({ name });
  } catch (err) {
    return next(err);
  }

  try {
    const connection = await pool.getConnection();
    const user_id = await dbUtil.getUserId(username, connection);

    if (!user_id) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "User does not exist" });
    }

    const count = await dbUtil.getBudgetCount(user_id, name, connection);

    if (!count) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Budget does not exist",
      });
    }

    await connection.query(
      "DELETE FROM budget WHERE user_id = ? AND name = ?",
      [user_id, name]
    );

    connection.release();

    res.status(StatusCodes.OK).json({
      message: "Budget deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
  }
});

export default router;
