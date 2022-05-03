import type { RequestHandlerOutput } from '@sveltejs/kit';
import { firestore as db } from '$lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { redeal, snapReduce } from '$lib/utils';
import { logEvent } from './_logEvent';

export async function post({ request }): Promise<RequestHandlerOutput> {
	const { gameId, state, players = {} } = await request.json();

	// If the state is selecting, get the hand of one of the players
	if (state === 'selecting' && Object.keys(players).length > 0) {
		// Check for game over
		const scoreLimit = import.meta.env.VITE_SCORE_TARGET;
		const scoresSnap = await getDocs(collection(db, `games/${gameId}/scores`));
		const scores = Object.values(snapReduce(scoresSnap)).filter(
			(score) => score.value >= scoreLimit
		);
		if (scores.length > 0) {
			await updateDoc(doc(db, 'games', gameId), {
				state: 'finished'
			});
			logEvent({ gameId, event: 'Game over!' });
			return { status: 200 };
		}

		const handSnap = await getDoc(doc(db, `games/${gameId}/hands/${Object.keys(players)[0]}`));
		const hand = handSnap.data()?.value || [];
		// If hand is empty, redeal
		if (hand.length === 0) {
			const { hands, rows } = redeal(players);
			console.log({ hands, rows });

			// Save the rows
			rows.forEach(async (_, id) => {
				await setDoc(doc(db, `games/${gameId}/rows/${id}`), {
					values: [rows[id]]
				});
			});

			// Set the hands for each player
			Object.keys(players).forEach(async (playerId) => {
				await setDoc(doc(db, `games/${gameId}/hands/${playerId}`), { value: hands[playerId] });
			});

			logEvent({ gameId, event: 'Redealing cards!' });
		}
	}

	await updateDoc(doc(db, 'games', gameId), {
		state
	});
	console.log(`started ${state} ${gameId}`);

	return {
		status: 200
	};
}
