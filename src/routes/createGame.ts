import type { RequestHandlerOutput } from '@sveltejs/kit';
import { firestore as db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { randId } from '$lib/utils';

export async function post({ request }): Promise<RequestHandlerOutput> {
	const data = await request.json();

	const id = randId(6);
	const game = await setDoc(doc(db, 'games', id), {
		host: data.id,
		players: [{ id: data.id, name: data.name }]
	});

	return {
		status: 200,
		body: {
			gameId: id,
			message: `game created (${id})`
		}
	};
}
