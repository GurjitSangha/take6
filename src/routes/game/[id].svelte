<script>
	import { page } from '$app/stores';
	import { firestore as db } from '$lib/firebase';
	import { collection, doc, onSnapshot } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';
	import Board from './_board.svelte';
	import Lobby from './_lobby.svelte';
	import { dbPlayers, gameState } from './_store';

	let unsub;
	let playersUnsub;
	let playerId;

	$: gameId = $page.params.id;
	onMount(() => {
		const docRef = doc(db, `games/${gameId}`);
		playerId = localStorage.getItem('playerId');

		unsub = onSnapshot(docRef, (snap) => {
			const data = snap.data();
			console.log('gameSnap', { data });
			gameState.set({
				state: data.state,
				host: data.host
			});
		});

		const playersCol = collection(db, 'games', gameId, 'players');
		playersUnsub = onSnapshot(playersCol, (snap) => {
			const players = snap.docs.reduce((acc, doc) => {
				acc[doc.id] = doc.data();
				return acc;
			}, {});
			console.log('snap', { players });
			dbPlayers.set(players);
		});
	});

	onDestroy(() => {
		if (unsub) {
			unsub();
		}
		if (playersUnsub) {
			playersUnsub();
		}
	});
</script>

{#if $gameState.state === 'lobby'}
	<Lobby players={$dbPlayers} {playerId} {gameId} />
{:else if $gameState.state === 'playing'}
	<!-- <Board players={$gameState.players} /> -->
{/if}
