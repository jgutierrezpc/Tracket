import { Activity, Racket } from "@shared/schema";

export function normalizeRacketLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getRacketLabel(racket: { brand: string; model: string }): string {
  return normalizeRacketLabel(`${racket.brand} ${racket.model}`);
}

export function calculateUsageMinutesByRacketId(
  rackets: Racket[],
  activities: Activity[]
): Record<string, number> {
  const labelToId = new Map<string, string>();
  rackets.forEach((r) => labelToId.set(getRacketLabel(r), r.id));

  const minutesById: Record<string, number> = {};

  activities.forEach((a) => {
    if (!a.racket) return;
    const key = normalizeRacketLabel(String(a.racket));
    const id = labelToId.get(key);
    if (!id) return;
    minutesById[id] = (minutesById[id] || 0) + (a.duration || 0);
  });

  return minutesById;
}


