export const expertiseData = [
  {
    id: "erp-transformation",
    slug: "erp-transformation",
    number: "01",
    tone: "transform",
    services: ["ERP Strategy", "Process Design", "Data Migration", "Go-live"],
    relatedPlatformIds: ["netsuite", "oracle"],
    relatedCaseStudyIds: ["global-retail-core", "multi-entity-finance"],
    copy: {
      en: {
        title: "Transform",
        eyebrow: "ERP Transformation",
        description:
          "Design and implement an enterprise operating system around how the business actually works.",
        longDescription:
          "From discovery and process architecture to migration, validation and launch, Prosperya turns transformation programs into controlled operating change.",
      },
      fr: {
        title: "Transformer",
        eyebrow: "Transformation ERP",
        description:
          "Concevoir et déployer un système d’entreprise autour du fonctionnement réel de l’organisation.",
        longDescription:
          "De la découverte à l’architecture des processus, puis à la migration, la validation et au lancement, Prosperya transforme les programmes ERP en changements maîtrisés.",
      },
    },
  },
  {
    id: "systems-integration",
    slug: "systems-integration",
    number: "02",
    tone: "connect",
    services: [
      "API Architecture",
      "Celigo",
      "CRM Integration",
      "Finance Platforms",
    ],
    relatedPlatformIds: ["netsuite", "salesforce", "celigo", "hubspot"],
    relatedCaseStudyIds: ["connected-commerce", "global-retail-core"],
    copy: {
      en: {
        title: "Connect",
        eyebrow: "Systems Integration",
        description:
          "Make ERP, CRM, finance, commerce and operational platforms behave like one architecture.",
        longDescription:
          "Prosperya designs resilient data flows, integration contracts and operational safeguards so enterprise systems exchange the right data at the right time.",
      },
      fr: {
        title: "Connecter",
        eyebrow: "Intégration des systèmes",
        description:
          "Faire fonctionner l’ERP, le CRM, la finance, le commerce et les opérations comme une seule architecture.",
        longDescription:
          "Prosperya conçoit des flux de données robustes, des contrats d’intégration et des garde-fous opérationnels pour que les systèmes échangent la bonne donnée au bon moment.",
      },
    },
  },
  {
    id: "automation-custom-development",
    slug: "automation-custom-development",
    number: "03",
    tone: "automate",
    services: [
      "SuiteScript",
      "Workflows",
      "Process Automation",
      "Custom Tooling",
    ],
    relatedPlatformIds: ["netsuite", "celigo"],
    relatedCaseStudyIds: ["multi-entity-finance"],
    copy: {
      en: {
        title: "Automate",
        eyebrow: "Automation & Custom Development",
        description:
          "Remove repetitive work with workflows and custom logic built around the operating model.",
        longDescription:
          "Automation is treated as architecture, not decoration: clear triggers, safe failure states, traceable outcomes and maintainable custom logic.",
      },
      fr: {
        title: "Automatiser",
        eyebrow: "Automatisation & développement sur mesure",
        description:
          "Supprimer les tâches répétitives grâce à des workflows et une logique sur mesure alignés sur le modèle opérationnel.",
        longDescription:
          "L’automatisation est traitée comme une architecture : déclencheurs clairs, échecs maîtrisés, résultats traçables et logique maintenable.",
      },
    },
  },
  {
    id: "erp-optimization",
    slug: "erp-optimization",
    number: "04",
    tone: "optimize",
    services: ["ERP Audit", "ERP Rescue", "Performance", "Data Remediation"],
    relatedPlatformIds: ["netsuite", "salesforce"],
    relatedCaseStudyIds: ["erp-rescue-program"],
    copy: {
      en: {
        title: "Optimize",
        eyebrow: "ERP Audit & Rescue",
        description:
          "Repair, simplify and restructure ERP environments that have become difficult to trust or scale.",
        longDescription:
          "Prosperya audits configuration, integrations, financial data and workflows to isolate root causes before making controlled improvements.",
      },
      fr: {
        title: "Optimiser",
        eyebrow: "Audit & redressement ERP",
        description:
          "Réparer, simplifier et restructurer les environnements ERP devenus difficiles à fiabiliser ou à faire évoluer.",
        longDescription:
          "Prosperya audite la configuration, les intégrations, les données financières et les workflows afin d’identifier les causes racines avant toute amélioration.",
      },
    },
  },
];

const capabilityDetails = {
  "erp-transformation": {
    en: "ERP Transformation",
    fr: "Transformation ERP",
    services: [
      "Stratégie ERP",
      "Conception des processus",
      "Migration des données",
      "Mise en production",
    ],
  },
  "systems-integration": {
    en: "Systems Integration",
    fr: "Intégration des systèmes",
    services: [
      "Architecture API",
      "Celigo",
      "Intégration CRM",
      "Plateformes financières",
    ],
  },
  "automation-custom-development": {
    en: "Automation & Custom Development",
    fr: "Automatisation et développement sur mesure",
    services: [
      "SuiteScript",
      "Flux de travail",
      "Automatisation des processus",
      "Outils sur mesure",
    ],
  },
  "erp-optimization": {
    en: "ERP Audit & Optimization",
    fr: "Audit et optimisation ERP",
    services: [
      "Audit ERP",
      "Analyse des causes",
      "Performance",
      "Fiabilisation des données",
    ],
  },
};
for (const item of expertiseData) {
  const detail = capabilityDetails[item.id];
  item.copy.en.detailTitle = detail.en;
  item.copy.fr.detailTitle = detail.fr;
  item.copy.en.services = item.services;
  item.copy.fr.services = detail.services;
}
expertiseData.push(
  {
    id: "netsuite-implementation",
    slug: "netsuite-implementation",
    number: "05",
    tone: "transform",
    relatedPlatformIds: ["netsuite", "celigo"],
    relatedCaseStudyIds: ["global-retail-core"],
    copy: {
      en: {
        title: "NetSuite",
        detailTitle: "NetSuite Implementation",
        eyebrow: "NetSuite Implementation",
        description: "A unified foundation for finance, operations and growth.",
        longDescription:
          "Implement NetSuite around your operating model, with controlled configuration, reliable migration and a clear path to adoption.",
        services: [
          "Solution design",
          "Configuration and extensions",
          "Data migration",
          "Training and launch",
        ],
      },
      fr: {
        title: "NetSuite",
        detailTitle: "Implémentation NetSuite",
        eyebrow: "Implémentation NetSuite",
        description:
          "Un socle unifié pour la finance, les opérations et la croissance.",
        longDescription:
          "Déployer NetSuite autour de votre modèle opérationnel, avec un paramétrage maîtrisé, une migration fiable et un accompagnement à l’adoption.",
        services: [
          "Conception de la solution",
          "Paramétrage et extensions",
          "Migration des données",
          "Formation et lancement",
        ],
      },
    },
  },
  {
    id: "erp-rescue",
    slug: "erp-rescue",
    number: "06",
    tone: "optimize",
    relatedPlatformIds: ["netsuite"],
    relatedCaseStudyIds: ["erp-rescue-program"],
    copy: {
      en: {
        title: "ERP Rescue",
        detailTitle: "ERP Rescue",
        eyebrow: "ERP Rescue",
        description:
          "Restore confidence in an ERP program that has lost direction.",
        longDescription:
          "Establish the facts, stabilize critical operations and build a prioritized recovery plan with clear ownership and measurable checkpoints.",
        services: [
          "Independent assessment",
          "Operational stabilization",
          "Recovery roadmap",
          "Controlled remediation",
        ],
      },
      fr: {
        title: "Redressement ERP",
        detailTitle: "Redressement ERP",
        eyebrow: "Redressement ERP",
        description:
          "Redonner une direction claire à un programme ERP en difficulté.",
        longDescription:
          "Établir les faits, stabiliser les opérations critiques et construire un plan de redressement priorisé avec des responsabilités et des jalons explicites.",
        services: [
          "Diagnostic indépendant",
          "Stabilisation opérationnelle",
          "Plan de redressement",
          "Remédiation maîtrisée",
        ],
      },
    },
  },
);

// Short card copy and icon names (see SystemIcon) used by overview cards.
const cardCopy = {
  "erp-transformation": ["grid", "Reimagine operations and modernize your business on the right platform.", "Repenser les opérations et moderniser l’entreprise sur la bonne plateforme."],
  "systems-integration": ["share", "Integrate systems, data and partners into a secure, real-time ecosystem.", "Intégrer systèmes, données et partenaires dans un écosystème sûr et temps réel."],
  "automation-custom-development": ["zap", "Eliminate manual work and orchestrate workflows that scale with your business.", "Supprimer le travail manuel et orchestrer des workflows qui suivent votre croissance."],
  "erp-optimization": ["target", "Turn data into insight and continuously improve performance.", "Transformer les données en décisions et améliorer la performance en continu."],
  "netsuite-implementation": ["cloud", "Implement NetSuite around your operating model, from design to adoption.", "Déployer NetSuite autour de votre modèle opérationnel, de la conception à l’adoption."],
  "erp-rescue": ["lifebuoy", "Stabilize a struggling program with rapid assessment and a clear path forward.", "Stabiliser un programme en difficulté grâce à un diagnostic rapide et un plan clair."],
};
for (const item of expertiseData) {
  const [icon, en, fr] = cardCopy[item.id];
  item.icon = icon;
  item.copy.en.summary = en;
  item.copy.fr.summary = fr;
}
