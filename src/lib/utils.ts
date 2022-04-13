import type { Players } from 'src/routes/game/_store';

export const randId = (length: number): string => {
	return Math.random()
		.toString(16)
		.slice(2, 2 + length);
};

export const getPlayerName = (players: Players, id: string): string => {
	return players?.[id]?.name + ' (' + id + ')';
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
