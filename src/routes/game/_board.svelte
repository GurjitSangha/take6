<script>
	import { firestore as db } from '$lib/firebase';

	import { getCardScore, getPlayerName, sendRequest } from '$lib/utils';
	import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';
	import Index from '../index.svelte';
	import Id from './[id].svelte';
	import Card from './_card.svelte';
	import { gameState } from './_store';

	export let players;
	export let rows;
	let hand = [];
	let handUnsub;
	let selectedCardsUnsub;
	let playerPick;
	let selectedCards = {};

	$: allPlayersSelected = false;
	$: displayRows = rows.map((row) => {
		return [0, 1, 2, 3, 4, 5].map((space) => {
			return row[space] || 0;
		});
	});

	onMount(async () => {
		// Load selected value from firebase
		const dbSelected = await getDoc(
			doc(db, `games/${$gameState.gameId}/selectedCards/${$gameState.playerId}`)
		);
		if (dbSelected) {
			playerPick = dbSelected?.data()?.value;
			allPlayersSelected = checkAllPlayersSelected();
		}

		// Load hand from firebase
		const dbHand = await getDoc(doc(db, `games/${$gameState.gameId}/hands/${$gameState.playerId}`));
		if (dbHand) {
			hand = dbHand.data().value.sort((a, b) => a - b);
		}

		// Watch for changes to selected values
		selectedCardsUnsub = onSnapshot(
			collection(db, `games/${$gameState.gameId}/selectedCards`),
			(snap) => {
				selectedCards = snap.docs.reduce((acc, doc) => {
					acc[doc.id] = doc.data();
					return acc;
				}, {});
				allPlayersSelected = checkAllPlayersSelected();
				console.log('selectedCardsSnap', {
					selectedCards,
					allPlayersSelected
				});
			}
		);

		handUnsub = onSnapshot(
			doc(db, `games/${$gameState.gameId}/hands/${$gameState.playerId}`),
			(snap) => {
				const data = snap.data();
				hand = data?.value ? Array.from(data?.value).sort((a, b) => a - b) : [];
				console.log('handsSnap', { hand });
			}
		);
	});
	const checkAllPlayersSelected = () => Object.values(selectedCards).every((v) => v.value);

	onDestroy(() => {
		if (handUnsub) {
			handUnsub();
		}
		if (selectedCardsUnsub) {
			selectedCardsUnsub();
		}
	});

	const handleCardClick = (card) => {
		console.log('handleCardClick', card);
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
						{#if allPlayersSelected}
							<Card
								value={selectedCards?.[id]?.value}
								score={getCardScore(selectedCards?.[id]?.value)}
							/>
						{:else}
							<p>waiting...</p>
						{/if}
					</div>
				{/each}
			</div>
		{/if}

		{#each displayRows as row}
			<div class="flex flex-wrap space-x-4">
				{#each row as value}
					{#if value !== 0}
						<Card {value} score={getCardScore(value)} />
					{:else}
						<div class="p-4 border border-red-500 rounded w-auto bg-transparent" />
					{/if}
				{/each}
			</div>
		{/each}
	</div>
</div>
<div class="fixed bottom-0 flex flex-wrap mx-auto">
	{#each hand as value}
		<Card
			{value}
			score={getCardScore(value)}
			onClick={handleCardClick}
			selected={playerPick === value}
		/>
	{/each}
</div>
