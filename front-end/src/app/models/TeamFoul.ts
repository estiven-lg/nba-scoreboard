export interface TeamFoul {
  teamFoulId: number;
  gameId: number;
  teamId: number;
  period: number;
  foulCount: number;
  team?: any;
}
