<script>
	import { collection, getDocs } from 'firebase/firestore';
	import { firestore as db } from '$lib/firebase';

	import { onMount } from 'svelte';

	import Rows from './_rows.svelte';
	import { dbPlayers, gameState } from './_store';
	import { getPlayerName, sendRequest } from '$lib/utils';
	import Card from './_card.svelte';

	export let rows;
	let selectedCards = new Map();

	$: activeCard = [...selectedCards]?.[0]?.[0];
	$: activePlayer = [...selectedCards]?.[0]?.[1];
	$: pickableRows = [];

	const getPickableRows = (player, card) => {
		if (player !== $gameState.playerId) return [];
		// get last element of each row
		const lastCards = {};
		rows.forEach((row, idx) => {
			lastCards[idx] = row.values.at(-1);
		});
		const res = Object.entries(lastCards)
			.filter(([_, rowEndCard]) => rowEndCard < card)
			.map(([idx]) => idx);
		console.log({ rows, res });
		return res;
	};

	const onPickRow = (rowId) => {
		console.log(`you've picked row ${rowId}`);
		sendRequest({
			path: '/api/pickRow',
			method: 'POST',
			data: {
				gameId: $gameState.gameId,
				playerId: $gameState.playerId,
				rowId,
				card: activeCard
			}
		});
	};

	onMount(async () => {
		// get the selected cards from the db
		const snap = await getDocs(collection(db, `games/${$gameState.gameId}/selectedCards`));
		let cards = {};
		snap.forEach((doc) => {
			cards[doc.data().value] = doc.id;
		});
		const tempMap = new Map();
		// Sort by card value
		Object.keys(cards)
			// @ts-ignore
			.sort((a, b) => a - b)
			.forEach((card) => {
				tempMap.set(card, cards[card]);
			});
		selectedCards = tempMap;

		[activeCard, activePlayer] = [...selectedCards]?.[0];
		pickableRows = getPickableRows(activePlayer, activeCard);
	});
</script>

<div class="min-h-full flex flex-col items-center justify-center py-12 px-4">
	<div class="max-w-lg w-full space-y-8 text-gray-500 dark:text-white">
		<Rows {rows} {pickableRows} onRowClick={onPickRow} />

		<div class="flex">
			{#each [...selectedCards] as [card, playerId]}
				{#if card}
					<div class="flex-1">
						<div class="text-sm font-semibold">{getPlayerName($dbPlayers, playerId)}</div>
						<Card value={card} />
					</div>
				{/if}
			{/each}
		</div>

		<div>Active Player: {getPlayerName($dbPlayers, activePlayer)}</div>
	</div>
</div>
