import type { RequestHandlerOutput } from '@sveltejs/kit';
import { firestore as db } from '$lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { redeal, snapReduce } from '$lib/utils';

export async function post({ request }): Promise<RequestHandlerOutput> {
	const { gameId, state, players = {} } = await request.json();

	// If the state is selecting, get the hand of one of the players
	if (state === 'selecting' && Object.keys(players).length > 0) {
		// Check for game over
		const scoreLimit = 10;
		const scoresSnap = await getDocs(collection(db, `games/${gameId}/scores`));
		const scores = Object.values(snapReduce(scoresSnap)).filter(
			(score) => score.value >= scoreLimit
		);
		if (scores.length > 0) {
			await updateDoc(doc(db, 'games', gameId), {
				state: 'finished'
			});
			return { status: 200 };
		}

		const handSnap = await getDoc(doc(db, `games/${gameId}/hands/${Object.keys(players)[0]}`));
		const hand = handSnap.data()?.value || [];
		console.log(`hand for ${Object.keys(players)[0]}`, hand);
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
