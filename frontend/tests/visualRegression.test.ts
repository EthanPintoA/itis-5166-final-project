import { test } from '@playwright/test';
import {
	BatchInfo,
	Configuration,
	EyesRunner,
	VisualGridRunner,
	BrowserType,
	Eyes,
	Target
} from '@applitools/eyes-playwright';

export let Batch: BatchInfo;
export let Config: Configuration;
export let Runner: EyesRunner;

// MAKE SURE TO ADD YOUR API KEY TO YOUR ENVIRONMENT VARIABLES

test.beforeAll(async () => {
	// Configure Applitools SDK to run on the Ultrafast Grid
	Runner = new VisualGridRunner({ testConcurrency: 5 });
	Batch = new BatchInfo({ name: `Personal Budget Test` });

	Config = new Configuration();
	Config.setBatch(Batch);
	Config.addBrowsers(
		{ name: BrowserType.CHROME, width: 800, height: 600 },
		{ name: BrowserType.FIREFOX, width: 1600, height: 1200 },
		{ name: BrowserType.SAFARI, width: 1024, height: 768 }
	);
});

test.describe('Personal Budget', () => {
	let eyes: Eyes;
	test.beforeEach(async ({ page }) => {
		eyes = new Eyes(Runner, Config);

		// Start Applitools Visual AI Test
		// Args: Playwright Page, App Name, Test Name, Viewport Size for local driver
		await eyes.open(page, 'Personal Budget', `Personal Budget Test`, {
			width: 1200,
			height: 600
		});
	});

	test('log into account', async ({ page }) => {
		await page.goto('/login');

		// Full Page - Visual AI Assertion
		await eyes.check('Login page', Target.window().fully());

		await page.fill('input[name="username"]', 'test');
		await page.fill('input[name="password"]', 'test');
		await page.click('button[type="submit"]');
		await page.waitForURL('**/dashboard');

		// Full Page - Visual AI Assertion
		await eyes.check(
			'Dashboard',
			Target.window()
				.fully()
				// Uncomment to apply Layout regions and have test pass
				.layoutRegions('h1:has-text("Dashboard")')
		);
	});
});

test.afterAll(async () => {
	// Wait for Ultrast Grid Renders to finish and gather results
	const results = await Runner.getAllTestResults();
	console.log('Visual test results', results);
});
