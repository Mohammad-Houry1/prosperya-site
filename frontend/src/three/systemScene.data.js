/*
  Layout slots for the Home orchestration story; the systems themselves come
  from the CMS home page (hub_systems).
  angle/radius describe the fragmented start relative to the orchestrated
  ellipse slot, so angular order is preserved and labels never cross.
  z gives the fragmented landscape depth; orchestration flattens it.
*/
export const HUB_SLOTS = [
  { slot: 90, angle: 104, radius: 1.18, z: -0.6 },
  { slot: 45, angle: 56, radius: 0.68, z: 0.8 },
  { slot: 0, angle: 12, radius: 1.08, z: 0.2 },
  { slot: -45, angle: -28, radius: 0.8, z: -0.9 },
  { slot: -90, angle: -101, radius: 1.16, z: 0.5 },
  { slot: -135, angle: -152, radius: 0.6, z: 0.9 },
  { slot: 180, angle: 166, radius: 1.08, z: -0.4 },
  { slot: 135, angle: 121, radius: 0.64, z: 0.3 },
];

// Pairs of slots that exchange data by hand in the fragmented landscape.
const FRAGMENT_LINKS = [
  [0, 2], [2, 5], [5, 1], [1, 3], [3, 6], [6, 4], [4, 7], [7, 0], [0, 5], [3, 4], [1, 6],
];

/*
  Places CMS systems on the tuned slots, spread evenly when there are fewer.
  ponytail: the overlap-free layout is hand-tuned for 8 slots, so systems past
  the eighth are dropped; add slots (and rerun sceneGeometry.test) to show more.
*/
export function hubScene(systems = []) {
  const items = systems.filter((system) => system.title).slice(0, HUB_SLOTS.length);
  const picks = items.map((_, index) => Math.floor((index * HUB_SLOTS.length) / items.length));
  const nodes = items.map((system, index) => ({ ...HUB_SLOTS[picks[index]], id: String(index), label: system.title, icon: system.icon }));
  const links = FRAGMENT_LINKS.flatMap(([a, b]) => {
    const from = picks.indexOf(a);
    const to = picks.indexOf(b);
    return from >= 0 && to >= 0 ? [[from, to]] : [];
  });
  return { nodes, links };
}
