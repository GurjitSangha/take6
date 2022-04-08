import type { RequestHandlerOutput } from '@sveltejs/kit';
import { firestore as db } from '$lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function post({ request }): Promise<RequestHandlerOutput> {
	const { gameId, player } = await request.json();

	await setDoc(doc(db, `games/${gameId}/players/${player.id}`), {
		name: player.name,
		isReady: false,
		isHost: false
	});
	console.log(`${player.id} joined game ${gameId}`);

	return {
		status: 200,
		body: {
			gameId
		}
	};
}
