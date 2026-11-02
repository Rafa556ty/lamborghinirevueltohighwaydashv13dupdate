import type { CarType } from "./traffic";

// Spawn beyond the fog, retain fast traffic even when it drives into the distance.
export const TRAFFIC_SPAWN_AHEAD = 290;
export const TRAFFIC_KEEP_AHEAD = 650;
export const TRAFFIC_KEEP_BEHIND = 45;
export const TRAFFIC_DRAW_AHEAD = 285;
export const MUSTANG_CHANCE = (2 / 3) * 0.4; // 60% lower than the old two-of-three palette.
// Width/length in metres, matching the real-scale traffic models.
export const FOOTPRINTS: Record<CarType, [number, number]> = {
  m5: [1.8, 4.1],
  hatch: [1.8, 4.1],
  sedan: [1.85, 4.7],
  suv: [1.88, 4.65],
  pickup: [1.9, 5.3],
  bus: [2.55, 12],
  truck: [2.55, 19.8],
  "mustang-blue": [1.92, 4.8],
  "mustang-black": [1.92, 4.8],
};
export function pickTrafficType(random: number, normalRandom: number, previous?: CarType): CarType {
  if (!previous?.startsWith("mustang") && random < MUSTANG_CHANCE) {
    return normalRandom < 0.5 ? "mustang-blue" : "mustang-black";
  }
  const regular: CarType[] = ["hatch", "sedan", "suv", "pickup", "bus", "truck"];
  return regular[Math.min(regular.length - 1, Math.floor(normalRandom * regular.length))] ?? "hatch";
}
export function trafficScreenY(base: number, z: number, playerZ: number, ppm: number) {
  return base - (z - playerZ) * ppm;
}
export function laneMotion(
  x: number,
  vx: number,
  heading: number,
  target: number,
  laneWidth: number,
  speed: number,
  ppm: number,
  dt: number,
) {
  const remaining = target - x;
  const limit = laneWidth * 0.55;
  const desired = Math.max(-limit, Math.min(limit, remaining * 1.7));
  const velocity = vx + (desired - vx) * (1 - Math.exp(-3.5 * dt));
  const next = x + velocity * dt;
  const arrived =
    Math.abs(target - next) < laneWidth * 0.008 && Math.abs(velocity) < laneWidth * 0.025;
  const angle = Math.atan2(velocity, Math.max(1, (speed / 3.6) * ppm));
  return {
    x: arrived ? target : next,
    vx: arrived ? 0 : velocity,
    rot: heading + (angle - heading) * (1 - Math.exp(-6 * dt)),
    arrived,
  };
}
