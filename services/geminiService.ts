
import { GoogleGenAI, Type } from "@google/genai";
import { Match, MatchType, MatchStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMatchInsights = async (match: Match): Promise<string> => {
  const prompt = `
    Analyze this cricket match and provide a short, professional, and exciting summary or predictive insight.
    Match: ${match.title}
    Teams: ${match.teamA} vs ${match.teamB}
    Current Score: ${match.innings[0]?.totalRuns || 0}/${match.innings[0]?.wickets || 0} in ${match.innings[0]?.overs || 0}.${match.innings[0]?.balls || 0} overs.
    Venue: ${match.venue}
    Status: ${match.status}
    Format: ${match.overs} overs per inning.

    Provide the summary in 3-4 sentences.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No insights available at the moment.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate AI insights.";
  }
};

/**
 * Fetches real current international cricket matches using Google Search grounding.
 */
export const fetchLiveInternationalMatches = async (): Promise<Match[]> => {
  try {
    const prompt = `Find current and very recent international cricket matches (last 48 hours). 
    Return a JSON array of objects with these properties:
    - id (string)
    - title (string, e.g. "India vs South Africa 2nd T20I")
    - teamA (string)
    - teamB (string)
    - overs (number, total match overs)
    - status (string: "LIVE", "COMPLETED", or "UPCOMING")
    - venue (string)
    - date (string, YYYY-MM-DD)
    - scoreA (string, e.g. "210/4")
    - oversA (string, e.g. "20.0")
    - battingTeam (string, either teamA or teamB)
    - summary (string, current match situation)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || "[]");
    
    return data.map((item: any, index: number) => ({
      id: item.id || `int-live-${index}`,
      type: MatchType.INTERNATIONAL,
      title: item.title,
      teamA: item.teamA,
      teamB: item.teamB,
      overs: item.overs || 20,
      status: (item.status || "LIVE") as MatchStatus,
      venue: item.venue,
      date: item.date,
      source: "Gemini Real-time Search",
      summary: item.summary,
      innings: [{
        battingTeamId: item.battingTeam || item.teamA,
        bowlingTeamId: item.battingTeam === item.teamA ? item.teamB : item.teamA,
        totalRuns: parseInt(item.scoreA?.split('/')[0]) || 0,
        wickets: parseInt(item.scoreA?.split('/')[1]) || 0,
        overs: Math.floor(parseFloat(item.oversA)) || 0,
        balls: Math.round((parseFloat(item.oversA) % 1) * 10) || 0,
        deliveries: []
      }],
      currentInning: 0
    }));
  } catch (error) {
    console.error("Error fetching live matches:", error);
    return [];
  }
};
