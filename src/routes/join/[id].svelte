<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import { randId, sendRequest } from '$lib/utils';

	let playerId = randId(5);
	let playerName;
	let result = 'res goes here';

	async function handleClick() {
		const res = await sendRequest({
			path: '/api/joinGame',
			method: 'POST',
			data: {
				gameId: $page.params.id,
				player: {
					id: playerId,
					name: playerName
				}
			}
		});

		const json = await res.json();
		result = JSON.stringify(json);

		localStorage.setItem('playerId', playerId);

		goto(`/game/${json.gameId}`);
	}
</script>

<div class="min-h-full flex items-center justify-center py-12 px-4">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="text-center text-3xl font-extrabold text-gray-500 dark:text-white">Take6!</h2>
		</div>
		<form class="mt-8 space-y-6">
			<div class="rounded-md shadow-sm">
				<label for="name" />
				<input
					type="text"
					name="playerName"
					id="name"
					class="w-full px-3 py-2 border border-gray-300 text-black"
					placeholder="Player Name"
					bind:value={playerName}
				/>
			</div>
			<div>
				<button
					on:click|preventDefault={handleClick}
					class="py-2 px-4 w-full border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
					type="submit">Join Game</button
				>
			</div>
		</form>
	</div>
</div>
