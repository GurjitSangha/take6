<script>
	import { page } from '$app/stores';
	import { firestore as db } from '$lib/firebase';
	import { doc, onSnapshot } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';
	import Board from './_board.svelte';
	import Lobby from './_lobby.svelte';
	import { gameState } from './_store';

	let unsub;
	let docRef;
	let playerId;

	$: gameId = $page.params.id;
	onMount(() => {
		docRef = doc(db, `games/${gameId}`);
		playerId = localStorage.getItem('playerId');

		unsub = onSnapshot(docRef, (snap) => {
			const data = snap.data();
			gameState.set({
				state: data.state,
				host: data.host,
				players: data.players
			});
		});
	});

	onDestroy(() => {
		if (unsub) {
			unsub();
		}
	});
</script>

{#if $gameState.state === 'lobby'}
	<Lobby host={$gameState.host} players={$gameState.players} {playerId} {gameId} />
{:else if $gameState.state === 'playing'}
	<Board players={$gameState.players} />
{/if}
