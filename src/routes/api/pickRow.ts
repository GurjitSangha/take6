import type { RequestHandlerOutput } from '@sveltejs/kit';
import { firestore as db } from '$lib/firebase';
import { arrayRemove, arrayUnion, doc, runTransaction, updateDoc } from 'firebase/firestore';
import { getCardScore } from '$lib/utils';

export async function post({ request }): Promise<RequestHandlerOutput> {
	const { gameId, playerId, rowId, card, isAutoPick } = await request.json();

	try {
		await runTransaction(db, async (transaction) => {
			const rowRef = doc(db, `games/${gameId}/rows/${rowId}`);
			const rowDoc = await transaction.get(rowRef);
			const row = rowDoc.data().values;

			// if row length == 5 or it is not an auto pick, calculate score, clear and set card as first elem
			if (row.length === 5 || !isAutoPick) {
				const score = row.reduce((acc, cur) => acc + getCardScore(cur), 0);
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
	// await updateDoc(doc(db, `games/${gameId}/rows/${rowId}`), {
	// 	values: arrayUnion(parseInt(card, 10))
	// });
	await updateDoc(doc(db, `games/${gameId}/selectedCards/${playerId}`), {
		value: null
	});
	await updateDoc(doc(db, `games/${gameId}/hands/${playerId}`), {
		value: arrayRemove(parseInt(card, 10))
	});
	console.log(`${playerId} placed card ${card} in row ${rowId} ${gameId}`);

	return {
		status: 200
	};
}
