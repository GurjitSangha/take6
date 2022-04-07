import type { RequestHandlerOutput } from '@sveltejs/kit';
import { firestore as db } from '$lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function post({ request }): Promise<RequestHandlerOutput> {
	const { gameId, playerId } = await request.json();

	const docRef = doc(db, 'games', gameId);
	const players = (await getDoc(docRef)).data().players;
	delete players[playerId];

	await updateDoc(docRef, { players });
	console.log(`${playerId} left game ${gameId}`);

	return {
		status: 200
	};
}
