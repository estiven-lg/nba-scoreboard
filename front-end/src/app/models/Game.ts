import { Team } from "./Team";

export interface Game {
  gameId: number;
  homeTeamId: number;
  awayTeamId: number;
  homeTeam: Team;
  awayTeam: Team;
  gameDate: string;
  gameStatus: string;
  homeScore: number;
  awayScore: number;
  currentPeriod: number;
  timeRemaining: string;
}
