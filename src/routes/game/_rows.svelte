<script>
	import { onMount } from 'svelte';

	import Card from './_card.svelte';
	export let rows = [];

	$: displayRows = rows?.map((row) => {
		return [0, 1, 2, 3, 4, 5].map((space) => {
			return row[space] || 0;
		});
	});
</script>

{#each displayRows as row}
	<div class="flex flex-wrap space-x-4">
		{#each row as value}
			{#if value !== 0}
				<Card {value} />
			{:else}
				<div class="p-4 border border-red-500 rounded w-auto bg-transparent" />
			{/if}
		{/each}
	</div>
{/each}
