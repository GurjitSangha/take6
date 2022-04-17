<script>
	import { firestore as db } from '$lib/firebase';
	import { getPlayerName, sendRequest } from '$lib/utils';
	import { doc, getDoc, onSnapshot } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';
	import Card from './_card.svelte';
	import Rows from './_rows.svelte';
	import { gameState } from './_store';

	export let players;
	export let rows;
	export let selectedCards = {};
	let hand = [];
	let handUnsub;
	let selectedCardsUnsub;
	let playerPick;

	onMount(async () => {
		// Load selected value from firebase
		const dbSelected = await getDoc(
			doc(db, `games/${$gameState.gameId}/selectedCards/${$gameState.playerId}`)
		);
		if (dbSelected) {
			playerPick = dbSelected?.data()?.value;
		}

		// Load hand from firebase
		const dbHand = await getDoc(doc(db, `games/${$gameState.gameId}/hands/${$gameState.playerId}`));
		if (dbHand) {
			hand = dbHand.data().value.sort((a, b) => a - b);
		}

		handUnsub = onSnapshot(
			doc(db, `games/${$gameState.gameId}/hands/${$gameState.playerId}`),
			(snap) => {
				const data = snap.data();
				hand = data?.value ? Array.from(data?.value).sort((a, b) => a - b) : [];
				console.log('handsSnap', { hand });
			}
		);
	});

	onDestroy(() => {
		if (handUnsub) {
			handUnsub();
		}
		if (selectedCardsUnsub) {
			selectedCardsUnsub();
		}
	});

	const handleCardClick = (card) => {
		playerPick = card;
		sendRequest({
			path: '/api/selectCard',
			method: 'POST',
			data: {
				gameId: $gameState.gameId,
				playerId: $gameState.playerId,
				card
			}
		});
	};
</script>

<div class="min-h-full flex flex-col items-center justify-center py-12 px-4">
	<div class="max-w-lg w-full space-y-8 text-gray-500 dark:text-white">
		{#if players}
			<div>
				<h3>Players:</h3>
				{#each Object.entries(players) as [id, data]}
					<div>
						{getPlayerName(players, id)}
						{#if selectedCards?.[id]?.value}
							<span>selected</span>
						{:else}
							<span>waiting...</span>
						{/if}
					</div>
				{/each}
			</div>
		{/if}

		<Rows {rows} />
	</div>
</div>
<div class="fixed bottom-0 flex flex-wrap mx-auto">
	{#each hand as value}
		<Card {value} onClick={handleCardClick} selected={playerPick === value} />
	{/each}
</div>
