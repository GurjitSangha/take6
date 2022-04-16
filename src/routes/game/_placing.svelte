<script>
	import { collection, getDocs } from 'firebase/firestore';
	import { firestore as db } from '$lib/firebase';

	import { onMount } from 'svelte';

	import Rows from './_rows.svelte';
	import { dbPlayers, gameState } from './_store';
	import { getPlayerName } from '$lib/utils';
	import Card from './_card.svelte';

	export let rows;
	let selectedCards = new Map();

	$: activePlayer = [...selectedCards]?.[0]?.[1];

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
		console.log({ selectedCards: [...selectedCards] });
	});
</script>

<div class="min-h-full flex flex-col items-center justify-center py-12 px-4">
	<div class="max-w-lg w-full space-y-8 text-gray-500 dark:text-white">
		<Rows {rows} />

		<div class="flex">
			{#each [...selectedCards] as [card, playerId]}
				<div class="flex-1">
					<div class="text-sm font-semibold">{getPlayerName($dbPlayers, playerId)}</div>
					<Card value={card} />
				</div>
			{/each}
		</div>

		<div>Active Player: {getPlayerName($dbPlayers, activePlayer)}</div>
	</div>
</div>
