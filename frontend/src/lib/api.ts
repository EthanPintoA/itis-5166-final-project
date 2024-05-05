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

export default { signup, login, renewToken, getBudget, addBudget, updateBudget, deleteBudget };
