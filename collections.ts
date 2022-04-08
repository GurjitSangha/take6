interface collections {
	games: {
		[gameId: string]: {
			state: 'lobby' | 'starting' | 'playerTurns' | 'placing' | 'redealing' | 'ended';
			players: {
				[playerId: string]: {
					name: string;
					score: number;
					isReady: boolean;
					isHost: boolean;
				};
			};
			scores: {
				[playerId: string]: number;
			};
			hands: {
				[playerId: string]: [number];
			};
			selectedCards: {
				[playerId: string]: number;
			};
			rows: [[number]];
		};
	};
}
