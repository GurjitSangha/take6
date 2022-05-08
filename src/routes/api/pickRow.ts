import type { RequestHandlerOutput } from '@sveltejs/kit';
import { firestore as db } from '$lib/firebase';
import { arrayRemove, arrayUnion, doc, runTransaction, updateDoc } from 'firebase/firestore';
import { getCardScore } from '$lib/utils';
import { logEvent } from './_logEvent';

export async function post({ request }): Promise<RequestHandlerOutput> {
	const { gameId, playerId, playerName, rowId, card, isAutoPick } = await request.json();

	let score;

	try {
		await runTransaction(db, async (transaction) => {
			const rowRef = doc(db, `games/${gameId}/rows/${rowId}`);
			const rowDoc = await transaction.get(rowRef);
			const row = rowDoc.data().values;

			// if row length == 5 or it is not an auto pick, calculate score, clear and set card as first elem
			if (row.length === 5 || !isAutoPick) {
				score = row.reduce((acc, cur) => acc + getCardScore(cur), 0);
				const playerDoc = await transaction.get(doc(db, `games/${gameId}/scores/${playerId}`));
				const player = playerDoc.data();

				await transaction.update(doc(db, `games/${gameId}/scores/${playerId}`), {
					value: player.value + score
				});

				await transaction.update(rowRef, {
					values: [card]
				});
			} else {
				await transaction.update(rowRef, {
					values: arrayUnion(card)
				});
			}
		});
	} catch (e) {
		console.log(`failed to update row ${rowId}`);
	}
	await updateDoc(doc(db, `games/${gameId}/selectedCards/${playerId}`), {
		value: null
	});
	await updateDoc(doc(db, `games/${gameId}/hands/${playerId}`), {
		value: arrayRemove(parseInt(card, 10))
	});
	console.log(`${playerName} placed card ${card} in row ${rowId} ${gameId}`);
	logEvent({ gameId, event: `${playerName} placed ${card} in row ${parseInt(rowId, 10) + 1}` });
	if (score) {
		logEvent({ gameId, event: `${playerName} scored ${score} points!` });
	}

	return {
		status: 200
	};
}
