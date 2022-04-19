<script>
	import { firestore as db } from '$lib/firebase';
	import { getPlayerName, getPlayerScore, sendRequest, snapReduce } from '$lib/utils';
	import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';
	import Card from './_card.svelte';
	import Rows from './_rows.svelte';
	import { gameState } from './_store';

	export let players;
	export let rows;
	export let hand = [];
	export let scores;
	let selectedCards;
	let selectedCardsUnsub;

	let playerPick;

	onMount(async () => {
		console.log('board mounted');

		selectedCardsUnsub = onSnapshot(
			collection(db, `games/${$gameState.gameId}/selectedCards`),
			(snap) => {
				selectedCards = snapReduce(snap);
				playerPick = selectedCards?.[$gameState.playerId]?.value;
				console.log('selectedCardsSnap', { selectedCards });
				checkAllPlayersSelected();
			}
		);
	});

	const checkAllPlayersSelected = () => {
		if (Object.values(selectedCards).every((v) => v.value)) {
			console.log('all players selected, starting placing');
			sendRequest({
				path: '/api/setGameState',
				method: 'POST',
				data: {
					gameId: $gameState.gameId,
					state: 'placing'
				}
			});
		}
	};

	onDestroy(() => {
		if (selectedCardsUnsub) selectedCardsUnsub();
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
	<div class="max-w-xl w-full space-y-8 text-gray-500 dark:text-white">
		{#if players}
			<div>
				<h3>Players:</h3>
				{#each Object.entries(players) as [id, data]}
					<div>
						{getPlayerName(players, id)} Score: {getPlayerScore(scores, id)}
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
