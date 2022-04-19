import type { RequestHandlerOutput } from '@sveltejs/kit';
import { firestore as db } from '$lib/firebase';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';

export async function post({ request }): Promise<RequestHandlerOutput> {
	const { gameId, playerId, rowId, card } = await request.json();

	await updateDoc(doc(db, `games/${gameId}/rows/${rowId}`), {
		values: arrayUnion(parseInt(card, 10))
	});
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
