export interface PlayerFoul {
  playerFoulId: number;
  gameId: number;
  playerId: number;
  period: number;
  foulCount: number;
  player?: any;
}
