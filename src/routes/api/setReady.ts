import type { RequestHandlerOutput } from '@sveltejs/kit';
import { firestore as db } from '$lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function post({ request }): Promise<RequestHandlerOutput> {
	const { gameId, playerId } = await request.json();

	const docRef = doc(db, 'games', gameId);
	const prev = (await getDoc(docRef)).data();

	await updateDoc(docRef, {
		[`players.${playerId}.ready`]: !prev.players[playerId].ready
	});
	console.log(`(${gameId}): ${playerId} is ready`);

	return {
		status: 200
	};
}
