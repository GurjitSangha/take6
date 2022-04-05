import type { Players } from 'src/routes/game/_store';

export const randId = (length: number): string => {
	return Math.random()
		.toString(16)
		.slice(2, 2 + length);
};

export const getPlayerName = (players: Players, id: string): string => {
	return players[id].name;
};
