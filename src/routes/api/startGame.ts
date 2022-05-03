import { firestore as db } from '$lib/firebase';
import { redeal } from '$lib/utils';
import type { RequestHandlerOutput } from '@sveltejs/kit';
import { collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { logEvent } from './_logEvent';

export async function post({ request }): Promise<RequestHandlerOutput> {
	const { gameId } = await request.json();

	// Get the players for the game
	const playersSnap = await getDocs(collection(db, `games/${gameId}/players`));
	const players = playersSnap.docs.reduce((acc, doc) => {
		acc[doc.id] = doc.data();
		return acc;
	}, {});

	const { hands, rows } = redeal(players);

	// Save the rows
	rows.forEach(async (_, id) => {
		await setDoc(doc(db, `games/${gameId}/rows/${id}`), {
			values: [rows[id]]
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
	logEvent({ gameId, event: 'Game started!' });

	return {
		status: 200
	};
}
