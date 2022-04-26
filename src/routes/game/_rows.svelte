<script>
	import { getCardScore } from '$lib/utils';
	import Card from './_card.svelte';
	import { rowsStore } from './_store';

	export let pickableRows = [];
	export let onRowClick = (idx, isAutoPick) => null;

	let rowScores = [];

	$: displayRows = $rowsStore?.map((row) => {
		return [0, 1, 2, 3, 4, 5].map((space) => {
			return row.values[space] || 0;
		});
	});

	$: rowScores = $rowsStore?.map((row) => {
		return row.values.reduce((acc, card) => acc + getCardScore(card), 0);
	});
</script>

{#each displayRows as row, idx}
	<div class="flex flex-wrap items-center gap-4">
		{#each row as value, idx}
			{#if value !== 0}
				<Card {value} />
			{:else if idx == 5}
				<div class="p-2 border border-red-500 rounded w-14 h-16 bg-transparent" />
			{:else}
				<div class="p-2 border border-slate-500 rounded w-14 h-16 bg-transparent" />
			{/if}
		{/each}
		({rowScores[idx]})
		{#if pickableRows.includes(idx)}
			<div
				on:click={() => onRowClick(idx, false)}
				class="px-2 py-1 border border-green-500 cursor-pointer rounded"
			>
				Pick
			</div>
		{/if}
	</div>
{/each}
