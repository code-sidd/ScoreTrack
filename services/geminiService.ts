
import { GoogleGenAI, Type } from "@google/genai";
import { Match, MatchType, MatchStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMatchInsights = async (match: Match): Promise<string> => {
  const prompt = `
    Analyze this cricket match and provide a short, professional summary.
    Match: ${match.title}
    Teams: ${match.teamA} vs ${match.teamB}
    Venue: ${match.venue}
    Status: ${match.status} ${match.statusText || ''}
    Current Inning Data: ${JSON.stringify(match.innings)}

    Provide the summary in 3 sentences.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No insights available.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate AI insights.";
  }
};

export const fetchLiveInternationalMatches = async (): Promise<Match[]> => {
  try {
    const prompt = `Find current live or very recent international cricket matches (last 24-48 hours).
    Return a JSON array of match objects.
    Each object MUST have:
    - id (unique string)
    - title (string)
    - teamA, teamB (strings)
    - status ("LIVE", "COMPLETED", "STUMPS", "UPCOMING")
    - statusText (short descriptive status like "Ind won by 4 wkts" or "Day 3 Stumps")
    - venue (string)
    - date (YYYY-MM-DD)
    - teamAScore (string, e.g., "342/8 (50.0)")
    - teamBScore (string, e.g., "210/4 (32.2)")
    - battingTeam (string, either teamA or teamB)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || "[]");
    
    return data.map((item: any, index: number) => {
      const parseScore = (scoreStr: string) => {
        if (!scoreStr) return { runs: 0, wkts: 0, ov: 0, b: 0 };
        const match = scoreStr.match(/(\d+)\/(\d+)\s*\(([\d.]+)\)/);
        if (!match) return { runs: 0, wkts: 0, ov: 0, b: 0 };
        const ovFloat = parseFloat(match[3]);
        return {
          runs: parseInt(match[1]),
          wkts: parseInt(match[2]),
          ov: Math.floor(ovFloat),
          b: Math.round((ovFloat % 1) * 10)
        };
      };

      const scoreA = parseScore(item.teamAScore);
      const scoreB = parseScore(item.teamBScore);

      return {
        id: item.id || `int-${index}`,
        type: MatchType.INTERNATIONAL,
        title: item.title,
        teamA: item.teamA,
        teamB: item.teamB,
        overs: 50,
        status: (item.status || "LIVE") as MatchStatus,
        statusText: item.statusText,
        venue: item.venue,
        date: item.date,
        source: "Search Grounding",
        innings: [
          {
            teamId: item.teamA,
            totalRuns: scoreA.runs,
            wickets: scoreA.wkts,
            overs: scoreA.ov,
            balls: scoreA.b,
            deliveries: []
          },
          {
            teamId: item.teamB,
            totalRuns: scoreB.runs,
            wickets: scoreB.wkts,
            overs: scoreB.ov,
            balls: scoreB.b,
            deliveries: []
          }
        ],
        currentInning: item.battingTeam === item.teamB ? 1 : 0
      };
    });
  } catch (error) {
    console.error("Error fetching live matches:", error);
    return [];
  }
};

export const fetchRecentOverInsights = async (match: Match): Promise<{ball: number, desc: string, runs: number, isWicket: boolean}[]> => {
  try {
    const prompt = `Based on the latest data for the cricket match ${match.title}, generate a realistic JSON array of the last 6 balls (one over).
    Each object should have:
    - ball (1-6)
    - desc (short action description like "Wide ball outside off", "Excellent yorker", "Smashed for SIX over long-on")
    - runs (number)
    - isWicket (boolean)
    
    Make it exciting and varied based on current match situation.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
};
