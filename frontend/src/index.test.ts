import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';

import { util } from '$lib';

const mockLocalStorage = (() => {
	let store = {} as Storage;

	return {
		getItem(key: string) {
			return store[key];
		},

		setItem(key: string, value: string) {
			store[key] = value;
		},

		removeItem(key: string) {
			delete store[key];
		},

		clear() {
			store = {} as Storage;
		}
	};
})();

Object.defineProperty(global, 'localStorage', { value: mockLocalStorage });

describe('getTokenExpiration test', () => {
	it('should return null if token is null', () => {
		expect(util.getTokenExpiration()).toBe(null);
	});

	it('should return null if token is invalid', () => {
		localStorage.setItem('token', 'invalid');
		expect(util.getTokenExpiration()).toBe(null);
	});

	it('should return expiration time if token is valid', () => {
		const token = jwt.sign({}, 'fake-secret-key', { expiresIn: '1m' });

		localStorage.setItem('token', token);

		expect(util.getToken()).toBe(token);

		const decoded = jwt.decode(token);

		expect(decoded).not.toBe(null);

		const { exp } = decoded as { exp: number };

		expect(util.getTokenExpiration()).toBe(exp * 1000);
	});
});
