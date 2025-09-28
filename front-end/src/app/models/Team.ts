import { Player } from "./Player";

export interface Team {
  teamId: number;
  name: string;
  city?: string;
  logoUrl?: string;
  players?: Player[];
}
