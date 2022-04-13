import type { RequestHandlerOutput } from '@sveltejs/kit';
import { firestore as db } from '$lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function post({ request }): Promise<RequestHandlerOutput> {
	const { gameId, playerId, card } = await request.json();

	await updateDoc(doc(db, `games/${gameId}/selectedCards/${playerId}`), {
		value: card
	});
	console.log(`${playerId} played card ${card} ${gameId}`);

	return {
		status: 200
	};
}
