<script>
	import { page } from '$app/stores';
	import { firestore as db } from '$lib/firebase';
	import { getPlayerName } from '$lib/utils';
	import { doc, onSnapshot } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';
	import { gameState } from './_store';

	let unsub;

	$: gameId = $page.params.id;
	onMount(() => {
		const docRef = doc(db, `games/${gameId}`);

		unsub = onSnapshot(docRef, (snap) => {
			console.log(snap);
			console.log(snap.data());
			gameState.set(snap.data());
		});
	});

	// onDestroy(() => unsub());
</script>

<div class="min-h-full flex items-center justify-center py-12 px-4">
	<div class="max-w-md w-full space-y-8 text-gray-500 dark:text-white">
		<h2 class="text-center text-3xl font-extrabold">
			Welcome to game {gameId}
		</h2>

		{#if $gameState.host}
			<div>
				<h3>Host: {getPlayerName($gameState.players, $gameState.host)}</h3>
			</div>
		{/if}

		{#if $gameState.players}
			<div>
				<h3>Players:</h3>
				{#each $gameState.players as player}
					<p>{player.name}</p>
				{/each}
			</div>
		{/if}

		<a href="/" class="pt-8 underline">Back</a>
	</div>
</div>
