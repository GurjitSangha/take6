import type { RequestHandlerOutput } from '@sveltejs/kit';
import { firestore as db } from '$lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { randId } from '$lib/utils';
import { logEvent } from './_logEvent';

export async function post({ request }): Promise<RequestHandlerOutput> {
	const { player } = await request.json();

	const id = randId(5);
	const docRef = doc(db, 'games', id);
	await setDoc(docRef, {
		state: 'lobby',
		events: []
	});
	logEvent({ gameId: id, event: 'Game created!' });
	console.log(`game created ${id}`);

	await setDoc(doc(db, `games/${id}/players/${player.id}`), {
		name: player.name,
		isReady: false,
		isHost: true
	});
	logEvent({ gameId: id, event: `${player.name} joined the game!` });

	return {
		status: 200,
		body: {
			gameId: id
		}
	};
}
