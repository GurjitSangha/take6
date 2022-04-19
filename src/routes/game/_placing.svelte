<script>
	import { firestore as db } from '$lib/firebase';
	import { getPlayerName, sendRequest, snapReduce } from '$lib/utils';
	import { collection, getDocs, onSnapshot } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';
	import Card from './_card.svelte';
	import Rows from './_rows.svelte';
	import { gameState } from './_store';

	export let rows = [];
	export let players;
	let selectedCards = new Map();
	let selectedCardsUnsub;
	let pickableRows = [];

	let activeCard;
	let activePlayer;

	const getPickableRows = (player, card) => {
		if (player !== $gameState.playerId) return [];
		console.log(`getPickableRows: ${getPlayerName(players, player)} ${card}`);
		// get last element of each row
		const lastCards = {};
		rows.forEach((row, idx) => {
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
		}

		// There are multiple last cards, so pick the closest one
		if (pickableRows.length > 1) {
			const sorted = pickableRows.sort((a, b) => lastCards[b] - lastCards[a]);
			console.log(`multiple rows are pickable, selecting closest value ${sorted[0]}`);
			onPickRow(sorted[0]);
		}

		return pickableRows;
	};

	const onPickRow = async (rowId) => {
		await sendRequest({
			path: '/api/pickRow',
			method: 'POST',
			data: {
				gameId: $gameState.gameId,
				playerId: $gameState.playerId,
				rowId,
				card: activeCard
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
			(snap) => {
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

				// If all cards have been placed, set game state to 'selecting'
				if (selectedCards.size === 0) {
					sendRequest({
						path: '/api/setGameState',
						method: 'POST',
						data: {
							gameId: $gameState.gameId,
							state: 'selecting'
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
		if (selectedCardsUnsub) selectedCardsUnsub();
	});
</script>

<div class="min-h-full flex flex-col items-center justify-center py-12 px-4">
	<div class="max-w-lg w-full space-y-8 text-gray-500 dark:text-white">
		<p>Active Player: {getPlayerName(players, activePlayer)}</p>
		<p>You are {getPlayerName(players, $gameState.playerId)}</p>
		<Rows {rows} {pickableRows} onRowClick={onPickRow} />

		<div class="flex">
			{#each [...selectedCards] as [card, playerId]}
				{#if card}
					<div class="flex-1">
						<div class="text-sm font-semibold">{getPlayerName(players, playerId)}</div>
						<Card value={card} />
					</div>
				{/if}
			{/each}
		</div>
	</div>
</div>
