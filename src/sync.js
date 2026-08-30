import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { LEAGUE_ID } from "./config.js";
import { sleeper } from "./sleeperClient.js";
import { managerForRoster } from "./managers.js";

const DATA_DIR = path.resolve("data");

async function writeJson(relativePath, data) {
  const fullPath = path.join(DATA_DIR, relativePath);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, JSON.stringify(data, null, 2));
  console.log(`  wrote ${relativePath}`);
}

async function syncCore() {
  console.log(`Syncing core league data for league ${LEAGUE_ID}...`);

  const league = await sleeper.getLeague(LEAGUE_ID);
  const season = league.season;
  console.log(`League: "${league.name}" (${season} season)`);

  const [users, rosters, drafts, nflState] = await Promise.all([
    sleeper.getUsers(LEAGUE_ID),
    sleeper.getRosters(LEAGUE_ID),
    sleeper.getDrafts(LEAGUE_ID),
    sleeper.getNflState(),
  ]);

  const rostersWithManagers = rosters.map((r) => ({
    ...r,
    manager: managerForRoster(r.roster_id),
  }));

  await writeJson(`${season}/league.json`, league);
  await writeJson(`${season}/users.json`, users);
  await writeJson(`${season}/rosters.json`, rostersWithManagers);
  await writeJson(`${season}/nfl-state.json`, nflState);

  if (drafts.length === 0) {
    console.log("  no drafts found for this league yet - skipping picks.");
  }
  for (const draft of drafts) {
    const picks = await sleeper.getDraftPicks(draft.draft_id);
    const picksWithManagers = picks.map((p) => ({
      ...p,
      manager: managerForRoster(p.roster_id),
    }));
    await writeJson(`${season}/draft-${draft.draft_id}.json`, draft);
    await writeJson(`${season}/draft-${draft.draft_id}-picks.json`, picksWithManagers);
  }

  // Full NFL player reference (~5MB) - needed to turn player IDs in
  // rosters/picks/matchups into actual names. Refreshed every sync so
  // new call-ups, trades, and defense/team changes stay current.
  console.log("Fetching full NFL player reference data...");
  const players = await sleeper.getAllPlayers();
  await writeJson(`players/nfl-players.json`, players);

  return { season, nflState };
}

async function syncWeek(season, week) {
  console.log(`Syncing week ${week} data...`);
  try {
    const matchups = await sleeper.getMatchups(LEAGUE_ID, week);
    await writeJson(`${season}/weeks/week-${String(week).padStart(2, "0")}/matchups.json`, matchups);
  } catch (err) {
    console.log(`  matchups for week ${week} not available yet (${err.message})`);
  }

  try {
    const transactions = await sleeper.getTransactions(LEAGUE_ID, week);
    await writeJson(`${season}/weeks/week-${String(week).padStart(2, "0")}/transactions.json`, transactions);
  } catch (err) {
    console.log(`  transactions for week ${week} not available yet (${err.message})`);
  }
}

async function main() {
  const { season, nflState } = await syncCore();

  const weekArgIndex = process.argv.indexOf("--week");
  if (weekArgIndex !== -1) {
    const weekArg = process.argv[weekArgIndex + 1];
    const week = weekArg ? parseInt(weekArg, 10) : nflState.week;
    await syncWeek(season, week);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
