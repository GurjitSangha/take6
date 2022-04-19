import type { RequestHandlerOutput } from '@sveltejs/kit';
import { firestore as db } from '$lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function post({ request }): Promise<RequestHandlerOutput> {
	const { gameId, state } = await request.json();

	await updateDoc(doc(db, 'games', gameId), {
		state
	});
	console.log(`started ${state} ${gameId}`);

	return {
		status: 200
	};
}
