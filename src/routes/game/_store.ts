import { writable } from 'svelte/store';

export type Players = {
	[id: string]: {
		name: string;
		ready: boolean;
	};
};

export interface GameState {
	host: string;
	players: Players;
}

export const gameState = writable({} as GameState);
