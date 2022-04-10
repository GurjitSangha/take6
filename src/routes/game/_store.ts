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
	gameId?: string;
	playerId?: string;
}

export type DbHand = [number];

export type CardRow = [number];

export const gameState = writable({} as GameState);
export const dbPlayers = writable({} as DbPlayers);
export const dbHand = writable([]);
