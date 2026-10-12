import SignalWave from "../visuals/SignalWave.jsx";
import { caseStudyAnimationShape } from "./caseStudyMedia.js";

// CaseStudy has an animation selector but no diagram-node fields. These presets
// stay decorative; no business systems, labels or processes are invented.
export default function CaseStudyAnimation({ type }) {
  const shape = caseStudyAnimationShape(type);
  return shape ? <div data-case-study-animation={type} aria-hidden="true"><SignalWave shape={shape} /></div> : null;
}
