import type { RequestHandlerOutput } from '@sveltejs/kit';
import { firestore as db } from '$lib/firebase';
import { deleteDoc, doc } from 'firebase/firestore';

export async function post({ request }): Promise<RequestHandlerOutput> {
	const { gameId, playerId } = await request.json();

	const docRef = doc(db, `games/${gameId}/players/${playerId}`);
	await deleteDoc(docRef);
	console.log(`${playerId} left game ${gameId}`);

	return {
		status: 200
	};
}
