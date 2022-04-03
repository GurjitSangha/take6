// import * as functions from 'firebase-functions';
const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

const randId = (length) => {
	return Math.random()
		.toString(16)
		.slice(2, 2 + length);
};

exports.addMessage = functions.https.onRequest(async (req, res) => {
	const original = req.query.text;
	const writeResult = await admin.firestore().collection('messages').add({ original: original });
	res.json({ result: `Message with ID: ${writeResult.id} added.` });
});

exports.makeUppercase = functions.firestore
	.document('/messages/{documentId}')
	.onCreate((snap, context) => {
		const original = snap.data().original;
		functions.logger.log('Uppercasing', context.params.documentId, original);
		const uppercase = original.toUpperCase();
		return snap.ref.set({ uppercase }, { merge: true });
	});

exports.createGame = functions.https.onRequest(async (req, res) => {
	const playerName = req.body.name;
	const playerId = req.body.id;
	const id = randId(6);
	const game = await admin
		.firestore()
		.collection('games')
		.add({ id, host: playerId, players: [{ id: playerId, name: playerName }] });
	res.json({ result: `Game ${game.id} (${id}) created` });
});

// /joinGame?id=1a3c
exports.joinGame = functions.https.onRequest(async (req, res) => {
	const id = req.query.id;
	const playerName = req.body.name;
	const playerId = req.body.id;
	const document = await admin.firestore().collection('games').doc(id);
	const documentData = await document.get();
	await document.update({
		players: [...documentData.get('players'), { id: playerId, name: playerName }]
	});
	res.json(documentData.get('players'));
});
