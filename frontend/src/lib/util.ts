/**
 * @returns JSON Web Token from local storage
 */
function getToken(): string | null {
	return localStorage.getItem('token');
}

/**
 * Whether the user is logged in, based on if they have a token
 * @returns Whether the user is logged in
 */
function isLoggedIn(): boolean {
	return getToken() !== null;
}

export default { isLoggedIn };
