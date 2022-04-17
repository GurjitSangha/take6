<script>
	import { goto } from '$app/navigation';
	import { firestore as db } from '$lib/firebase';
	import { getPlayerName, sendRequest, snapReduce } from '$lib/utils';
	import { collection, onSnapshot } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';
	import { gameState } from './_store';

	let players;
	let playersUnsub;

	$: me = players?.[$gameState.playerId];

	onMount(() => {
		console.log('lobby mounted');
		playersUnsub = onSnapshot(collection(db, `games/${$gameState.gameId}/players`), (snap) => {
			players = snapReduce(snap);
			console.log('playersSnap', { players });
		});
	});

	onDestroy(() => {
		if (playersUnsub) {
			playersUnsub();
		}
	});

	const toggleReady = async () => {
		sendRequest({
			path: '/api/setReady',
			method: 'POST',
			data: {
				gameId: $gameState.gameId,
				playerId: $gameState.playerId
			}
		});
	};

	const leaveGame = async () => {
		sendRequest({
			path: '/api/leaveGame',
			method: 'POST',
			data: {
				gameId: $gameState.gameId,
				playerId: $gameState.playerId
			}
		});

		goto('/');
	};

	const startGame = async () => {
		sendRequest({
			path: '/api/startGame',
			method: 'POST',
			data: {
				gameId: $gameState.gameId
			}
		});
	};
</script>

<div class="min-h-full flex items-center justify-center py-12 px-4">
	<div class="max-w-md w-full space-y-8 text-gray-500 dark:text-white">
		<h2 class="text-center text-3xl font-extrabold">
			Welcome to game {$gameState.gameId}
		</h2>

		{#if $gameState.playerId}
			<div>
				<h3>You are: {getPlayerName(players, $gameState.playerId)}</h3>
				<h3>{me?.isHost ? 'You are the host!' : ''}</h3>
			</div>
		{/if}

		{#if players}
			<div>
				<h3>Players:</h3>
				{#each Object.entries(players) as [id, data]}
					<p>
						{getPlayerName(players, id)}
						({data.isReady ? 'Ready' : 'Not Ready'})
					</p>
				{/each}
			</div>
		{/if}

		<button
			on:click|preventDefault={toggleReady}
			class="py-2 px-4 w-full border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
			type="submit"
		>
			{me?.isReady ? "I'm Not Ready" : "I'm Ready"}
		</button>
		{#if me?.isHost}
			<button
				on:click|preventDefault={startGame}
				class="py-2 px-4 w-full border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
				type="submit"
			>
				Start Game
			</button>
		{/if}
		<button
			on:click|preventDefault={leaveGame}
			class="py-2 px-4 w-full border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
			type="submit"
		>
			Leave Game
		</button>
		<br />
		<p>Join Link: http://localhost:3000/join/{$gameState.gameId}</p>
		<a href="/" class="pt-4 underline">Back</a>
	</div>
</div>
