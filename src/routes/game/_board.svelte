<script>
	import { firestore as db } from '$lib/firebase';

	import { getCardScore, getPlayerName, sendRequest } from '$lib/utils';
	import { doc, getDoc, onSnapshot } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';
	import Card from './_card.svelte';
	import { gameState } from './_store';

	export let players;
	export let rows;
	let hand = [];
	let handUnsub;
	let selectedValue;

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
			selectedValue = dbSelected.data().value;
		}

		console.log({ rows });
		handUnsub = onSnapshot(
			doc(db, `games/${$gameState.gameId}/hands/${$gameState.playerId}`),
			(snap) => {
				const data = snap.data();
				hand = data?.value ? Array.from(data?.value) : [];
				console.log('handsSnap', { hand });
			}
		);
	});

	onDestroy(() => {
		if (handUnsub) {
			handUnsub();
		}
	});

	const handleCardClick = (card) => {
		console.log('handleCardClick', card);
		selectedValue = card;
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

<div class="min-h-full flex items-center justify-center py-12 px-4">
	<div class="max-w-lg w-full space-y-8 text-gray-500 dark:text-white">
		<h2>Now playing!</h2>

		{#if players}
			<div>
				<h3>Players:</h3>
				{#each Object.entries(players) as [id, data]}
					<p>
						{getPlayerName(players, id)}
					</p>
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
			selected={selectedValue === value}
		/>
	{/each}
</div>
