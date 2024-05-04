/**
 * @returns JSON Web Token from local storage
 */
function getToken(): string | null {
	return localStorage.getItem('token');
}

/**
 * Check if the user has a valid token
 * @returns Whether the user is logged in
 */
function hasToken(): boolean {
	return getToken() !== null;
}

/**
 * Set the JSON Web Token in local storage
 * @param token JSON Web Token
 */
function setToken(token: string): void {
	localStorage.setItem('token', token);
}

/**
 * Remove the JSON Web Token from local storage
 */
function removeToken(): void {
	localStorage.removeItem('token');
}

export default { setToken, hasToken, removeToken };
