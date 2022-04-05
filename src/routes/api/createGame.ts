import type { RequestHandlerOutput } from '@sveltejs/kit';
import { firestore as db } from '$lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { randId } from '$lib/utils';

export async function post({ request }): Promise<RequestHandlerOutput> {
	const { host, player } = await request.json();

	const id = randId(5);
	await setDoc(doc(db, 'games', id), {
		host: host,
		players: { [player.id]: { name: player.name, ready: false } }
	});
	console.log(`game created ${id}`);

	return {
		status: 200,
		body: {
			gameId: id
		}
	};
}
