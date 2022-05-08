<script>
	import { firestore as db } from '$lib/firebase';
	import { getPlayerName, getPlayerScore, sendRequest, snapReduce } from '$lib/utils';
	import { collection, getDocs, onSnapshot } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import Card from './_card.svelte';
	import Profile from './_profile.svelte';
	import Rows from './_rows.svelte';
	import { gameState, playersStore, rowsStore, scoresStore } from './_store';

	let selectedCards = new Map();
	let selectedCardsUnsub;
	let pickableRows = [];

	let activeCard;
	let activePlayer;

	const getPickableRows = (player, card) => {
		if (player !== $gameState.playerId) return [];
		// get last element of each row
		const lastCards = {};
		$rowsStore.forEach((row, idx) => {
			lastCards[idx] = row.values[row.values.length - 1];
		});
		// get the rows that have lower last cards
		const pickableRows = Object.entries(lastCards)
			.filter(([_, rowEndCard]) => rowEndCard < card)
			.map(([idx]) => idx);

		if (pickableRows.length === 1) {
			// if only one row is pickable, select it
			console.log(`only one row is pickable, selecting ${pickableRows[0]}`);
			onPickRow(pickableRows[0]);
			return [];
		}

		if (pickableRows.length > 1) {
			// There are multiple last cards, so pick the closest one
			const sorted = pickableRows.sort((a, b) => lastCards[b] - lastCards[a]);
			console.log(`multiple rows are pickable, selecting closest value ${sorted[0]}`);
			onPickRow(sorted[0]);
			return [];
		}

		// There are no pickable rows, let the player pick one
		return [0, 1, 2, 3];
	};

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
				card: activeCard,
				isAutoPick
			}
		});
		const temp = selectedCards;
		temp.delete($gameState.playerId);
		selectedCards = temp;
	};

	onMount(async () => {
		console.log('placing mounted');
		selectedCardsUnsub = onSnapshot(
			collection(db, `games/${$gameState.gameId}/selectedCards`),
			async (snap) => {
				const cards = snapReduce(snap);
				// Sort by card value with a Map
				const tempMap = new Map();
				Object.keys(cards)
					.filter((playerId) => cards[playerId].value !== null)
					.sort((a, b) => cards[a].value - cards[b].value)
					.forEach((playerId) => {
						tempMap.set(cards[playerId].value, playerId);
					});
				selectedCards = tempMap;
				console.log('selectedCardsSnap', { selectedCards });

				// If all cards have been placed, set game state to 'selecting' after waiting
				if (selectedCards.size === 0) {
					// @ts-ignore
					await new Promise((r) => setTimeout(r, parseInt(import.meta.env.VITE_PICK_WAIT_MS, 10)));
					sendRequest({
						path: '/api/setGameState',
						method: 'POST',
						data: {
							gameId: $gameState.gameId,
							state: 'selecting',
							players: $playersStore
						}
					});
				} else {
					[activeCard, activePlayer] = [...selectedCards]?.[0];
					pickableRows = getPickableRows(activePlayer, activeCard);
				}
			}
		);
	});

	onDestroy(() => {
		console.log('placing destroyed');
		if (selectedCardsUnsub) selectedCardsUnsub();
	});
</script>

<div class="w-full space-y-8 text-gray-500 dark:text-white">
	<div class="flex gap-2 flex-wrap justify-center">
		{#each Object.keys($playersStore) as id}
			<Profile
				name={getPlayerName($playersStore, id)}
				score={getPlayerScore($scoresStore, id)}
				icon={id === activePlayer ? 'waiting' : ''}
				isPlayer={id === $gameState.playerId}
			/>
		{/each}
	</div>
	<Rows {pickableRows} onRowClick={onPickRow} />

	<div class="flex justify-evenly text-center">
		{#each [...selectedCards] as [card, playerId]}
			{#if card}
				<div
					class="flex flex-col align-center justify-center"
					transition:fly={{ y: -10, duration: 500 }}
				>
					<div class="text-md font-semibold">{getPlayerName($playersStore, playerId)}</div>
					<Card value={card} />
				</div>
			{/if}
		{/each}
	</div>
</div>
