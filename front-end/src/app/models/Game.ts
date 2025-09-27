export interface Game {
  gameId: number;
  homeTeamId: number;
  awayTeamId: number;
  homeTeam?: any;
  awayTeam?: any;
  gameDate: Date;
  gameStatus: string;
  homeTeamScore: number;
  awayTeamScore: number;
  currentPeriod: number;
  timeRemaining: string;
}
