import type { DbPlayers } from 'src/routes/game/_store';

export const randId = (length: number): string => {
	return Math.random()
		.toString(16)
		.slice(2, 2 + length);
};

export const getPlayerName = (players: DbPlayers, id: string): string => {
	return players?.[id]?.name; // + ' (' + id + ')';
};

export const getPlayerScore = (scores, id: string): number => {
	return scores?.[id]?.value || 0;
};

export const sendRequest = async ({ path, data, method = 'POST' }): Promise<Response> => {
	const response = await fetch(path, {
		method,
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});

	if (!response.ok) {
		throw new Error(`${response.status} ${response.statusText}`);
	}

	return response;
};

export const getCardScore = (value: number): number => {
	if (value === 0) return 0;
	if (value === 55) return 7;
	if (value % 10 === 0) return 3;
	if (value % 11 === 0) return 5;
	if (value % 5 === 0) return 2;
	return 1;
};

export const snapReduce = (snap) =>
	snap.docs.reduce((acc, doc) => {
		acc[doc.id] = doc.data() || null;
		return acc;
	}, {});

export const redeal = (players) => {
	// Create a deck for this game
	let count = 104;
	const deck = Array.from({ length: count }, (_, i) => i + 1);
	while (count > 0) {
		deck.push(deck.splice(Math.floor(Math.random() * count), 1)[0]);
		count -= 1;
	}
	// Create the player hands
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

	return {
		hands,
		rows: [0, 1, 2, 3].map(() => deck.pop())
	};
};
