// import * as functions from 'firebase-functions';
const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

exports.makeUppercase = functions.firestore
	.document('/messages/{documentId}')
	.onCreate((snap, context) => {
		const original = snap.data().original;
		functions.logger.log('Uppercasing', context.params.documentId, original);
		const uppercase = original.toUpperCase();
		return snap.ref.set({ uppercase }, { merge: true });
	});

// Delete a game once no players are left
exports.deleteGame = functions.firestore.document('/games/{gameId}').onUpdate((change, context) => {
	const { gameId } = context.params;
	const { players } = change.after.data();
	const { players: prevPlayers } = change.before.data();

	if (Object.keys(players).length === 0 && Object.keys(prevPlayers).length > 0) {
		console.log(`${gameId} has no players left, deleting`);
		return admin.firestore().doc(`/games/${gameId}`).delete();
	}
	return null;
});

// Deal cards when game state changes from lobby to playing
// exports.dealCards = functions.firestore.document('/games/{gameId}').onUpdate((change, context) => {
exports.dealCards = functions.https.onRequest((req, res) => {
	// const { gameId } = context.params;
	// const { state, players } = change.after.data();
	// const { state: prevState } = change.before.data();

	// if (state === 'playing') {
	// && prevState === 'lobby') {
	// console.log(`${gameId} is now playing, dealing cards`);
	let count = 104;
	let deck = Array.from({ length: count }, (_, i) => i + 1);
	while (count > 0) {
		deck.push(deck.splice(Math.floor(Math.random() * count), 1)[0]);
		count -= 1;
	}

	console.log({ deck });

	// return admin.firestore().doc(`/games/${gameId}`).update({
	// 	state: 'playing',
	// 	// players: {
	// 	// 	...change.after.data().players,
	// 	// 	...change.before.data().players
	// 	// }
	// });
	// }

	return null;
	res.send('OK');
});
