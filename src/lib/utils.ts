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
