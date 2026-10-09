/*
  Pure geometry for the orchestration story, shared by the WebGL scene and the
  SVG fallback. s∈[0,1]: 0 = fragmented landscape, 1 = one operating architecture.
*/
export const ELLIPSE = { rx: 3.1, ry: 2.25 };
export const clampProgress = (value) =>
  Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const smooth = (t) => t * t * (3 - 2 * t);
const band = (s, from, span) => smooth(clampProgress((s - from) / span));

// Each story beat owns one channel: the core arrives, links draw, data flows, noise clears.
export function sceneState(progress) {
  const s = clampProgress(progress);
  return {
    order: band(s, 0.06, 0.84),
    core: band(s, 0.06, 0.26),
    links: band(s, 0.16, 0.3),
    flow: band(s, 0.42, 0.24),
    noise: 1 - band(s, 0.6, 0.34),
  };
}

const toRadians = (degrees) => (degrees * Math.PI) / 180;

export function scenePosition(node, progress, time = 0) {
  const { order } = sceneState(progress);
  const from = toRadians(node.angle);
  const to = toRadians(node.slot);
  const angle = from + Math.atan2(Math.sin(to - from), Math.cos(to - from)) * order;
  const radius = node.radius + (1 - node.radius) * order;
  const drift = (1 - order) * 0.07;
  return [
    Math.cos(angle) * ELLIPSE.rx * radius + Math.sin(time * 0.4 + node.z * 3) * drift,
    Math.sin(angle) * ELLIPSE.ry * radius + Math.cos(time * 0.33 + node.z * 5) * drift,
    node.z * (1 - order),
  ];
}

/*
  Background field: each point has a chaotic home and an ordered home on one
  of five concentric orbits. Orchestration migrates the field from one to the other.
*/
export function createField(count, seed = 11) {
  let value = seed;
  const random = () => ((value = (value * 16807) % 2147483647) - 1) / 2147483646;
  const chaos = new Float32Array(count * 3);
  const order = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const angle = random() * Math.PI * 2;
    const reach = 0.7 + random() ** 0.8 * 4.2;
    chaos[i * 3] = Math.cos(angle) * reach * 1.05;
    chaos[i * 3 + 1] = Math.sin(angle) * reach * 0.8;
    chaos[i * 3 + 2] = (random() - 0.5) * 3;
    const ring = 0.85 + (i % 5) * 0.72;
    const theta = (i / count) * Math.PI * 2 * 7 + (i % 5) * 0.4;
    order[i * 3] = Math.cos(theta) * ring * 1.12;
    order[i * 3 + 1] = Math.sin(theta) * ring * 0.8;
    order[i * 3 + 2] = -0.2;
  }
  return { chaos, order };
}
