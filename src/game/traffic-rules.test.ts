import { describe, it, expect } from "vitest";
import {
  MUSTANG_CHANCE,
  pickTrafficType,
  trafficScreenY,
  laneMotion,
  TRAFFIC_KEEP_AHEAD,
  TRAFFIC_SPAWN_AHEAD,
  TRAFFIC_DRAW_AHEAD,
  FOOTPRINTS,
} from "./traffic-rules";
import { stepAero } from "./aero";
describe("requested traffic and aero rules", () => {
  it("reduces the old Mustang probability by 60 percent", () =>
    expect(MUSTANG_CHANCE).toBeCloseTo((2 / 3) * 0.4));
  it("never selects consecutive Mustangs", () =>
    expect(pickTrafficType(0, 0, "mustang-blue")).toBe("hatch"));
  it("selects a white-bus class and all ordinary vehicle types", () => {
    expect([0, 0.2, 0.4, 0.6, 0.8].map((n) => pickTrafficType(0.99, n))).toEqual([
      "hatch",
      "sedan",
      "suv",
      "pickup",
      "bus",
    ]);
    expect(FOOTPRINTS.bus).toEqual([2.5, 10.8]);
  });
  it("spawns in world position beyond the drawn horizon and retains distant traffic", () => {
    expect(trafficScreenY(500, 300, 10, 20)).toBe(-5300);
    expect(TRAFFIC_SPAWN_AHEAD).toBeGreaterThan(TRAFFIC_DRAW_AHEAD);
    expect(TRAFFIC_KEEP_AHEAD).toBeGreaterThan(TRAFFIC_SPAWN_AHEAD);
  });
  it("changes lanes gradually with heading matching lateral motion", () => {
    let s = { x: 0, vx: 0, rot: 0, arrived: false };
    s = laneMotion(s.x, s.vx, s.rot, 3.6, 3.6, 100, 1, 1 / 60);
    expect(s.x).toBeGreaterThan(0);
    expect(s.x).toBeLessThan(0.01);
    expect(s.rot).toBeGreaterThan(0);
    for (let i = 0; i < 600; i++) s = laneMotion(s.x, s.vx, s.rot, 3.6, 3.6, 100, 1, 1 / 60);
    expect(s.x).toBeCloseTo(3.6);
    expect(s.rot).toBeCloseTo(0, 2);
  });
  it("raises the wing gradually in high speed", () => {
    const s = stepAero({ lift: 0, tilt: 0 }, 180, false, 0.05);
    expect(s.lift).toBeGreaterThan(0);
    expect(s.lift).toBeLessThan(0.1);
  });
  it("tilts the wing forward while braking", () =>
    expect(stepAero({ lift: 1, tilt: 0 }, 180, true, 0.05).tilt).toBeLessThan(0));
  it("retracts the wing when stopped", () =>
    expect(stepAero({ lift: 1, tilt: 0 }, 0, false, 5).lift).toBeLessThan(0.01));
});
