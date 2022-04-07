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
});
