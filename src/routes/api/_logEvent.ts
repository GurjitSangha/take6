import { firestore as db } from '$lib/firebase';
import { arrayUnion, doc, serverTimestamp, updateDoc } from 'firebase/firestore';

export const logEvent = async ({ gameId, event }): Promise<void> => {
	console.log(`logEvent: ${gameId} ${event}`);
	const docRef = doc(db, `games/${gameId}`);
	const time = new Date().toLocaleTimeString('en-GB');
	await updateDoc(docRef, {
		events: arrayUnion(`${time}: ${event}`)
	});
};
