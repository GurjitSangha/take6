<script>
	import { page } from '$app/stores';
	import { firestore as db } from '$lib/firebase';
	import { doc, onSnapshot } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';
	import Board from './_board.svelte';
	import Lobby from './_lobby.svelte';
	import Placing from './_placing.svelte';
	import { gameState } from './_store';

	let unsub;
	let playerId;

	$: gameId = $page.params.id;
	onMount(() => {
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

		// playersUnsub = onSnapshot(collection(db, `games/${gameId}/players`), (snap) => {
		// 	const players = snap.docs.reduce((acc, doc) => {
		// 		acc[doc.id] = doc.data() || null;
		// 		return acc;
		// 	}, {});
		// 	console.log('playersSnap', { players });
		// 	dbPlayers.set(players);
		// });

		// rowsUnsub = onSnapshot(collection(db, `games/${gameId}/rows`), (snap) => {
		// 	const dbRows = snap.docs.reduce((acc, doc) => {
		// 		acc[doc.id] = doc.data() || null;
		// 		return acc;
		// 	}, {});
		// 	console.log('rowsSnap', { dbRows });
		// 	rows = Object.values(dbRows);
		// 	console.log(rows);
		// });

		// // Watch for changes to selected cards
		// selectedCardsUnsub = onSnapshot(
		// 	collection(db, `games/${$gameState.gameId}/selectedCards`),
		// 	(snap) => {
		// 		const res = snap.docs.reduce((acc, doc) => {
		// 			acc[doc.id] = doc.data();
		// 			return acc;
		// 		}, {});
		// 		console.log('selectedCardsSnap', {
		// 			res
		// 		});
		// 		selectedCards = res;
		// 		checkAllPlayersSelected();
		// 	}
		// );
	});

	onDestroy(() => {
		if (unsub) unsub();
	});
</script>

{#if $gameState.state === 'lobby'}
	<Lobby />
{:else if $gameState.state === 'selecting'}
	<Board />
{:else if $gameState.state === 'placing'}
	<Placing />
{/if}
