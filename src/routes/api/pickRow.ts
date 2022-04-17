import type { RequestHandlerOutput } from '@sveltejs/kit';
import { firestore as db } from '$lib/firebase';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';

export async function post({ request }): Promise<RequestHandlerOutput> {
	const { gameId, playerId, rowId, card } = await request.json();

	await updateDoc(doc(db, `games/${gameId}`), {
		rows: {
			[rowId]: arrayUnion(card)
		}
	});
	console.log(`${playerId} placed card ${card} in row ${rowId} ${gameId}`);

	return {
		status: 200
	};
}
