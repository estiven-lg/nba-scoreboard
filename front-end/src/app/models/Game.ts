import { Team } from "./Team";

export interface Game {
  gameId: number;
  homeTeamId: number;
  awayTeamId: number;
  homeTeam: Team;
  awayTeam: Team;
  gameDate: string;
  gameStatus: number; // 0: Scheduled, 1: Live, 2: Finished, 3: Paused, etc.
  homeScore: number;
  awayScore: number;
  currentPeriod: number;
  timeRemaining: string;
  
}
