import type { RequestHandlerOutput } from '@sveltejs/kit';
import { firestore as db } from '$lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function post({ request }): Promise<RequestHandlerOutput> {
	const { gameId, playerId } = await request.json();
	console.log({ gameId, playerId });

	await updateDoc(doc(db, 'games', gameId), {
		[`players.${playerId}.ready`]: true
	});
	console.log(`(${gameId}): ${playerId} is ready`);

	return {
		status: 200
	};
}
