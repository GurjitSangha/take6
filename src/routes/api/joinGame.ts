import type { RequestHandlerOutput } from '@sveltejs/kit';
import { firestore as db } from '$lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function post({ request }): Promise<RequestHandlerOutput> {
	const { id, player } = await request.json();

	await updateDoc(doc(db, 'games', id), {
		[`players.${player.id}`]: { name: player.name, ready: false }
	});
	console.log(`joined game ${id}`);

	return {
		status: 200,
		body: {
			gameId: id
		}
	};
}
