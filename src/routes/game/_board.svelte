<script>
	import { firestore as db } from '$lib/firebase';
	import { getPlayerName, sendRequest, snapReduce } from '$lib/utils';
	import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';
	import Card from './_card.svelte';
	import Rows from './_rows.svelte';
	import { gameState } from './_store';

	let players;
	let playersUnsub;
	let rows;
	let rowsUnsub;
	let selectedCards;
	let selectedCardsUnsub;
	let hand = [];
	let handUnsub;

	let playerPick;

	onMount(async () => {
		console.log('board mounted');
		playersUnsub = onSnapshot(collection(db, `games/${$gameState.gameId}/players`), (snap) => {
			players = snapReduce(snap);
			console.log('playersSnap', { players });
		});

		rowsUnsub = onSnapshot(collection(db, `games/${$gameState.gameId}/rows`), (snap) => {
			rows = Object.values(snapReduce(snap));
			console.log('rowsSnap', { rows });
		});

		handUnsub = onSnapshot(
			doc(db, `games/${$gameState.gameId}/hands/${$gameState.playerId}`),
			(snap) => {
				const data = snap.data();
				hand = data?.value ? Array.from(data?.value).sort((a, b) => a - b) : [];
				console.log('handsSnap', { hand });
			}
		);

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
		if (handUnsub) handUnsub();
		if (playersUnsub) playersUnsub();
		if (rowsUnsub) rowsUnsub();
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
