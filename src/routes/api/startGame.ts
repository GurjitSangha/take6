import { firestore as db } from '$lib/firebase';
import type { RequestHandlerOutput } from '@sveltejs/kit';
import { collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

export async function post({ request }): Promise<RequestHandlerOutput> {
	const { gameId } = await request.json();

	// Get the players for the game
	const playersSnap = await getDocs(collection(db, `games/${gameId}/players`));
	const players = playersSnap.docs.reduce((acc, doc) => {
		acc[doc.id] = doc.data();
		return acc;
	}, {});

	// Create a deck for this game
	let count = 104;
	const deck = Array.from({ length: count }, (_, i) => i + 1);
	while (count > 0) {
		deck.push(deck.splice(Math.floor(Math.random() * count), 1)[0]);
		count -= 1;
	}

	// Create the player hands
	const hands = {};
	Object.keys(players).forEach((playerId) => {
		hands[playerId] = [deck.pop()];
	});
	let cardCount = 9;
	while (cardCount > 0) {
		Object.keys(hands).forEach((playerId) => {
			hands[playerId].push(deck.pop());
		});
		cardCount -= 1;
	}

	// Create the rows
	[0, 1, 2, 3].forEach(async (row) => {
		await setDoc(doc(db, `games/${gameId}/rows/${row}`), {
			values: [deck.pop()]
		});
	});

	// Set the scores, selectedCards, and hands for each player
	Object.keys(players).forEach(async (playerId) => {
		await setDoc(doc(db, `games/${gameId}/scores/${playerId}`), { value: 0 });
		await setDoc(doc(db, `games/${gameId}/selectedCards/${playerId}`), { value: null });
		await setDoc(doc(db, `games/${gameId}/hands/${playerId}`), { value: hands[playerId] });
	});

	// Set the game state to 'selecting'
	await updateDoc(doc(db, 'games', gameId), {
		state: 'selecting'
	});
	console.log(`started game ${gameId}`);

	return {
		status: 200
	};
}
