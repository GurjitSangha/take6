<script>
	import { firestore as db } from '$lib/firebase';

	import { getCardScore, getPlayerName } from '$lib/utils';
	import { doc, onSnapshot } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';
	import Card from './_card.svelte';
	import { gameState } from './_store';

	export let players;
	export let rows;
	let hand = [];
	let handUnsub;

	$: {
		console.log('$', { rows });
	}

	onMount(() => {
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
</script>

<div class="min-h-full flex items-center justify-center py-12 px-4">
	<div class="max-w-md w-full space-y-8 text-gray-500 dark:text-white">
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

		{#each rows as row}
			<div class="flex flex-wrap space-x-4">
				{#each row as value}
					<Card {value} score={getCardScore(value)} />
				{/each}
			</div>
		{/each}
	</div>
</div>
<div class="fixed bottom-0 flex flex-wrap mx-auto">
	{#each hand as value}
		<Card {value} score={getCardScore(value)} />
	{/each}
</div>
