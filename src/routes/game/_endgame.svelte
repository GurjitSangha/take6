<script>
	import { goto } from '$app/navigation';
	import { getPlayerName, getPlayerScore } from '$lib/utils';
	import { onMount } from 'svelte';
	import Profile from './_profile.svelte';
	import { gameState, playersStore, scoresStore } from './_store';

	$: me = $playersStore?.[$gameState.playerId];
	$: winner = Object.keys($scoresStore)?.sort(
		(a, b) => $scoresStore[a].value - $scoresStore[b].value
	)[0];

	onMount(() => {
		console.log('endgame mounted');
	});
</script>

<div class="min-h-full flex items-center justify-center py-12 px-4">
	<div class="max-w-lg w-full space-y-8 text-gray-500 dark:text-white">
		<h2 class="text-center text-3xl font-extrabold">Game Over!</h2>

		<h3 class="text-center text-5xl font-extrabold">
			The winner is
			<span
				class="text-transparent bg-clip-text bg-gradient-to-tr from-pink-500 via-green-500 to-blue-500"
			>
				{getPlayerName($playersStore, winner)}!
			</span>
		</h3>

		{#if $playersStore}
			<div class="flex gap-2 flex-wrap justify-center">
				{#each Object.entries($playersStore) as [id, data]}
					<Profile
						name={getPlayerName($playersStore, id)}
						score={getPlayerScore($scoresStore, id)}
						isPlayer={id === $gameState.playerId}
					/>
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
