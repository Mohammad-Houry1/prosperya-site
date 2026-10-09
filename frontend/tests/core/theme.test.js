import test from "node:test";
import assert from "node:assert/strict";
import { resolveTheme } from "../../src/theme/theme.js";

test("honors an explicit persisted theme", () => {
  assert.equal(resolveTheme("dark", false), "dark");
  assert.equal(resolveTheme("light", true), "light");
});

test("uses system preference when no explicit theme exists", () => {
  assert.equal(resolveTheme(null, true), "dark");
  assert.equal(resolveTheme(null, false), "light");
});
