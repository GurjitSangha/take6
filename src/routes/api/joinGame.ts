import type { RequestHandlerOutput } from '@sveltejs/kit';
import { firestore as db } from '$lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { logEvent } from './_logEvent';

export async function post({ request }): Promise<RequestHandlerOutput> {
	const { gameId, player } = await request.json();

	await setDoc(doc(db, `games/${gameId}/players/${player.id}`), {
		name: player.name,
		isReady: false,
		isHost: false
	});
	logEvent({ gameId, event: `${player.name} joined the game!` });
	console.log(`${player.name} joined game ${gameId}`);

	return {
		status: 200,
		body: {
			gameId
		}
	};
}
