import ky from 'ky';

const SERVER_URL = 'http://localhost:3000/api' as const;

// NOTE: ky throws an error if the response status code is not in the 200 range.

/**
 *
 * @throws { ky.HTTPError } If the request fails.
 * @returns The JSON web token.
 */
async function signup(username: string, password: string) {
	const res = await ky.post(`${SERVER_URL}/auth/signup`, {
		json: { username, password }
	});

	const json = (await res.json()) as { token: string };

	return json.token;
}

async function login(username: string, password: string) {
	const res = await ky.post(`${SERVER_URL}/auth/login`, {
		json: { username, password }
	});

	const json = (await res.json()) as { token: string };

	return json.token;
}

function protectedHeader(token: string) {
	return { Authorization: `Bearer ${token}` };
}

/**
 * Renews the token.
 * @param token Current token
 * @returns New token
 * @throws { ky.HTTPError } If the request fails.
 */
async function renewToken(token: string) {
	const res = await ky.post(`${SERVER_URL}/protected/renew`, {
		headers: protectedHeader(token)
	});

	const json = (await res.json()) as { token: string };

	return json.token;
}

/**
 * Gets the budget.
 * @param token JSON web token
 * @returns Budget
 * @throws { ky.HTTPError } If the request fails.
 */
async function getBudget(token: string) {
	const res = await ky.get(`${SERVER_URL}/protected/budget`, {
		headers: protectedHeader(token)
	});

	const json = (await res.json()) as { budget: { name: string; amount: number }[] };

	json.budget.forEach((budget) => {
		budget.amount = parseFloat(budget.amount as unknown as string);
	});

	return json.budget;
}

/**
 * Adds a budget.
 * @param token JSON web token
 * @param name Name of the budget
 * @param amount Amount of the budget
 * @throws { ky.HTTPError } If the request fails.
 */
async function addBudget(token: string, name: string, amount: number) {
	await ky.post(`${SERVER_URL}/protected/budget/add`, {
		headers: protectedHeader(token),
		json: { name, amount }
	});
}

/**
 * Updates a budget.
 * @param token JSON web token
 * @param name Name of the budget
 * @param amount Amount of the budget
 * @throws { ky.HTTPError } If the request fails.
 */
async function updateBudget(token: string, oldName: string, newName: string, amount: number) {
	await ky.put(`${SERVER_URL}/protected/budget/update`, {
		headers: protectedHeader(token),
		json: { oldName, newName, amount }
	});
}

/**
 * Deletes a budget.
 * @param token JSON web token
 * @param name Name of the budget
 * @throws { ky.HTTPError } If the request fails.
 */
async function deleteBudget(token: string, name: string) {
	await ky.delete(`${SERVER_URL}/protected/budget/delete`, {
		headers: protectedHeader(token),
		json: { name }
	});
}

/**
 * Gets all expenses.
 * @param token JSON web token
 * @returns Expenses
 * @throws { ky.HTTPError } If the request fails.
 */
async function getExpenses(token: string) {
	const res = await ky.get(`${SERVER_URL}/protected/expenses`, {
		headers: protectedHeader(token)
	});

	const json = (await res.json()) as {
		expenses: { budget_name: string; expense_month: number; expense_amount: number }[];
	};

	json.expenses.forEach((expense) => {
		expense.expense_amount = parseFloat(expense.expense_amount as unknown as string);
		expense.expense_month = parseInt(expense.expense_month as unknown as string);
	});

	return json.expenses;
}

/**
 * Updates an expense.
 * @param token JSON web token
 * @param name Name of the expense
 * @param month Month of the expense
 * @param amount Amount of the expense
 * @throws { ky.HTTPError } If the request fails.
 */
async function updateExpense(token: string, name: string, month: number, amount: number) {
	await ky.put(`${SERVER_URL}/protected/expenses/update`, {
		headers: protectedHeader(token),
		json: { name, month, amount }
	});
}

export default {
	signup,
	login,
	renewToken,
	getBudget,
	addBudget,
	updateBudget,
	deleteBudget,
	getExpenses,
	updateExpense
};
