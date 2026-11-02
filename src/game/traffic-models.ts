// Bespoke metre-scale traffic meshes. The compact is inspired by a Fox, not a licensed replica.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
export type TrafficModelKey = "fox" | "sedan" | "suv" | "pickup" | "bus";
export const VEHICLE_FINISH = {
  paint: 0x1b4f8a, // Metallic Deep Blue (Fox)
  sedan: 0x2d3238, // Metallic Gunmetal (Sedan)
  suv: 0xdcdfe4, // Pearl Platinum (SUV)
  pickup: 0x681b22, // Metallic Dark Cherry (Pickup)
  bus: 0xf2f4f8, // Intercity Transit White (Bus)
  glass: 0x0b1319, // Tinted Automotive Glass
  rubber: 0x111214, // Matte Tire Rubber
  trim: 0x1c1e22, // Satin Black Trim
  chrome: 0xd8e0e6, // Polished Chrome / Alloy Rims
  head: 0xffffff, // Xenon / LED Headlamps
  tail: 0xff1808, // Glowing Crimson LED Tail Lamps
};

export function createTrafficModel(kind: TrafficModelKey): THREE.Group {
  const root = new THREE.Group();
  const bus = kind === "bus",
    pickup = kind === "pickup",
    suv = kind === "suv";
  const length = bus ? 10.8 : pickup ? 5.1 : suv ? 4.65 : kind === "sedan" ? 4.55 : 3.85;
  const width = bus ? 2.5 : pickup || suv ? 1.92 : kind === "sedan" ? 1.82 : 1.7;
  const wheel = bus ? 0.49 : pickup || suv ? 0.39 : 0.32;
  const belt = bus ? 1.38 : suv ? 1.16 : pickup ? 1.08 : 0.91;
  const roof = bus ? 3.25 : suv ? 1.76 : pickup ? 1.72 : kind === "sedan" ? 1.46 : 1.53;
  const paint = new THREE.MeshStandardMaterial({
    color: kind === "fox" ? VEHICLE_FINISH.paint : VEHICLE_FINISH[kind],
    metalness: 0.78,
    roughness: 0.16,
  });
  const glass = new THREE.MeshStandardMaterial({
    color: VEHICLE_FINISH.glass,
    metalness: 0.85,
    roughness: 0.08,
  });
  const rubber = new THREE.MeshStandardMaterial({ color: VEHICLE_FINISH.rubber, roughness: 0.94 });
  const trim = new THREE.MeshStandardMaterial({ color: VEHICLE_FINISH.trim, roughness: 0.45 });
  const chrome = new THREE.MeshStandardMaterial({
    color: VEHICLE_FINISH.chrome,
    metalness: 0.95,
    roughness: 0.12,
  });
  const head = new THREE.MeshStandardMaterial({
    color: VEHICLE_FINISH.head,
    emissive: VEHICLE_FINISH.head,
    emissiveIntensity: 2.2,
  });
  const tail = new THREE.MeshStandardMaterial({
    color: VEHICLE_FINISH.tail,
    emissive: VEHICLE_FINISH.tail,
    emissiveIntensity: 2.5,
  });
  function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    root.add(m);
    return m;
  }
  function box(
    w: number,
    h: number,
    l: number,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    r = 0.035,
  ) {
    return mesh(new RoundedBoxGeometry(w, h, l, 2, r), mat, x, y, z);
  }
  // Contoured lower shell: wheel wells are cut into the actual body profile.
  const axleFront = -length * 0.3,
    axleRear = length * 0.3;
  const profile = new THREE.Shape();
  profile.moveTo(-length / 2 + 0.12, 0.43);
  profile.lineTo(-length / 2, 0.58);
  profile.lineTo(-length / 2 + 0.12, belt - 0.08);
  profile.lineTo(-length * 0.3, belt);
  profile.lineTo(length * 0.37, belt);
  profile.lineTo(length / 2 - 0.04, belt - 0.07);
  profile.lineTo(length / 2, 0.45);
  for (const axle of [axleRear, axleFront]) {
    profile.lineTo(axle + wheel + 0.07, 0.43);
    profile.absarc(axle, wheel, wheel + 0.07, 0, Math.PI, false);
    profile.lineTo(axle - wheel - 0.07, 0.43);
  }
  profile.closePath();
  const shell = new THREE.ExtrudeGeometry(profile, {
    depth: width - 0.1,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.05,
    bevelThickness: 0.05,
  });
  // Shape X is longitudinal; extrude axis becomes the vehicle width.
  shell.rotateY(-Math.PI / 2);
  shell.translate(width / 2 - 0.05, 0, 0);
  mesh(shell, paint);
  box(width * 0.9, 0.18, length * 0.89, trim, 0, 0.38, 0);
  // Sloped cabin loft (roof, windscreen, rear hatch) rather than stacked cubes.
  const bottomFront = bus ? -length * 0.45 : -length * 0.17;
  const bottomRear = bus
    ? length * 0.45
    : pickup
      ? length * 0.06
      : kind === "sedan"
        ? length * 0.21
        : length * 0.38;
  const roofFront = bus ? bottomFront + 0.1 : bottomFront + 0.44;
  const roofRear = bus ? bottomRear - 0.08 : bottomRear - 0.27;
  const wide = width * 0.46,
    narrow = width * 0.4;
  const vertices = [
    [-wide, belt, bottomFront],
    [wide, belt, bottomFront],
    [-narrow, roof, roofFront],
    [narrow, roof, roofFront],
    [-narrow, roof, roofRear],
    [narrow, roof, roofRear],
    [-wide, belt, bottomRear],
    [wide, belt, bottomRear],
  ];
  function face(ids: number[], mat: THREE.Material, offset = 0) {
    const values: number[] = [];
    for (let i = 1; i < ids.length - 1; i++)
      for (const id of [ids[0], ids[i], ids[i + 1]]) {
        const v = vertices[id ?? 0];
        if (v) values.push(v[0] ?? 0, (v[1] ?? 0) + offset, v[2] ?? 0);
      }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(values, 3));
    geo.computeVertexNormals();
    const m = mesh(geo, mat);
    m.material.side = THREE.DoubleSide;
    return m;
  }
  face([2, 3, 5, 4], paint);
  face([0, 1, 3, 2], glass);
  face([4, 5, 7, 6], glass);
  face([0, 2, 4, 6], glass);
  face([1, 7, 5, 3], glass);
  // Painted pillars, door frames, handles and panel seams.
  for (const side of [-1, 1]) {
    box(
      0.055,
      0.09,
      bottomRear - bottomFront,
      paint,
      side * wide,
      belt + 0.04,
      (bottomFront + bottomRear) / 2,
    );
    const pillars = bus ? 9 : 3;
    for (let i = 0; i < pillars; i++) {
      const z = roofFront + ((roofRear - roofFront) * i) / (pillars - 1);
      box(0.055, roof - belt, 0.07, paint, (side * (wide + narrow)) / 2, (roof + belt) / 2, z);
    }
    for (const z of bus ? [-3.6, 3.3] : [-0.12, 0.75]) {
      box(0.018, 0.23, 0.018, trim, side * (width / 2 + 0.014), belt - 0.16, z);
      box(0.025, 0.035, 0.17, chrome, side * (width / 2 + 0.02), belt - 0.1, z + 0.14);
    }
    const mirror = box(
      0.17,
      0.13,
      0.23,
      paint,
      side * (width / 2 + 0.1),
      belt + 0.13,
      bottomFront + 0.14,
    );
    box(
      0.02,
      0.09,
      0.15,
      glass,
      mirror.position.x + side * 0.087,
      mirror.position.y,
      mirror.position.z,
    );
  }
  if (pickup) {
    box(width * 0.8, 0.06, length * 0.35, trim, 0, belt - 0.08, length * 0.26);
    for (const side of [-1, 1])
      box(0.09, 0.16, length * 0.35, paint, side * width * 0.44, belt + 0.025, length * 0.26);
    box(width * 0.9, 0.15, 0.09, paint, 0, belt + 0.02, length / 2 - 0.1);
  }
  if (suv)
    for (const side of [-1, 1])
      box(
        0.055,
        0.055,
        (roofRear - roofFront) * 0.88,
        chrome,
        side * width * 0.32,
        roof + 0.055,
        (roofRear + roofFront) / 2,
      );
  for (const side of [-1, 1])
    for (const axle of [axleFront, axleRear]) {
      const x = side * (width / 2 - 0.05);
      const tire = mesh(new THREE.CylinderGeometry(wheel, wheel, 0.23, 20), rubber, x, wheel, axle);
      tire.rotation.z = Math.PI / 2;
      const rim = mesh(
        new THREE.CylinderGeometry(wheel * 0.69, wheel * 0.69, 0.245, 16),
        chrome,
        x,
        wheel,
        axle,
      );
      rim.rotation.z = Math.PI / 2;
      const hub = mesh(
        new THREE.CylinderGeometry(wheel * 0.24, wheel * 0.24, 0.25, 12),
        trim,
        x,
        wheel,
        axle,
      );
      hub.rotation.z = Math.PI / 2;
      for (let spoke = 0; spoke < 5; spoke++) {
        const a = (spoke * Math.PI * 2) / 5;
        const m = box(0.012, wheel * 0.98, 0.045, trim, x + side * 0.128, wheel, axle);
        m.rotation.x = a;
      }
    }
  for (const side of [-1, 1]) {
    box(
      width * 0.22,
      bus ? 0.18 : 0.13,
      0.05,
      head,
      side * width * 0.32,
      belt - 0.16,
      -length / 2 - 0.015,
    );
    box(
      bus ? 0.15 : width * 0.18,
      bus ? 0.48 : 0.2,
      0.05,
      tail,
      side * width * 0.36,
      belt - 0.16,
      length / 2 + 0.015,
    );
  }
  box(width * 0.4, 0.18, 0.055, trim, 0, belt - 0.18, -length / 2 - 0.03);
  for (let i = 0; i < 4; i++)
    box(width * 0.37, 0.012, 0.012, chrome, 0, belt - 0.23 + i * 0.037, -length / 2 - 0.06);
  for (const z of [-length / 2, length / 2]) {
    box(width * 0.95, 0.1, 0.08, trim, 0, 0.47, z);
    box(0.34, 0.1, 0.012, chrome, 0, 0.63, z + Math.sign(z) * 0.056);
  }
  if (bus) {
    box(width * 0.7, 0.14, 3.2, paint, 0, roof + 0.04, 0.7);
    for (const side of [-1, 1])
      box(0.025, 0.1, length * 0.87, chrome, side * width * 0.503, 1.18, 0);
  }
  root.updateMatrixWorld(true);
  const batches = new Map<THREE.Material, THREE.BufferGeometry[]>();
  root.traverse((o) => {
    if (!(o instanceof THREE.Mesh) || Array.isArray(o.material)) return;
    const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    g.applyMatrix4(o.matrixWorld);
    g.deleteAttribute("uv");
    const list = batches.get(o.material) ?? [];
    list.push(g);
    batches.set(o.material, list);
  });
  const result = new THREE.Group();
  result.name = kind;
  for (const [mat, geos] of batches) {
    const geo = mergeGeometries(geos);
    if (geo) result.add(new THREE.Mesh(geo, mat));
    for (const g of geos) g.dispose();
  }
  return result;
}
