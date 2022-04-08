import type { RequestHandlerOutput } from '@sveltejs/kit';
import { firestore as db } from '$lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function post({ request }): Promise<RequestHandlerOutput> {
	const { gameId, playerId } = await request.json();

	const docRef = doc(db, `games/${gameId}/players/${playerId}`);
	const prev = (await getDoc(docRef)).data();

	await updateDoc(docRef, {
		isReady: !prev.isReady
	});

	return {
		status: 200
	};
}
