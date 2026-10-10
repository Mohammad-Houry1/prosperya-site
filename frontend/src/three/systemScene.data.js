/*
  Enterprise systems in the Home orchestration story.
  angle/radius describe the fragmented start relative to the orchestrated
  ellipse slot, so angular order is preserved and labels never cross.
  z gives the fragmented landscape depth; orchestration flattens it.
*/
export const SYSTEM_NODES = [
  { id: "erp", icon: "layers", slot: 90, angle: 104, radius: 1.18, z: -0.6 },
  { id: "finance", icon: "landmark", slot: 45, angle: 56, radius: 0.68, z: 0.8 },
  { id: "logistics", icon: "truck", slot: 0, angle: 12, radius: 1.08, z: 0.2 },
  { id: "warehouse", icon: "warehouse", slot: -45, angle: -28, radius: 0.8, z: -0.9 },
  { id: "analytics", icon: "chart", slot: -90, angle: -101, radius: 1.16, z: 0.5 },
  { id: "commerce", icon: "cart", slot: -135, angle: -152, radius: 0.6, z: 0.9 },
  { id: "crm", icon: "users", slot: 180, angle: 166, radius: 1.08, z: -0.4 },
  { id: "hr", icon: "badge", slot: 135, angle: 121, radius: 0.64, z: 0.3 },
];

// Pairs of systems that exchange data by hand in the fragmented landscape.
export const FRAGMENT_LINKS = [
  [0, 2], [2, 5], [5, 1], [1, 3], [3, 6], [6, 4], [4, 7], [7, 0], [0, 5], [3, 4], [1, 6],
];
