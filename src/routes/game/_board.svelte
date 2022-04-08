<script>
	import { getCardScore, getPlayerName } from '$lib/utils';
	import Card from './_card.svelte';

	export let players;
</script>

<div class="min-h-full flex items-center justify-center py-12 px-4">
	<div class="max-w-md w-full space-y-8 text-gray-500 dark:text-white">
		<h2>Now playing!</h2>

		{#if players}
			<div>
				<h3>Players:</h3>
				{#each Object.entries(players) as [id, data]}
					<p>
						{getPlayerName(players, id)}
					</p>
				{/each}
			</div>
		{/if}

		<Card value={32} score={getCardScore(32)} />
	</div>
</div>
