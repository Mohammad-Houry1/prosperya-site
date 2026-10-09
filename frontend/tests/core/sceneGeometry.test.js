import test from "node:test";
import assert from "node:assert/strict";
import { SYSTEM_NODES } from "../../src/three/systemScene.data.js";
import {
  scenePosition,
  sceneState,
  createField,
} from "../../src/three/sceneGeometry.js";
import { projectFallback } from "../../src/components/system/fallbackProjection.js";

test("orchestration labels stay separated throughout the scroll story", () => {
  // SVG fallback labels are 112 × 30 in a 600 × 440 viewBox; include an 8px gutter.
  for (let step = 0; step <= 100; step++) {
    for (const time of [0, 4, 9, 18]) {
      const points = SYSTEM_NODES.map((node) =>
        projectFallback(scenePosition(node, step / 100, time)),
      );
      for (let a = 0; a < points.length; a++) {
        for (let b = a + 1; b < points.length; b++) {
          assert.ok(
            Math.abs(points[a][0] - points[b][0]) >= 120 ||
              Math.abs(points[a][1] - points[b][1]) >= 38,
            `${SYSTEM_NODES[a].id} and ${SYSTEM_NODES[b].id} overlap at progress ${step / 100}`,
          );
        }
      }
      for (const [x, y] of points) {
        assert.ok(x - 56 >= 0 && x + 56 <= 600 && y - 15 >= 0 && y + 15 <= 440);
      }
    }
  }
});

test("story channels start fragmented and finish orchestrated", () => {
  assert.deepEqual(sceneState(0), { order: 0, core: 0, links: 0, flow: 0, noise: 1 });
  assert.deepEqual(sceneState(1), { order: 1, core: 1, links: 1, flow: 1, noise: 0 });
  const middle = sceneState(0.5);
  assert.ok(middle.links > middle.flow, "connections form before data flows");
});

test("background field is deterministic", () => {
  assert.deepEqual(createField(20).chaos, createField(20).chaos);
});
