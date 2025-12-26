
import React from 'react';
import { MatchType, MatchStatus, Match } from './types';

export const MOCK_INTERNATIONAL_MATCHES: Match[] = [
  {
    id: 'int-1',
    type: MatchType.INTERNATIONAL,
    title: 'ICC World Cup Final',
    teamA: 'India',
    teamB: 'Australia',
    overs: 50,
    // Fix: Added missing required property playerCount
    playerCount: 11,
    status: MatchStatus.LIVE,
    innings: [
      {
        // Fix: Changed battingTeamId to teamId and removed unknown property bowlingTeamId
        teamId: 'India',
        totalRuns: 345,
        wickets: 4,
        overs: 42,
        balls: 3,
        deliveries: [],
        // Fix: Added missing required property playerStats
        playerStats: {}
      }
    ],
    currentInning: 0,
    venue: 'Narendra Modi Stadium, Ahmedabad',
    date: '2024-11-20',
    source: 'CricBuzz API',
    lastUpdated: Date.now()
  },
  {
    id: 'int-2',
    type: MatchType.INTERNATIONAL,
    title: 'The Ashes - 2nd Test',
    teamA: 'England',
    teamB: 'Australia',
    overs: 90,
    // Fix: Added missing required property playerCount
    playerCount: 11,
    status: MatchStatus.COMPLETED,
    innings: [],
    currentInning: 0,
    venue: 'Lord\'s, London',
    date: '2024-06-15',
    source: 'Official API'
  }
];

export const MOCK_LOCAL_MATCHES: Match[] = [
  {
    id: 'loc-1',
    type: MatchType.LOCAL,
    title: 'Saturday Corporate Cup',
    teamA: 'Tech Titans',
    teamB: 'Code Crushers',
    overs: 20,
    // Fix: Added missing required property playerCount
    playerCount: 11,
    status: MatchStatus.LIVE,
    innings: [
      {
        // Fix: Changed battingTeamId to teamId and removed unknown property bowlingTeamId
        teamId: 'Tech Titans',
        totalRuns: 82,
        wickets: 2,
        overs: 8,
        balls: 4,
        deliveries: [],
        // Fix: Added missing required property playerStats
        playerStats: {}
      }
    ],
    currentInning: 0,
    venue: 'Central Park Ground',
    date: '2024-05-25'
  }
];
