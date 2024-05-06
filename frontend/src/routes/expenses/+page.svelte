<script lang="ts">
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';
	import { getContext, onMount } from 'svelte';
	import { get, writable, type Writable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { number } from 'yup';

	import { util, api } from '$lib';

	const isLoggedIn = getContext('isLoggedIn') as Writable<boolean>;

	onMount(() => {
		if (!get(isLoggedIn)) {
			goto('/').catch(console.error);
		}
	});

	interface Expenses {
		budget_name: string;
		expense_month: number;
		expense_amount: number;
	}

	type Tuple12<T> = [T, T, T, T, T, T, T, T, T, T, T, T];
	interface ExpensesTable {
		budgetName: string;
		budgetAmount: number;
		expensesPerMonth: Tuple12<number>;
	}

	async function updateCell() {
		try {
			/** Decimal number of 11 digits before the decimal point */
			await number().positive().max(99999999999).required().validate(newExpenseAmount);
		} catch (error) {
			if (error instanceof Error) {
				const t: ToastSettings = { message: error.message, background: 'variant-filled-error' };
				toastStore.trigger(t);
				return;
			}
			console.error(error);
			return;
		}

		if (!editingCell) {
			console.error('No cell to edit');
			return;
		}
		if (!newExpenseAmount) {
			console.error('No new expenses');
			return;
		}

		const token = util.getToken();

		if (!token) {
			console.error('No token found');
		} else {
			const budgetName = editingCell.budgetName;
			const expenseMonth = editingCell.month;
			const newAmount = newExpenseAmount;
			try {
				await api.updateExpense(token, budgetName, expenseMonth, newAmount);
				const data = await api.getExpenses(token);
				const table = await transformData(data);
				tableArr.set(table);
				newExpenseAmount = null;
				editingCell = null;
			} catch (error) {
				console.error(error);
			}
		}
	}

	async function transformData(data: Expenses[]): Promise<ExpensesTable[]> {
		const token = util.getToken();

		if (!token) {
			console.error('No token found');
			return [];
		}

		const budget = await api.getBudget(token);

		const table: ExpensesTable[] = [];

		for (const { name: budgetName, amount: budgetAmount } of budget) {
			const expensesPerMonth: Tuple12<number> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

			for (let i = 1; i <= 12; i++) {
				const month = data.find((d) => d.budget_name === budgetName && d.expense_month === i);
				expensesPerMonth[i - 1] = month ? month.expense_amount : 0;
			}

			table.push({ budgetName, budgetAmount, expensesPerMonth });
		}

		return table;
	}

	const toastStore = getToastStore();

	const tableArr = writable([] as ExpensesTable[]);

	const token = util.getToken();

	if (!token) {
		console.error('No token found');
	} else {
		api
			.getExpenses(token)
			.then((data) => transformData(data))
			.then((table) => tableArr.set(table))
			.catch(console.error);
	}

	let newExpenseAmount: number | null = null;
	let editingCell: { budgetName: string; month: number } | null = null;
</script>

<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-sm">
		<h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
			Expenses Tracker
		</h2>
	</div>

	<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-10xl">
		<div class="space-y-6">
			<div class="table-container">
				<table class="table table-hover w-full table-fixed">
					<thead>
						<tr>
							<th style="width: 10%">Name</th>
							<th>Budget</th>
							<th>Jan</th>
							<th>Feb</th>
							<th>Mar</th>
							<th>Apr</th>
							<th>May</th>
							<th>June</th>
							<th>July</th>
							<th>Aug</th>
							<th>Sep</th>
							<th>Oct</th>
							<th>Nov</th>
							<th>Dec</th>
						</tr>
					</thead>
					<tbody>
						{#each $tableArr as row, i}
							<tr>
								<td class="overflow-ellipsis overflow-hidden whitespace-nowrap">
									{row.budgetName}
								</td>
								<td>${row.budgetAmount}</td>
								{#each row.expensesPerMonth as monthAmount, monthIdx}
									<td>
										<button
											type="button"
											class="btn btn-sm text-sm
                                            {editingCell &&
											editingCell.budgetName === row.budgetName &&
											editingCell.month === monthIdx + 1
												? 'ring-2 ring-teal-200'
												: row.budgetAmount < monthAmount
													? 'ring-2 ring-red-200'
													: 'variant-ringed-surface'}"
											on:click={() => {
												if (
													editingCell &&
													editingCell.budgetName === row.budgetName &&
													editingCell.month === monthIdx + 1
												) {
													editingCell = null;
													newExpenseAmount = null;
												} else {
													editingCell = { budgetName: row.budgetName, month: monthIdx + 1 };
													newExpenseAmount = monthAmount;
												}
											}}
										>
											${monthAmount}
										</button>
									</td>
								{/each}
							</tr>
						{/each}
						<tr>
							<td colspan="2">
								<form on:submit|preventDefault={updateCell}>
									<div class="flex">
										<input
											class="input"
											type="number"
											step="0.01"
											placeholder="Amount"
											name="amount"
											disabled={!editingCell}
											bind:value={newExpenseAmount}
										/>
										<button
											type="submit"
											class="btn variant-outline-surface hover:variant-filled ml-2"
											disabled={!editingCell}
										>
											Update
										</button>
									</div>
								</form>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
