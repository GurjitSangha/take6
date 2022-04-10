import type { RequestHandlerOutput } from '@sveltejs/kit';
import { firestore as db } from '$lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { randId } from '$lib/utils';

export async function post({ request }): Promise<RequestHandlerOutput> {
	const { player } = await request.json();

	const id = randId(5);
	const docRef = doc(db, 'games', id);
	await setDoc(docRef, {
		state: 'lobby',
		rows: []
	});
	console.log(`game created ${id}`);

	await setDoc(doc(db, `games/${id}/players/${player.id}`), {
		name: player.name,
		isReady: false,
		isHost: true
	});

	return {
		status: 200,
		body: {
			gameId: id
		}
	};
}
