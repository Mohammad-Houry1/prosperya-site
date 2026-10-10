import SignalWave from "../visuals/SignalWave.jsx";

// CaseStudy has an animation selector but no diagram-node fields. These presets
// stay decorative; no business systems, labels or processes are invented.
const shapes = { "flowing-lines": "ribbon", consolidation: "audit", workflow: "structure", network: "arc", insight: "rise" };

export default function CaseStudyAnimation({ type }) {
  const shape = shapes[type];
  return shape ? <div data-case-study-animation={type} aria-hidden="true"><SignalWave shape={shape} /></div> : null;
}
