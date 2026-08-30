// Maps this league's Sleeper roster_id -> the manager's real name.
// roster_id is stable for the whole season (unlike display_name, which
// people can change mid-season), so it's the right join key for everything
// downstream - matchups, transactions, draft picks all key off roster_id.
//
// This was hand-verified against the league's 2026 startup draft.
// If a manager changes teams/leaves, update here - roster_id stays put,
// only the name/handle changes.

export const MANAGERS_BY_ROSTER_ID = {
  1: { realName: "Daine Pavloski", teamName: "ProfPav" },
  2: { realName: "Steve Case", teamName: "coachcase44" },
  3: { realName: "Nick Pavloski", teamName: "MrPav53" },
  4: { realName: "Robby English", teamName: "Trooptroop" },
  5: { realName: "Keith Day", teamName: "Keith517" },
  6: { realName: "Erin Pavloski", teamName: "Jarvinators" },
  7: { realName: "Ben Kosmalski", teamName: "Kosmalski" },
  8: { realName: "Mark Pavloski", teamName: "ExSupe" },
  9: { realName: "Tyler Olinske", teamName: "TOleet" },
  10: { realName: "Tony Falbo", teamName: "tuonni" },
};

export function managerForRoster(rosterId) {
  return MANAGERS_BY_ROSTER_ID[rosterId] ?? null;
}
