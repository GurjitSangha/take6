<script>
	import { goto } from '$app/navigation';
	import { getPlayerName, sendRequest } from '$lib/utils';
	import { onMount } from 'svelte';
	import Profile from './_profile.svelte';
	import { gameState } from './_store';

	export let players;
	let shareUrl;

	$: me = players?.[$gameState.playerId];
	$: allAreReady = players && Object.values(players).every((v) => v.isReady);

	onMount(() => {
		console.log('lobby mounted');
		shareUrl = window.location.href.replace('game', 'join');
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
				<h3>{me?.isHost ? 'You are the host!' : ''}</h3>
			</div>
		{/if}

		{#if players}
			<h3>Players:</h3>
			<div class="flex gap-2 flex-wrap justify-center">
				{#each Object.entries(players) as [id, data]}
					<Profile
						name={getPlayerName(players, id)}
						icon={data.isReady ? 'selected' : 'waiting'}
						isPlayer={id === $gameState.playerId}
					/>
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
		{#if me?.isHost && allAreReady}
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
		<p>Join Link: {shareUrl}</p>
		<a href="/" class="pt-4 underline">Back</a>
	</div>
</div>
