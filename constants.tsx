
import { MatchType, MatchStatus, Match } from './types';

export const MOCK_INTERNATIONAL_MATCHES: Match[] = [
  {
    id: 'int-1',
    type: MatchType.INTERNATIONAL,
    title: 'ICC World Cup Final',
    teamA: 'India',
    teamB: 'Australia',
    overs: 50,
    playerCount: 11,
    status: MatchStatus.LIVE,
    innings: [
      {
        teamId: 'India',
        totalRuns: 345,
        wickets: 4,
        overs: 42,
        balls: 3,
        deliveries: [],
        playerStats: {}
      },
      {
        teamId: 'Australia',
        totalRuns: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        deliveries: [],
        playerStats: {}
      }
    ],
    currentInning: 0,
    venue: 'Narendra Modi Stadium, Ahmedabad',
    date: '2024-11-20',
    source: 'CricBuzz API',
    lastUpdated: Date.now()
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
    playerCount: 11,
    status: MatchStatus.LIVE,
    innings: [
      {
        teamId: 'Tech Titans',
        totalRuns: 82,
        wickets: 2,
        overs: 8,
        balls: 4,
        deliveries: [],
        playerStats: {}
      },
      {
        teamId: 'Code Crushers',
        totalRuns: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        deliveries: [],
        playerStats: {}
      }
    ],
    currentInning: 0,
    venue: 'Central Park Ground',
    date: '2024-05-25'
  }
];
