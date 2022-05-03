import type { RequestHandlerOutput } from '@sveltejs/kit';
import { firestore as db } from '$lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { logEvent } from './_logEvent';

export async function post({ request }): Promise<RequestHandlerOutput> {
	const { gameId, playerId } = await request.json();

	const docRef = doc(db, `games/${gameId}/players/${playerId}`);
	const prev = (await getDoc(docRef)).data();

	await updateDoc(docRef, {
		isReady: !prev.isReady
	});

	logEvent({ gameId, event: `${prev.name} is ${prev.isReady ? 'not ready' : 'ready'}` });

	return {
		status: 200
	};
}
