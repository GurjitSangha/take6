<script>
	import { onMount } from 'svelte';

	import Card from './_card.svelte';
	export let rows = [];
	export let pickableRows = [];
	export let onRowClick = (idx) => null;

	$: displayRows = rows?.map((row) => {
		return [0, 1, 2, 3, 4, 5].map((space) => {
			return row[space] || 0;
		});
	});
</script>

{#each displayRows as row, idx}
	<div class="flex flex-wrap items-center gap-4">
		{idx}
		{#if pickableRows.includes(idx.toString())}
			<div
				on:click={() => onRowClick(idx)}
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
	</div>
{/each}
