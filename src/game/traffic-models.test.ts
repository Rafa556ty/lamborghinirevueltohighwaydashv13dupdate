import { it, expect } from "vitest";
import * as THREE from "three";
import { createTrafficModel } from "./traffic-models";
import { isolateActiveWing } from "./active-wing";
it("custom vehicles are grounded with correctly sized bodies", () => {
  for (const [kind, length] of [
    ["fox", 3.85],
    ["sedan", 4.55],
    ["suv", 4.65],
    ["pickup", 5.1],
    ["bus", 10.8],
  ] as const) {
    const model = createTrafficModel(kind),
      b = new THREE.Box3().setFromObject(model);
    expect(b.min.y).toBeCloseTo(0, 3);
    expect(b.getSize(new THREE.Vector3()).z).toBeCloseTo(length, 0.0);
    expect(model.children.length).toBeLessThan(9);
  }
});
it("extracts real aero triangles and removes them from the static body", () => {
  const group = new THREE.Group(),
    geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [-0.5, 1, 2, 0.5, 1, 2, 0, 1, 2.4, -0.5, 0.5, 0, 0.5, 0.5, 0, 0, 0.5, 1],
      3,
    ),
  );
  const mat = new THREE.MeshStandardMaterial();
  mat.name = "Body";
  const body = new THREE.Mesh(geometry, mat);
  group.add(body);
  const wing = isolateActiveWing(group);
  expect(wing).not.toBeNull();
  expect(body.geometry.getAttribute("position").count).toBe(3);
  expect(wing?.children.length).toBe(1);
});
