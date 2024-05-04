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

export default { signup, login, renewToken };
