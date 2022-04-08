<script>
	import { goto } from '$app/navigation';

	import { getPlayerName, sendRequest } from '$lib/utils';

	export let gameId;
	export let host;
	export let players;
	export let playerId;

	const toggleReady = async () => {
		sendRequest({
			path: '/api/setReady',
			method: 'POST',
			data: {
				gameId,
				playerId
			}
		});
	};

	const leaveGame = async () => {
		sendRequest({
			path: '/api/leaveGame',
			method: 'POST',
			data: {
				gameId,
				playerId
			}
		});

		goto('/');
	};

	const startGame = async () => {
		sendRequest({
			path: '/api/startGame',
			method: 'POST',
			data: {
				gameId
			}
		});
	};
</script>

<div class="min-h-full flex items-center justify-center py-12 px-4">
	<div class="max-w-md w-full space-y-8 text-gray-500 dark:text-white">
		<h2 class="text-center text-3xl font-extrabold">
			Welcome to game {gameId}
		</h2>

		{#if host && playerId}
			<div>
				<h3>Host: {getPlayerName(players, host)}</h3>
				<h3>You are: {getPlayerName(players, playerId)}</h3>
			</div>
		{/if}

		{#if players}
			<div>
				<h3>Players:</h3>
				{#each Object.entries(players) as [id, data]}
					<p>
						{getPlayerName(players, id)}
						({data.ready ? 'Ready' : 'Not Ready'})
					</p>
				{/each}
			</div>
		{/if}

		<button
			on:click|preventDefault={toggleReady}
			class="py-2 px-4 w-full border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
			type="submit"
		>
			{players?.[playerId]?.ready ? "I'm Not Ready" : "I'm Ready"}
		</button>
		{#if host === playerId}
			<button
				on:click|preventDefault={startGame}
				class="py-2 px-4 w-full border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
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
		<p>Join Link: http://localhost:3000/join/{gameId}</p>
		<a href="/" class="pt-4 underline">Back</a>
	</div>
</div>
