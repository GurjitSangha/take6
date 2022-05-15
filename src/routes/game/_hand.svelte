<script>
	import { firestore as db } from '$lib/firebase';
	import { sendRequest, snapReduce } from '$lib/utils';
	import { collection, onSnapshot } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import Card from './_card.svelte';
	import { gameState, handStore, selectedCardsMap } from './_store';

	let selectedCards;
	let selectedCardsUnsub;

	let playerPick;

	onMount(() => {
		selectedCardsUnsub = onSnapshot(
			collection(db, `games/${$gameState.gameId}/selectedCards`),
			(snap) => {
				selectedCards = snapReduce(snap);
				const tempMap = new Map();
				Object.keys(selectedCards).forEach((key) => {
					tempMap.set(key, selectedCards[key]);
				});
				selectedCardsMap.set(tempMap);

				playerPick = selectedCards?.[$gameState.playerId]?.value;
				console.log('selectedCardsSnap', { selectedCardsMap: $selectedCardsMap, selectedCards });
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

<div class="mt-8 flex flex-col items-center">
	Select a card
	<div class="mt-4 gap-1 flex flex-wrap mx-auto" transition:fly={{ y: 10, duration: 500 }}>
		{#each $handStore as value}
			<Card {value} onClick={handleCardClick} selected={playerPick === value} />
		{/each}
	</div>
</div>
