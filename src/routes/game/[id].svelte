<script>
	import { page } from '$app/stores';
	import { firestore as db } from '$lib/firebase';
	import { snapReduce } from '$lib/utils';
	import { collection, doc, getDocs, onSnapshot } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';
	import Board from './_board.svelte';
	import Endgame from './_endgame.svelte';
	import Lobby from './_lobby.svelte';
	import Placing from './_placing.svelte';
	import { gameState, handStore, playersStore, rowsStore, scoresStore } from './_store';

	let unsub;
	let playersUnsub;
	let rowsUnsub;
	let handUnsub;
	let scoresUnsub;

	let playerId;
	$: gameId = $page.params.id;

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
			console.log('playersSnap', { snap: snap.docs, playersStore: $playersStore });
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
	});

	onDestroy(() => {
		if (unsub) unsub();
		if (playersUnsub) playersUnsub();
		if (rowsUnsub) rowsUnsub();
		if (handUnsub) handUnsub();
		if (scoresUnsub) scoresUnsub();
	});

	const views = {
		lobby: Lobby,
		placing: Placing,
		selecting: Board,
		finished: Endgame
	};

	$: activeView = views[$gameState.state] || '';
</script>

{#if activeView}
	<svelte:component this={activeView} />
{/if}
