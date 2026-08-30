// Thin wrapper around Sleeper's public API.
// No auth required - it's all public, read-only JSON.
// Full reference: https://docs.sleeper.com/

const BASE = "https://api.sleeper.app/v1";

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Sleeper API error ${res.status} for ${path}`);
  }
  return res.json();
}

export const sleeper = {
  // League metadata: name, season, settings, scoring, roster positions, previous_league_id (for chaining seasons later)
  getLeague: (leagueId) => get(`/league/${leagueId}`),

  // All managers/owners in the league
  getUsers: (leagueId) => get(`/league/${leagueId}/users`),

  // All rosters - roster_id, owner_id, current players, wins/losses/points
  getRosters: (leagueId) => get(`/league/${leagueId}/rosters`),

  // All drafts ever run for this league (usually just one per season)
  getDrafts: (leagueId) => get(`/league/${leagueId}/drafts`),

  // Every pick in a specific draft
  getDraftPicks: (draftId) => get(`/draft/${draftId}/picks`),

  // Matchups for a given week (returns one entry per roster, grouped by matchup_id)
  getMatchups: (leagueId, week) => get(`/league/${leagueId}/matchups/${week}`),

  // Transactions (trades, waivers, free agent adds/drops) for a given week
  getTransactions: (leagueId, week) => get(`/league/${leagueId}/transactions/${week}`),

  // Full NFL player database - large (~5MB), only needs refreshing occasionally, not per-sync
  getAllPlayers: () => get(`/players/nfl`),

  // Current NFL state - season, week, season type (pre/regular/post). Useful for figuring out "what week is it"
  getNflState: () => get(`/state/nfl`),
};
