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
	let rows;

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
			rows = data.rows ? Object.values(data.rows) : [];
		});

		playersUnsub = onSnapshot(collection(db, `games/${gameId}/players`), (snap) => {
			const players = snap.docs.reduce((acc, doc) => {
				acc[doc.id] = doc.data();
				return acc;
			}, {});
			console.log('playersSnap', { players });
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
	<Board players={$dbPlayers} {rows} />
{/if}
