<script>
	import { getPlayerName, sendRequest, snapReduce } from '$lib/utils';
	import { firestore as db } from '$lib/firebase';
	import { collection, onSnapshot } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import Card from './_card.svelte';
	import {
		activeCard,
		activePlayer,
		gameState,
		pickableRows,
		playersStore,
		rowsStore,
		selectedCardsMap
	} from './_store';

	export let onPickRow;

	let selectedCardsUnsub;

	const getPickableRows = (player, card) => {
		if (player !== $gameState.playerId) return [];
		// get last element of each row
		const lastCards = {};
		$rowsStore.forEach((row, idx) => {
			lastCards[idx] = row.values[row.values.length - 1];
		});
		// get the rows that have lower last cards
		const rows = Object.entries(lastCards)
			.filter(([_, rowEndCard]) => rowEndCard < card)
			.map(([idx]) => idx);

		if (rows.length === 1) {
			// if only one row is pickable, select it
			console.log(`only one row is pickable, selecting ${rows[0]}`);
			onPickRow(rows[0]);
			return [];
		}

		if (rows.length > 1) {
			// There are multiple last cards, so pick the closest one
			const sorted = rows.sort((a, b) => lastCards[b] - lastCards[a]);
			console.log(`multiple rows are pickable, selecting closest value ${sorted[0]}`);
			onPickRow(sorted[0]);
			return [];
		}

		// There are no pickable rows, let the player pick one
		return [0, 1, 2, 3];
	};

	onMount(() => {
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
				selectedCardsMap.set(tempMap);
				console.log('selectedCardsSnap', { selectedCardsMap: $selectedCardsMap });

				// If all cards have been placed, set game state to 'selecting' after waiting
				if ($selectedCardsMap.size === 0) {
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
					const [card, player] = [...$selectedCardsMap]?.[0];
					activeCard.set(card);
					activePlayer.set(player);
					pickableRows.set(getPickableRows($activePlayer, $activeCard));
				}
			}
		);
	});

	onDestroy(() => {
		if (selectedCardsUnsub) selectedCardsUnsub();
	});
</script>

<div class="flex w-full justify-evenly text-center">
	{#each [...$selectedCardsMap] as [card, playerId]}
		{#if card}
			<div
				class="flex flex-col items-center justify-center"
				transition:fly={{ y: -10, duration: 500 }}
			>
				<div class="text-md font-semibold">{getPlayerName($playersStore, playerId)}</div>
				<Card value={card} />
			</div>
		{/if}
	{/each}
</div>
