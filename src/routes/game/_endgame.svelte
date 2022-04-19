<script>
	import { goto } from '$app/navigation';
	import { getPlayerName, getPlayerScore, sendRequest } from '$lib/utils';
	import { onMount } from 'svelte';
	import { gameState } from './_store';

	export let players = {};
	export let scores = {};

	$: me = players?.[$gameState.playerId];
	$: winner = Object.keys(scores)?.sort((a, b) => scores[a].value - scores[b].value)[0];

	onMount(() => {
		console.log('endgame mounted');
		console.log({ scores, winner });
	});
</script>

<div class="min-h-full flex items-center justify-center py-12 px-4">
	<div class="max-w-lg w-full space-y-8 text-gray-500 dark:text-white">
		<h2 class="text-center text-3xl font-extrabold">Game Over!</h2>

		<h3 class="text-center font-extrabold">The winner is {getPlayerName(players, winner)}!</h3>

		{#if players}
			<div>
				<h3>Final Scores:</h3>
				{#each Object.entries(players) as [id, data]}
					<div>
						{getPlayerName(players, id)}
						<span>Score: {getPlayerScore(scores, id)}</span>
						{#if id === $gameState.playerId}
							<span>(You)</span>
						{/if}
					</div>
				{/each}
			</div>
		{/if}

		<button
			on:click|preventDefault={() => goto('/')}
			class="py-2 px-4 w-full border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
			type="submit"
		>
			Back to Home
		</button>
	</div>
</div>
