// import * as functions from 'firebase-functions';
const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

// Delete a game once no players are left
// exports.deleteGame = functions.firestore.document('/games/{gameId}').onUpdate((change, context) => {
// 	const { gameId } = context.params;
// 	const { players } = change.after.data();
// 	const { players: prevPlayers } = change.before.data();

// 	if (!prevPlayers || !players) {
// 		return;
// 	}

// 	if (Object.keys(players).length === 0 && Object.keys(prevPlayers).length > 0) {
// 		console.log(`${gameId} has no players left, deleting`);
// 		return admin.firestore().doc(`/games/${gameId}`).delete();
// 	}
// 	return null;
// });

// Deal cards when game state changes from lobby to playing
exports.dealCards = functions.firestore
	.document('/games/{gameId}')
	.onUpdate(async (change, context) => {
		// exports.startGame = functions.https.onRequest(async (req, res) => {
		const { gameId } = context.params;
		// const gameId = '44048';
		const players = await admin
			.firestore()
			.collection(`/games/${gameId}/players`)
			.get()
			.then((snap) => {
				return snap.docs.reduce((acc, doc) => {
					acc[doc.id] = doc.data();
					return acc;
				}, {});
			});

		const { state } = change.after.data();
		const { state: prevState } = change.before.data();

		if (state === 'selecting' && prevState === 'lobby') {
			console.log(`${gameId} is now playing, dealing cards`);
			let count = 104;
			let deck = Array.from({ length: count }, (_, i) => i + 1);
			while (count > 0) {
				deck.push(deck.splice(Math.floor(Math.random() * count), 1)[0]);
				count -= 1;
			}

			const hands = {};
			Object.keys(players).forEach((playerId) => {
				hands[playerId] = [deck.pop()];
			});
			let cardCount = 9;
			while (cardCount > 0) {
				Object.keys(hands).forEach((playerId) => {
					hands[playerId].push(deck.pop());
				});
				cardCount -= 1;
			}

			const rows = [0, 1, 2, 3].reduce((acc, row) => {
				acc[row] = [deck.pop()];
				return acc;
			}, {});
			await admin.firestore().doc(`/games/${gameId}`).update({ rows });

			Object.keys(players).forEach(async (playerId) => {
				await admin
					.firestore()
					.collection(`/games/${gameId}/scores/`)
					.doc(playerId)
					.set({ value: 0 });
				await admin
					.firestore()
					.collection(`/games/${gameId}/selectedCards/`)
					.doc(playerId)
					.set({ value: null });
				await admin
					.firestore()
					.collection(`/games/${gameId}/hands/`)
					.doc(playerId)
					.set({ value: hands[playerId] });
			});
		}

		return null;
		// res.send({ rows, hands });
	});

// Each selectedCard snapshot
// - check if all players have selected a card, if not return
// - order cards by value (flip object?)
// - check if player card is in position 0, if not return
// - calc available rows for that card
// - if only one row available, select that row
// - if multiple rows available, select row with closest value
// - if card is lower than all rows, let player pick row to take

// Row selected for card
// - update row with selected card
// - CHECK 6 in row
// - set selected card for that player to 0(?) - TRIGGERS selectedCard snapshot
// - remove card from hand
