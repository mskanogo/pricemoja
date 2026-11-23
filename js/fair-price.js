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

// Groups shared prices by category, item and currency, and gives each group its fair range.
export function groupSubmissions(submissions) {
  const groups = new Map();
  for (const s of submissions) {
    const key = `${s.category}|${slug(s.item)}|${s.currency}`;
    if (!groups.has(key)) groups.set(key, { category: s.category, name: s.item, currency: s.currency, amounts: [] });
    groups.get(key).amounts.push(s.amount);
  }
  return [...groups.values()].map((g) => ({ category: g.category, name: g.name, currency: g.currency, ...summarise(g.amounts) }));
}