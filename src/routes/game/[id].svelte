<script>
	import { page } from '$app/stores';
	import { firestore as db } from '$lib/firebase';
	import { getPlayerName } from '$lib/utils';
	import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';
	import { gameState } from './_store';

	let unsub;
	let docRef;
	let playerId;

	$: gameId = $page.params.id;
	onMount(() => {
		docRef = doc(db, `games/${gameId}`);
		playerId = localStorage.getItem('playerId');
		console.log({ playerId });

		unsub = onSnapshot(docRef, (snap) => {
			// console.log(snap);
			// console.log(snap.data());
			gameState.set(snap.data());
		});
	});

	const handleClick = async () => {
		await fetch('/api/setReady', {
			method: 'POST',
			body: JSON.stringify({
				gameId,
				playerId: localStorage.getItem('playerId')
			})
		});
	};

	// onDestroy(() => unsub());
</script>

<div class="min-h-full flex items-center justify-center py-12 px-4">
	<div class="max-w-md w-full space-y-8 text-gray-500 dark:text-white">
		<h2 class="text-center text-3xl font-extrabold">
			Welcome to game {gameId}
		</h2>

		{#if $gameState.host && playerId}
			<div>
				<h3>Host: {getPlayerName($gameState.players, $gameState.host)}</h3>
				<h3>You are: {$gameState.players[playerId].name}</h3>
			</div>
		{/if}

		{#if $gameState.players}
			<div>
				<h3>Players:</h3>
				{#each Object.entries($gameState.players) as [id, data]}
					<p>{data.name} <span>({data.ready ? 'Ready' : 'Not Ready'})</span></p>
				{/each}
			</div>
		{/if}

		<button
			on:click|preventDefault={handleClick}
			class="py-2 px-4 w-full border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
			type="submit"
		>
			{$gameState.players?.[playerId]?.ready ? "I'm Not Ready" : "I'm Ready"}
		</button>
		<br />
		<p>Join Link: http://localhost:3000/join/{gameId}</p>
		<a href="/" class="pt-4 underline">Back</a>
	</div>
</div>
