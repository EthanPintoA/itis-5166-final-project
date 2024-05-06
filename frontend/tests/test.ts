import { expect, test } from '@playwright/test';

// MAKE SURE TO CREATE USER 'test' WITH PASSWORD 'test' BEFORE RUNNING TESTS

test('index page has expected heading', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Welcome to Personal Budget App' })).toBeVisible();
});

test('index page has expected link to login and signup', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Signup' })).toBeVisible();
});

test('login page has expected heading', async ({ page }) => {
	await page.goto('/login');
	await expect(page.getByRole('heading', { name: 'Log in to your account' })).toBeVisible();
});

test('signup page has expected heading', async ({ page }) => {
	await page.goto('/signup');
	await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
});

test('log in', async ({ page }) => {
	await page.goto('/');
	await page.click('text=Login');

	await page.fill('input[name="username"]', 'test');
	await page.fill('input[name="password"]', 'test');
	await page.click('button[type="submit"]');
	await page.waitForURL('**/dashboard');

	await page.click('text=Logout');
	await page.waitForURL('**/');
});

test('add and delete budget', async ({ page }) => {
	await page.goto('/login');
	await page.fill('input[name="username"]', 'test');
	await page.fill('input[name="password"]', 'test');
	await page.click('button[type="submit"]');
	await page.waitForURL('**/dashboard');

	expect(page.url()).toBe('http://localhost:4173/dashboard');

	await page.click('a:has-text("Budget")');
	await page.waitForURL('**/budget');

	await page.fill('input[name="name"]', 'testBudget');
	await page.fill('input[name="amount"]', '51.73');
	await page.click('button[type="submit"]');

	await page.waitForSelector('td:has-text("testBudget")');

	await page.click('.fa-trash');
	await page.waitForSelector('td:has-text("testBudget")', { state: 'detached' });
});
