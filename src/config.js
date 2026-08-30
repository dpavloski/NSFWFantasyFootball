// League ID comes from the URL of your Sleeper league, e.g.
// https://sleeper.com/leagues/1391888117673238528  <- that number.
// Set it as an env var (LEAGUE_ID) so this repo never hardcodes anything
// league-specific in a place that's annoying to change later.

export const LEAGUE_ID = process.env.LEAGUE_ID;

if (!LEAGUE_ID) {
  console.error(
    "Missing LEAGUE_ID. Set it as an environment variable, e.g.\n" +
      "  LEAGUE_ID=1391888117673238528 npm run sync\n" +
      "or add it to a .env file (see .env.example)."
  );
  process.exit(1);
}
