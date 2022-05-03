import type { RequestHandlerOutput } from '@sveltejs/kit';
import { firestore as db } from '$lib/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { logEvent } from './_logEvent';

export async function post({ request }): Promise<RequestHandlerOutput> {
	const { gameId, playerId, playerName } = await request.json();

	const docRef = doc(db, `games/${gameId}/players/${playerId}`);
	await deleteDoc(docRef);
	logEvent({ gameId, event: `${playerName} left the game!` });
	console.log(`${playerName} left game ${gameId}`);

	return {
		status: 200
	};
}
