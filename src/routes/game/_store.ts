import { writable } from 'svelte/store';

export type State = 'lobby' | 'selecting' | 'placing' | 'finished';

// export type DbPlayers = {
// 	[id: string]: {
// 		name: string;
// 		score: number;
// 		isReady: boolean;
// 		isHost: boolean;
// 	};
// };
export type DbPlayers = any;

export interface GameState {
	state: State;
	gameId?: string;
	playerId?: string;
}

export type DbHand = [number];
export type DbSelectedCards = any;

export type CardRow = [number];

export const gameState = writable({} as GameState);
export const playersStore = writable({} as DbPlayers);
export const rowsStore = writable([]);
export const handStore = writable([]);
export const scoresStore = writable({});

export const dbHand = writable([]);
export const dbSelectedCards = writable({} as DbSelectedCards);
