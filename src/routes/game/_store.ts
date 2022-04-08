import { writable } from 'svelte/store';

export type State = 'lobby' | 'playing' | 'finished';

export type DbPlayers = {
	[id: string]: {
		name: string;
		score: number;
		isReady: boolean;
		isHost: boolean;
	};
};

export interface GameState {
	state: State;
	host: string;
}

export const gameState = writable({} as GameState);
export const dbPlayers = writable({} as DbPlayers);
