<script>
	import { getPlayerName, getPlayerScore, sendRequest } from '$lib/utils';
	import Hand from './_hand.svelte';
	import Loading from './_loading.svelte';
	import Profile from './_profile.svelte';
	import Rows from './_rows.svelte';
	import Selected from './_selected.svelte';
	import { activeCard, gameState, playersStore, scoresStore, selectedCardsMap } from './_store';

	const onPickRow = async (rowId, isAutoPick = true) => {
		console.log(`I'm going to pick row ${rowId}`);
		if (isAutoPick) {
			// @ts-ignore
			await new Promise((r) => setTimeout(r, parseInt(import.meta.env.VITE_PICK_WAIT_MS, 10)));
		}
		await sendRequest({
			path: '/api/pickRow',
			method: 'POST',
			data: {
				gameId: $gameState.gameId,
				playerId: $gameState.playerId,
				playerName: getPlayerName($playersStore, $gameState.playerId),
				rowId,
				card: $activeCard,
				isAutoPick
			}
		});
		const temp = $selectedCardsMap;
		temp.delete($gameState.playerId);
		selectedCardsMap.set(temp);
	};
</script>

<div class="w-full space-y-8 text-gray-500 dark:text-white">
	{#if $playersStore}
		<div class="flex gap-2 flex-wrap justify-center">
			{#each Object.entries($playersStore) as [id, _]}
				<Profile
					name={getPlayerName($playersStore, id)}
					score={getPlayerScore($scoresStore, id)}
					icon={$selectedCardsMap?.get(id)?.value ? 'selected' : 'waiting'}
					isPlayer={id === $gameState.playerId}
				/>
			{/each}
		</div>
	{/if}

	<Rows onRowClick={onPickRow} />

	<div class="flex justify-center items-center w-full">
		{#if $gameState.state === 'selecting'}
			<Hand />
		{:else if $gameState.state === 'placing'}
			<Selected {onPickRow} />
		{:else}
			<Loading />
		{/if}
	</div>
</div>
