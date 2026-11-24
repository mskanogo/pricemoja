// Works out a fair-price range from the prices people have shared.
// Few reports: the range is the lowest to the highest price. Four or more: the middle half of the prices,
// so one unusually high or low price does not stretch the range.

export const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Value a given share (0 to 1) of the way through a sorted list of numbers.
export function percentile(sorted, share) {
  if (sorted.length === 1) return sorted[0];
  const position = (sorted.length - 1) * share;
  const base = Math.floor(position);
  const next = sorted[base + 1] === undefined ? sorted[base] : sorted[base + 1];
  return sorted[base] + (position - base) * (next - sorted[base]);
}

export function summarise(amounts) {
  const sorted = [...amounts].sort((a, b) => a - b);
  const enough = sorted.length >= 4;
  return {
    count: sorted.length,
    median: percentile(sorted, 0.5),
    low: enough ? percentile(sorted, 0.25) : sorted[0],
    high: enough ? percentile(sorted, 0.75) : sorted[sorted.length - 1]
  };
}

// Counts the confirmations, disputes and flags for every shared price: { priceId: { up, down, flags } }.
export function tally(votes, flags) {
  const result = {};
  const entry = (id) => (result[id] ??= { up: 0, down: 0, flags: 0 });
  votes.forEach((v) => { if (v.value === 1) entry(v.submissionId).up += 1; else entry(v.submissionId).down += 1; });
  flags.forEach((f) => { entry(f.submissionId).flags += 1; });
  return result;
}

// A price is left out of the fair range once it has 3 flags, or 2 more disputes than confirmations.
export const isCounted = (t) => !t || (t.flags < 3 && t.down - t.up < 2);

// Groups shared prices by category, item and currency, and gives each group its fair range.
// Every price is kept in `items` so people can review it, but only counted prices shape the range.
export function groupSubmissions(submissions, tallies = {}) {
  const groups = new Map();
  for (const s of submissions) {
    const key = `${s.category}|${slug(s.item)}|${s.currency}`;
    if (!groups.has(key)) groups.set(key, { category: s.category, name: s.item, currency: s.currency, items: [], amounts: [] });
    const group = groups.get(key);
    const counted = isCounted(tallies[s.id]);
    group.items.push({ id: s.id, amount: s.amount, location: s.location, userName: s.userName, userId: s.userId, counted });
    if (counted) group.amounts.push(s.amount);
  }
  return [...groups.values()].map((g) => ({
    category: g.category, name: g.name, currency: g.currency, items: g.items,
    ...(g.amounts.length ? summarise(g.amounts) : { count: 0, median: 0, low: 0, high: 0 })
  }));
}

// Reads reference prices typed one per line as: category, low, high, item name (the item name may contain commas).
export function parseReferenceList(text) {
  const categories = ["transport", "groceries", "market"];
  const rows = [];
  const errors = [];
  text.split(/\r?\n/).forEach((line, index) => {
    if (!line.trim()) return;
    const [category, low, high, ...rest] = line.split(",").map((part) => part.trim());
    const name = rest.join(", ").trim();
    const lowNumber = Number(low);
    const highNumber = Number(high);
    if (!categories.includes((category || "").toLowerCase())) errors.push(`Line ${index + 1}: the category must be transport, groceries or market.`);
    else if (!low || !high || !Number.isFinite(lowNumber) || !Number.isFinite(highNumber) || lowNumber <= 0 || lowNumber > highNumber) errors.push(`Line ${index + 1}: low and high must be numbers, and low cannot be above high.`);
    else if (!name || name.length > 80) errors.push(`Line ${index + 1}: add an item name of up to 80 characters.`);
    else rows.push({ category: category.toLowerCase(), low: lowNumber, high: highNumber, name });
  });
  return { rows, errors };
}
