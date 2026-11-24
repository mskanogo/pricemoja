// Works out a contributor's reputation score and badges from the prices they have shared.
// A price counts as "verified" once at least one other person has confirmed it and it has not been left out of the range.
import { isCounted } from "./fair-price.js";

const MILESTONES = [
  { name: "First verified price", needed: 1 },
  { name: "Reliable sharer", needed: 3 },
  { name: "Community pillar", needed: 10 }
];

export function reputationFor(userId, submissions, tallies) {
  const mine = submissions.filter((s) => s.userId === userId);
  const totals = { shared: mine.length, verified: 0, confirmed: 0, disputed: 0, flagged: 0 };

  for (const s of mine) {
    const t = tallies[s.id] || { up: 0, down: 0, flags: 0 };
    totals.confirmed += t.up;
    totals.disputed += t.down;
    totals.flagged += t.flags;
    if (t.up >= 1 && isCounted(t)) totals.verified += 1;
  }

  // 10 points per verified price, 1 per shared price, 2 per confirmation, minus 2 per dispute and 5 per flag. Never below 0.
  const score = Math.max(0, totals.verified * 10 + totals.shared + totals.confirmed * 2 - totals.disputed * 2 - totals.flagged * 5);
  const badges = MILESTONES.map((m) => ({
    name: m.name,
    earned: totals.verified >= m.needed,
    detail: `Needs ${m.needed} verified ${m.needed === 1 ? "price" : "prices"}`
  }));
  const upcoming = MILESTONES.find((m) => totals.verified < m.needed);
  return { ...totals, score, badges, next: upcoming ? { name: upcoming.name, needed: upcoming.needed - totals.verified } : null };
}
