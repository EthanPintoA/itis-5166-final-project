<script lang="ts">
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';
	import { getContext, onMount } from 'svelte';
	import { get, writable, type Writable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { object, string, number } from 'yup';

	import { util, api } from '$lib';

	const isLoggedIn = getContext('isLoggedIn') as Writable<boolean>;

	onMount(() => {
		if (!get(isLoggedIn)) {
			goto('/').catch(console.error);
		}
	});

	interface Budget {
		name: string;
		amount: number;
	}

	const schema = object({
		name: string().max(255).required(),
		/** Decimal number of 11 digits before the decimal point */
		amount: number().positive().max(99999999999).required()
	});

	async function addBudget() {
		try {
			await schema.validate(newBudget);
		} catch (error) {
			if (error instanceof Error) {
				const t: ToastSettings = { message: error.message, background: 'variant-filled-error' };
				toastStore.trigger(t);
				return;
			}
			console.error(error);
			return;
		}

		if (get(tableArr).find((row) => row.name === newBudget.name)) {
			const t: ToastSettings = {
				message: 'Budget already exists',
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			return;
		}

		const token = util.getToken();

		if (!token) {
			console.error('No token found');
		} else {
			const newBudgetName = newBudget.name;
			const newBudgetAmount = newBudget.amount as number;
			try {
				await api.addBudget(token, newBudgetName, newBudgetAmount);

				const data = await api.getBudget(token);
				tableArr.set(data);
			} catch (error) {
				console.error(error);
			}
		}
	}

	async function updateRow(row: number) {
		try {
			await schema.validate(newBudget);
		} catch (error) {
			if (error instanceof Error) {
				const t: ToastSettings = { message: error.message, background: 'variant-filled-error' };
				toastStore.trigger(t);
				return;
			}
			console.error(error);
			return;
		}

		if (get(tableArr).find((r, i) => r.name === newBudget.name && i !== row)) {
			const t: ToastSettings = {
				message: 'Budget already exists',
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			return;
		}

		const token = util.getToken();

		if (!token) {
			console.error('No token found');
		} else {
			const oldBudgetName = get(tableArr)[row].name;
			const newBudgetName = newBudget.name;
			const newBudgetAmount = newBudget.amount as number;
			try {
				await api.updateBudget(token, oldBudgetName, newBudgetName, newBudgetAmount);

				const data = await api.getBudget(token);
				tableArr.set(data);
			} catch (error) {
				console.error(error);
			}
		}
	}

	async function deleteRow(name: string) {
		const token = util.getToken();

		if (!token) {
			console.error('No token found');
		} else {
			try {
				await api.deleteBudget(token, name);

				const data = await api.getBudget(token);
				tableArr.set(data);
			} catch (error) {
				console.error(error);
			}
		}
	}

	const toastStore = getToastStore();

	const tableArr = writable([] as Budget[]);

	const token = util.getToken();

	if (!token) {
		console.error('No token found');
	} else {
		api
			.getBudget(token)
			.then((data) => {
				tableArr.set(data);
			})
			.catch(console.error);
	}

	let newBudget = {
		name: '',
		amount: null
	} as { name: string; amount: number | null };
	let editingRow: number | null = null;
</script>

<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-sm">
		<h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
			Budget Tracker
		</h2>
	</div>

	<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-xl">
		<div class="space-y-6">
			<div class="table-container">
				<table class="table table-hover w-full table-fixed">
					<thead>
						<tr>
							<th>Name</th>
							<th>Amount</th>
							<th>Edit</th>
							<th>Delete</th>
						</tr>
					</thead>
					<tbody>
						{#each $tableArr as row, i}
							<tr>
								<td class="overflow-ellipsis overflow-hidden whitespace-nowrap">{row.name}</td>
								<td>${row.amount}</td>
								<td>
									<button
										class="btn btn-icon"
										on:click={() => {
											if (editingRow === i) {
												editingRow = null;
												newBudget = { name: '', amount: null };
											} else {
												editingRow = i;
												newBudget = { name: row.name, amount: row.amount };
											}
										}}
									>
										<i
											class="fa-solid fa-pen-to-square text-lg {i === editingRow
												? 'text-yellow-300'
												: 'text-teal-200'}"
										></i>
									</button>
								</td>
								<td>
									<button class="btn btn-icon" on:click={() => deleteRow(row.name)}>
										<i class="fa-solid fa-trash text-error-400 text-lg"></i>
									</button>
								</td>
							</tr>
						{/each}
						<tr>
							<td colspan="3">
								<form
									on:submit|preventDefault={editingRow === null
										? addBudget
										: () => {
												// @ts-ignore
												updateRow(editingRow);
											}}
								>
									<div class="flex">
										<input class="input" type="text" placeholder="Name" bind:value={newBudget.name} />
										<input
											class="input ml-4"
											type="number"
											placeholder="Amount"
											bind:value={newBudget.amount}
										/>
										<button type="submit" class="btn variant-outline-surface hover:variant-filled ml-4">
											{editingRow === null ? 'Add' : 'Update'}
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
