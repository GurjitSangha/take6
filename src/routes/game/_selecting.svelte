<script>
	import { firestore as db } from '$lib/firebase';
	import { getPlayerName, getPlayerScore, sendRequest, snapReduce } from '$lib/utils';
	import { collection, onSnapshot } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import Card from './_card.svelte';
	import Profile from './_profile.svelte';
	import Rows from './_rows.svelte';
	import { gameState, handStore, playersStore, scoresStore } from './_store';

	let selectedCards;
	let selectedCardsUnsub;

	let playerPick;

	onMount(() => {
		console.log('selecting mounted');

		selectedCardsUnsub = onSnapshot(
			collection(db, `games/${$gameState.gameId}/selectedCards`),
			(snap) => {
				selectedCards = snapReduce(snap);
				playerPick = selectedCards?.[$gameState.playerId]?.value;
				console.log('selectedCardsSnap', { diff: snap.docChanges(), selectedCards });
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

<div>
	<div class="w-full space-y-8 text-gray-500 dark:text-white">
		{#if $playersStore}
			<div class="flex gap-2 flex-wrap justify-center">
				{#each Object.entries($playersStore) as [id, _]}
					<Profile
						name={getPlayerName($playersStore, id)}
						score={getPlayerScore($scoresStore, id)}
						icon={selectedCards?.[id]?.value ? 'selected' : 'waiting'}
						isPlayer={id === $gameState.playerId}
					/>
				{/each}
			</div>
		{/if}

		<Rows />
	</div>
	<div class="mt-8 flex flex-col items-center">
		Select a card
		<div class="mt-4 gap-1 flex flex-wrap mx-auto" transition:fly={{ y: 10, duration: 500 }}>
			{#each $handStore as value}
				<Card {value} onClick={handleCardClick} selected={playerPick === value} />
			{/each}
		</div>
	</div>
</div>
