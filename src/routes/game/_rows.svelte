<script>
	import { getCardScore } from '$lib/utils';

	import { onMount } from 'svelte';

	import Card from './_card.svelte';
	export let rows = [];
	export let pickableRows = [];
	export let onRowClick = (idx, isAutoPick) => null;

	let rowScores = [];

	$: displayRows = rows?.map((row) => {
		return [0, 1, 2, 3, 4, 5].map((space) => {
			return row.values[space] || 0;
		});
	});

	$: rowScores = rows?.map((row) => {
		return row.values.reduce((acc, card) => acc + getCardScore(card), 0);
	});

	onMount(() => {
		// rowScores = rows?.map((row) => {
		// 	return row.values.reduce((acc, val) => acc + getCardScore(val), 0);
		// });
		// console.log({ rowScores });
	});
</script>

{#each displayRows as row, idx}
	<div class="flex flex-wrap items-center gap-4">
		{#if pickableRows.includes(idx)}
			<div
				on:click={() => onRowClick(idx, false)}
				class="px-2 py-1 border border-green-500 cursor-pointer rounded"
			>
				Pick
			</div>
		{/if}
		{#each row as value}
			{#if value !== 0}
				<Card {value} />
			{:else}
				<div class="p-4 border border-red-500 rounded w-auto bg-transparent" />
			{/if}
		{/each}
		({rowScores[idx]})
	</div>
{/each}
