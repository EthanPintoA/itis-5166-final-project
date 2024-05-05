<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { get, type Writable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { Chart } from 'chart.js/auto';

	import { api, util } from '$lib';

	const isLoggedIn = getContext('isLoggedIn') as Writable<boolean>;

	let donutChart: HTMLCanvasElement;
	let lineChart: HTMLCanvasElement;
	let barChart: HTMLCanvasElement;

	onMount(async () => {
		if (!get(isLoggedIn)) {
			goto('/').catch(console.error);
			return;
		}

		const token = util.getToken();

		if (!token) {
			console.error('No token found');
			return;
		}
		try {
			const budget = await api.getBudget(token);
			const donutCtx = donutChart.getContext('2d');

			if (!donutCtx) {
				console.error('Could not get context');
				return;
			}

			createDonutChart(budget, donutCtx);

			const expenses = await api.getExpenses(token);
			const lineCtx = lineChart.getContext('2d');

			if (!lineCtx) {
				console.error('Could not get context');
				return;
			}

			createLineChart(budget, expenses, lineCtx);

			const barCtx = barChart.getContext('2d');

			if (!barCtx) {
				console.error('Could not get context');
				return;
			}

			createBarChart(budget, expenses, barCtx);
		} catch (error) {
			console.error(error);
		}
	});

	function createDonutChart(
		budget: { name: string; amount: number }[],
		ctx: CanvasRenderingContext2D
	) {
		const data = {
			labels: budget.map((b) => b.name),
			datasets: [
				{
					label: 'Budgets',
					data: budget.map((b) => b.amount),
					backgroundColor: [
						'rgb(255, 99, 132)',
						'rgb(54, 162, 235)',
						'rgb(255, 206, 86)',
						'rgb(75, 192, 192)',
						'rgb(153, 102, 255)',
						'rgb(255, 159, 64)'
					],
					hoverOffset: 10
				}
			]
		};
		const options = {
			aspectRatio: 1.5,

			plugins: {
				title: {
					display: true,
					text: 'Budgets',
					font: {
						size: 20
					},
					color: 'white'
				},
				legend: {
					labels: {
						font: {
							size: 14
						},
						color: 'white'
					}
				}
			}
		};

		new Chart(ctx, {
			type: 'doughnut',
			data,
			options
		});
	}

	function createLineChart(
		budget: { name: string; amount: number }[],
		expenses: { budget_name: string; expense_month: number; expense_amount: number }[],
		ctx: CanvasRenderingContext2D
	) {
		const data = {
			labels: [
				'Jan',
				'Feb',
				'Mar',
				'Apr',
				'May',
				'June',
				'July',
				'Aug',
				'Sep',
				'Oct',
				'Nov',
				'Dec'
			],
			datasets: budget.map((b) => {
				const expensesForBudget = expenses.filter((e) => e.budget_name === b.name);
				const data = Array.from({ length: 12 }, (_, i) => {
					const month = i + 1;
					const expense = expensesForBudget.find((e) => e.expense_month === month);
					return expense ? expense.expense_amount : 0;
				});

				return {
					label: b.name,
					data,
					fill: false,
					borderColor: [
						'rgb(75, 192, 192)',
						'rgb(255, 99, 132)',
						'rgb(54, 162, 235)',
						'rgb(255, 206, 86)',
						'rgb(153, 102, 255)',
						'rgb(255, 159, 64)'
					],
					tension: 0.1
				};
			})
		};

		const options = {
			aspectRatio: 1.5,
			plugins: {
				title: {
					display: true,
					text: 'Expenses by Month',
					font: {
						size: 20
					},
					color: 'white'
				},
				legend: {
					labels: {
						font: {
							size: 14
						},
						color: 'white'
					}
				}
			},
			scales: {
				x: { ticks: { color: 'white' }, grid: { color: 'gray' } },
				y: { ticks: { color: 'white' }, grid: { color: 'gray' } }
			}
		};

		new Chart(ctx, {
			type: 'line',
			data,
			options
		});
	}

	function createBarChart(
		budget: { name: string; amount: number }[],
		expenses: { budget_name: string; expense_month: number; expense_amount: number }[],
		ctx: CanvasRenderingContext2D
	) {
		const data = {
			labels: budget.map((b) => b.name),
			datasets: [
				{
					label: 'Budgets',
					data: budget.map((b) => b.amount),
					backgroundColor: [
						'rgb(255, 99, 132)',
						'rgb(54, 162, 235)',
						'rgb(255, 206, 86)',
						'rgb(75, 192, 192)',
						'rgb(153, 102, 255)',
						'rgb(255, 159, 64)'
					]
				},
				{
					label: 'Expenses',
					data: budget.map((b) => {
						const expensesForBudget = expenses.filter((e) => e.budget_name === b.name);
						return expensesForBudget.reduce((max, e) => Math.max(max, e.expense_amount), 0);
					}),
					backgroundColor: [
						'rgb(255, 99, 132)',
						'rgb(54, 162, 235)',
						'rgb(255, 206, 86)',
						'rgb(75, 192, 192)',
						'rgb(153, 102, 255)',
						'rgb(255, 159, 64)'
					]
				}
			]
		};
		const options = {
			aspectRatio: 3,
			plugins: {
				title: {
					display: true,
					text: 'Budgets vs Expenses',
					font: {
						size: 20
					},
					color: 'white'
				},
				legend: {
					labels: {
						font: {
							size: 14
						},
						color: 'white'
					}
				}
			},
			scales: {
				x: { ticks: { color: 'white' }, grid: { color: 'gray' } },
				y: { ticks: { color: 'white' }, grid: { color: 'gray' } }
			}
		};
		new Chart(ctx, {
			type: 'bar',
			data,
			options
		});
	}
</script>

<h1 class="text-center h1 my-10">Dashboard</h1>

<div class="flex">
	<div class="w-1/2">
		<canvas bind:this={donutChart} id="donutChart" class="w-1"></canvas>
	</div>
	<div class="w-1/2">
		<canvas bind:this={lineChart} id="lineChart"></canvas>
	</div>
</div>
<div class="w-11/12 mx-auto">
	<canvas bind:this={barChart} id="barChart"></canvas>
</div>
