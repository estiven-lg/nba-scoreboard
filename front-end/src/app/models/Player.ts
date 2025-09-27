import { Team } from "./Team";

export interface Player {
  playerId: number;
  fullName: string;
  jerseyNumber: number;
  position: string;
  teamId: number;
  team?: Team
  height: number;
  age: number;
  nationality: string;
}