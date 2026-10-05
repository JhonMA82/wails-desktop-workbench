import { z } from 'zod';
// Frontend-only user preference: keep the existing Go settings contract unchanged.
// Wails persists WebView localStorage per application origin; browser preview uses its settings fixture.
const schema = z.object({
  schemaVersion: z.literal(1),
  density: z.enum(['compact', 'comfortable']),
});
const key = 'workbench.presentation.user';
export function loadDensity() {
  try {
    const value = schema.safeParse(JSON.parse(localStorage.getItem(key) ?? 'null'));
    return value.success ? value.data.density : 'compact';
  } catch {
    return 'compact';
  }
}
export function saveDensity(density: 'compact' | 'comfortable') {
  localStorage.setItem(key, JSON.stringify({ schemaVersion: 1, density }));
}
