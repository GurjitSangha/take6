<script>
	import { firestore as db } from '$lib/firebase';
	import { getPlayerName, sendRequest, snapReduce } from '$lib/utils';
	import { collection, getDocs, onSnapshot } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';
	import Card from './_card.svelte';
	import Rows from './_rows.svelte';
	import { gameState } from './_store';

	let rows;
	let rowsUnsub;
	let players;
	let playersUnsub;
	let selectedCards = new Map();
	let selectedCardsUnsub;
	let pickableRows = [];

	let activeCard;
	let activePlayer;

	const getPickableRows = (player, card) => {
		if (player !== $gameState.playerId) return [];
		// get last element of each row
		const lastCards = {};
		rows.forEach((row, idx) => {
			lastCards[idx] = row.values.at(-1);
		});
		// get the rows that have lower last cards
		const res = Object.entries(lastCards)
			.filter(([_, rowEndCard]) => rowEndCard < card)
			.map(([idx]) => idx);
		return res;
	};

	const onPickRow = async (rowId) => {
		console.log(`you've picked row ${rowId}`);
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
		rowsUnsub = onSnapshot(collection(db, `games/${$gameState.gameId}/rows`), (snap) => {
			rows = Object.values(snapReduce(snap));
			console.log('rowsSnap', { rows });
		});

		playersUnsub = onSnapshot(collection(db, `games/${$gameState.gameId}/players`), (snap) => {
			players = snapReduce(snap);
			console.log('playersSnap', { players });
		});

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

				[activeCard, activePlayer] = [...selectedCards]?.[0];
				pickableRows = getPickableRows(activePlayer, activeCard);
				console.log('selectedCardsSnap', { selectedCards, pickableRows });
			}
		);
	});

	onDestroy(() => {
		if (rowsUnsub) rowsUnsub();
		if (playersUnsub) playersUnsub();
		if (selectedCardsUnsub) selectedCardsUnsub();
	});
</script>

<div class="min-h-full flex flex-col items-center justify-center py-12 px-4">
	<div class="max-w-lg w-full space-y-8 text-gray-500 dark:text-white">
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

		<div>Active Player: {getPlayerName(players, activePlayer)}</div>
		<div>You are {getPlayerName(players, $gameState.playerId)}</div>
	</div>
</div>
