import type { RequestHandlerOutput } from '@sveltejs/kit';
import { firestore as db } from '$lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function post({ request }): Promise<RequestHandlerOutput> {
	const { gameId, player } = await request.json();

	await updateDoc(doc(db, 'games', gameId), {
		[`players.${player.id}`]: { name: player.name, ready: false }
	});
	console.log(`${player.id} joined game ${gameId}`);

	return {
		status: 200,
		body: {
			gameId
		}
	};
}
