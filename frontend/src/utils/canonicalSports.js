// Canonical master list of sports the app supports.
// Used to augment whatever the backend returns from /api/sports so that
// newer sports (e.g. Pickleball, Padel) show up in the UI even if the
// database hasn't been seeded yet.

export const CANONICAL_SPORTS = [
  'Football',
  'Soccer',
  'Basketball',
  'Tennis',
  'Cricket',
  'Baseball',
  'Pickleball',
  'Padel',
  'Squash',
  'Badminton',
  'Table Tennis',
  'Volleyball',
  'Swimming',
  'Running',
  'Cycling',
  'Golf',
  'Hockey',
  'Ice Hockey',
  'Rugby',
  'Boxing',
  'MMA',
  'Wrestling',
  'Gymnastics',
  'Athletics',
  'Archery',
  'Skateboarding',
  'Surfing',
  'Skiing',
  'Snowboarding',
  'Lacrosse',
  'Handball',
  'Yoga',
  'Gym',
];

/**
 * Merge API sports with the canonical master list, deduped by case-insensitive name.
 * API records (which have a real _id) take precedence.
 * Missing ones fall back to a stable synthetic id so React lists stay happy.
 */
export const mergeWithCanonical = (apiSports = []) => {
  const byName = new Map();

  // Seed with API records first so they win on conflict
  for (const s of apiSports) {
    if (!s?.name) continue;
    byName.set(s.name.toLowerCase(), s);
  }

  // Add canonical ones that are missing
  for (const name of CANONICAL_SPORTS) {
    const key = name.toLowerCase();
    if (!byName.has(key)) {
      byName.set(key, { _id: `canonical_${key}`, name, isCanonical: true });
    }
  }

  // Preserve API order first, then canonical order
  const apiOrder = apiSports.map((s) => s?.name?.toLowerCase()).filter(Boolean);
  const canonicalOrder = CANONICAL_SPORTS.map((n) => n.toLowerCase());
  const ordered = [];
  const seen = new Set();
  for (const k of [...apiOrder, ...canonicalOrder]) {
    if (seen.has(k)) continue;
    if (!byName.has(k)) continue;
    ordered.push(byName.get(k));
    seen.add(k);
  }
  return ordered;
};
