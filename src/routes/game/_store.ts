import { writable } from 'svelte/store';

export type Player = {
	id: string;
	name: string;
};

export interface GameState {
	host: string;
	players: Player[];
}

export const gameState = writable({} as GameState);
