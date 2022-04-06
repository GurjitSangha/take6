import { writable } from 'svelte/store';

export type State = 'lobby' | 'playing' | 'finished';

export type Players = {
	[id: string]: {
		name: string;
		ready: boolean;
	};
};

export interface GameState {
	state: State;
	host: string;
	players: Players;
}

export const gameState = writable({} as GameState);
