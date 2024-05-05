import { Router, Request, Response } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { RowDataPacket } from "mysql2";
import Joi from "joi";

import { getJwtUsername } from "../../util";
import { pool, util as dbUtil } from "../../database";

const router = Router();

/**
 * Get all expenses for the user. If no expenses are found, an empty array is returned.
 * This means that the user should treat this as expenses being $0.00.
 */
router.get("/", async (req: Request, res: Response) => {
  const username = getJwtUsername(req);

  if (!username) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token" });
    return;
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT budget_name, expense_amount, expense_month
      FROM budget_expense
        WHERE user_id = (SELECT id FROM user WHERE username = ?)`,
      [username]
    );

    res.status(StatusCodes.OK).json({ expenses: rows });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
  }
});

const expensesSchema = Joi.object({
  name: Joi.string().trim().required(),
  month: Joi.number().integer().min(1).max(12).required(),
  /** Decimal number of 11 digits before the decimal point */
  amount: Joi.number().positive().max(99999999999).required(),
});

/**
 * Add a new expense for the user or update an existing expense.
 */
router.put("/update", async (req: Request, res: Response, next) => {
  const username = getJwtUsername(req);

  if (!username) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token" });
    return;
  }

  const name = req.body.name;
  const month = parseInt(req.body.month);
  let amount = parseFloat(req.body.amount);
  amount = Number(amount.toFixed(2));

  try {
    await expensesSchema.validateAsync({ name, month, amount });
  } catch (err) {
    return next(err);
  }

  try {
    const connection = await pool.getConnection();
    const user_id = await dbUtil.getUserId(username, connection);

    if (!user_id) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid token" });
    }

    await connection.beginTransaction();

    const [budgetRow] = await connection.query<RowDataPacket[]>(
      "SELECT id FROM budget WHERE user_id = ? AND name = ?",
      [user_id, name]
    );

    if (!budgetRow.length) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Budget not found" });
    }

    const budget_id = budgetRow[0].id as number;

    const [expenseRow] = await connection.query<RowDataPacket[]>(
      "SELECT id FROM expense WHERE budget_id = ? AND month = ?",
      [budget_id, month]
    );

    if (expenseRow.length) {
      const expense_id = expenseRow[0].id as number;
      await connection.query("UPDATE expense SET amount = ? WHERE id = ?", [
        amount,
        expense_id,
      ]);
    } else {
      await connection.query(
        "INSERT INTO expense (budget_id, month, amount) VALUES (?, ?, ?)",
        [budget_id, month, amount]
      );
    }

    await connection.commit();
    connection.release();

    res.status(StatusCodes.OK).json({ message: "Expense updated" });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
  }
});

// Note: The DELETE method is not implemented for expenses because it is not necessary.
// The user can simply update the expense to $0.00 if they want to "remove" it.
// If the user wants to remove the budget, they can do so in the budgets route
// and that will remove all expenses associated with that budget.

export default router;
