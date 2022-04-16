<script>
	import { page } from '$app/stores';
	import { firestore as db } from '$lib/firebase';
	import { sendRequest } from '$lib/utils';
	import { collection, doc, onSnapshot } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';
	import Board from './_board.svelte';
	import Lobby from './_lobby.svelte';
	import Placing from './_placing.svelte';
	import { dbPlayers, dbSelectedCards, gameState } from './_store';

	let unsub;
	let playersUnsub;
	let selectedCardsUnsub;

	let playerId;
	let rows;
	let selectedCards;

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
				acc[doc.id] = doc.data() || null;
				return acc;
			}, {});
			console.log('playersSnap', { players });
			dbPlayers.set(players);
		});

		// Watch for changes to selected cards
		selectedCardsUnsub = onSnapshot(
			collection(db, `games/${$gameState.gameId}/selectedCards`),
			(snap) => {
				const res = snap.docs.reduce((acc, doc) => {
					acc[doc.id] = doc.data();
					return acc;
				}, {});
				console.log('selectedCardsSnap', {
					res
				});
				selectedCards = res;
				// checkAllPlayersSelected();
			}
		);
	});

	const checkAllPlayersSelected = () => {
		if (Object.values($dbSelectedCards).every((v) => v.value)) {
			console.log('all players selected, starting placing');
			sendRequest({
				path: '/api/startPlacing',
				method: 'POST',
				data: {
					gameId: $gameState.gameId
				}
			});
		}
	};

	onDestroy(() => {
		if (unsub) {
			unsub();
		}
		if (playersUnsub) {
			playersUnsub();
		}
		if (selectedCardsUnsub) {
			selectedCardsUnsub();
		}
	});
</script>

{#if $gameState.state === 'lobby'}
	<Lobby players={$dbPlayers} {playerId} {gameId} />
{:else if $gameState.state === 'selecting'}
	<Board players={$dbPlayers} {rows} {selectedCards} />
{:else if $gameState.state === 'placing'}
	<Placing {rows} />
{/if}
