// These decorative presets correspond to the CaseStudy CMS animation selector.
const animationShapes = { "flowing-lines": "ribbon", consolidation: "audit", workflow: "structure", network: "arc", insight: "rise" };

export const caseStudyAnimationShape = type => Object.hasOwn(animationShapes, type) ? animationShapes[type] : null;
export const hasCaseStudyImage = study => Boolean(study?.image?.src);
