<script>
	import { page } from '$app/stores';
	import { firestore as db } from '$lib/firebase';
	import { snapReduce } from '$lib/utils';
	import { collection, doc, getDocs, onSnapshot } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import Endgame from './_endgame.svelte';
	import Lobby from './_lobby.svelte';
	import Ingame from './_ingame.svelte';
	import { gameState, handStore, playersStore, rowsStore, scoresStore } from './_store';

	let unsub;
	let playersUnsub;
	let rowsUnsub;
	let handUnsub;
	let scoresUnsub;
	let eventsUnsub;

	let playerId;
	$: gameId = $page.params.id;
	let events = [];
	let showEvents = false;

	onMount(async () => {
		playerId = localStorage.getItem('playerId');

		unsub = onSnapshot(doc(db, `games/${gameId}`), (snap) => {
			const data = snap.data();
			console.log('gameSnap', { data });
			gameState.set({
				state: data.state,
				gameId,
				playerId
			});
		});

		const dbPlayers = await getDocs(collection(db, `games/${gameId}/players`));
		playersStore.set(dbPlayers);
		playersUnsub = onSnapshot(collection(db, `games/${$gameState.gameId}/players`), (snap) => {
			playersStore.set(snapReduce(snap));
			console.log('playersSnap', { playersStore: $playersStore });
		});

		rowsUnsub = onSnapshot(collection(db, `games/${$gameState.gameId}/rows`), (snap) => {
			rowsStore.set(Object.values(snapReduce(snap)));
			console.log('rowsSnap', { rows: $rowsStore });
		});

		handUnsub = onSnapshot(
			doc(db, `games/${$gameState.gameId}/hands/${$gameState.playerId}`),
			(snap) => {
				const data = snap.data();
				handStore.set(data?.value ? Array.from(data?.value).sort((a, b) => a - b) : []);
				console.log('handsSnap', { hand: $handStore });
			}
		);

		scoresUnsub = onSnapshot(collection(db, `games/${$gameState.gameId}/scores`), (snap) => {
			scoresStore.set(snapReduce(snap));
			console.log('scoresSnap', { scores: $scoresStore });
		});

		eventsUnsub = onSnapshot(doc(db, `games/${$gameState.gameId}`), (snap) => {
			events = snap.data()?.events ?? [];
			console.log('eventsSnap', { events });
		});
	});

	onDestroy(() => {
		if (unsub) unsub();
		if (playersUnsub) playersUnsub();
		if (rowsUnsub) rowsUnsub();
		if (handUnsub) handUnsub();
		if (scoresUnsub) scoresUnsub();
		if (eventsUnsub) eventsUnsub();
	});
</script>

<div class="min-h-full max-w-2xl mx-auto flex flex-col items-center justify-center py-12 px-4">
	{#if $gameState.state == 'lobby'}
		<Lobby />
	{:else if $gameState.state == 'finished'}
		<Endgame />
	{:else}
		<Ingame />
	{/if}
	<p
		on:click={() => (showEvents = !showEvents)}
		class="px-4 py-2 border border-blue-500 rounded my-4 cursor-pointer"
	>
		Toggle Event Log
	</p>
	{#if showEvents}
		<div transition:slide class="w-full h-20 overflow-scroll self-start">
			{#each events.reverse() as event}
				<p class="first:text-green-500">{event}</p>
			{/each}
		</div>
	{/if}
</div>
