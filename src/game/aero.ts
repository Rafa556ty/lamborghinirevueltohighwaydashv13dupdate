export type AeroState = { lift: number; tilt: number };
export function stepAero(state: AeroState, speed: number, braking: boolean, dt: number): AeroState {
  const deployed = speed > 120 ? 1 : speed < 65 ? 0 : state.lift;
  const lift = state.lift + (deployed - state.lift) * (1 - Math.exp(-1.2 * dt));
  const targetTilt = braking && speed > 15 ? -0.18 : 0;
  return { lift, tilt: state.tilt + (targetTilt - state.tilt) * (1 - Math.exp(-2 * dt)) };
}
