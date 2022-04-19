<script>
	import { page } from '$app/stores';
	import { firestore as db } from '$lib/firebase';
	import { snapReduce } from '$lib/utils';
	import { collection, doc, getDocs, onSnapshot } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';
	import Board from './_board.svelte';
	import Lobby from './_lobby.svelte';
	import Placing from './_placing.svelte';
	import { gameState } from './_store';

	let unsub;
	let players;
	let playersUnsub;
	let rows;
	let rowsUnsub;
	let hand;
	let handUnsub;
	let scores;
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
		players = snapReduce(dbPlayers);
		console.log('playersInit', { dbPlayers, players });
		playersUnsub = onSnapshot(collection(db, `games/${$gameState.gameId}/players`), (snap) => {
			players = snapReduce(snap);
			console.log('playersSnap', { snap: snap.docs, players });
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

		scoresUnsub = onSnapshot(collection(db, `games/${$gameState.gameId}/scores`), (snap) => {
			scores = snapReduce(snap);
			console.log('scoresSnap', { scores });
		});
	});

	onDestroy(() => {
		if (unsub) unsub();
		if (playersUnsub) playersUnsub();
		if (rowsUnsub) rowsUnsub();
		if (handUnsub) handUnsub();
		if (scoresUnsub) scoresUnsub();
	});
</script>

{#if $gameState.state === 'lobby'}
	<Lobby {players} />
{:else if $gameState.state === 'selecting'}
	<Board {players} {rows} {hand} {scores} />
{:else if $gameState.state === 'placing'}
	<Placing {players} {rows} {scores} />
{/if}
