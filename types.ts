
export enum MatchType {
  INTERNATIONAL = 'INTERNATIONAL',
  LOCAL = 'LOCAL'
}

export enum MatchStatus {
  LIVE = 'LIVE',
  COMPLETED = 'COMPLETED',
  UPCOMING = 'UPCOMING',
  STUMPS = 'STUMPS',
  DELAYED = 'DELAYED'
}

export enum ExtraType {
  NONE = 'NONE',
  WIDE = 'WIDE',
  NO_BALL = 'NO_BALL',
  BYE = 'BYE',
  LEG_BYE = 'LEG_BYE'
}

export interface PlayerStats {
  matches: number;
  runs: number;
  wickets: number;
  strikeRate: number;
  economy: number;
  average: number;
  highScore: number;
  bestBowling: string;
}

export interface PlayerMatchStats {
  id: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  overs: number;
  ballsBowled: number;
  runsConceded: number;
  wickets: number;
  isOut: boolean;
}

export interface Player {
  id: string;
  name: string;
  role: 'batsman' | 'bowler' | 'all-rounder';
  stats: PlayerStats;
}

export interface Delivery {
  id: string;
  over: number;
  ball: number;
  batsmanId: string;
  bowlerId: string;
  runs: number;
  extraType: ExtraType;
  extraRuns: number;
  isWicket: boolean;
  dismissalType?: string;
  timestamp: number;
}

export interface Inning {
  teamId: string;
  totalRuns: number;
  wickets: number;
  overs: number;
  balls: number;
  deliveries: Delivery[];
  strikerId?: string;
  nonStrikerId?: string;
  currentBowlerId?: string;
  playerStats: Record<string, PlayerMatchStats>;
}

export interface Match {
  id: string;
  type: MatchType;
  title: string;
  teamA: string;
  teamB: string;
  overs: number;
  playerCount: number;
  status: MatchStatus;
  statusText?: string;
  innings: Inning[];
  currentInning: number;
  venue: string;
  date: string;
  source?: string;
  lastUpdated?: number;
  summary?: string;
  result?: string;
  squadA?: string[];
  squadB?: string[];
  tossWinner?: string;
  tossDecision?: 'bat' | 'bowl';
}
