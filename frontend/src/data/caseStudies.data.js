export const caseStudiesData = [
  {
    id: "global-retail-core",
    slug: "global-retail-core",
    image: {
      src: "/images/enterprise-warehouse.webp",
      width: 1200,
      height: 800,
    },
    category: "Global Retail",
    featured: true,
    platformIds: ["netsuite", "salesforce", "celigo", "tableau"],
    expertiseIds: ["erp-transformation", "systems-integration"],
    metrics: [
      {
        id: "markets",
        value: "18",
        copy: {
          en: { label: "Markets aligned" },
          fr: { label: "Marchés alignés" },
        },
      },
      {
        id: "flows",
        value: "31",
        copy: {
          en: { label: "Critical flows orchestrated" },
          fr: { label: "Flux critiques orchestrés" },
        },
      },
      {
        id: "model",
        value: "1",
        copy: {
          en: { label: "Operating model" },
          fr: { label: "Modèle opérationnel" },
        },
      },
    ],
    copy: {
      en: {
        name: "Global Retail Transformation",
        title: "One operating model across a global retail network.",
        description:
          "A fragmented ERP and CRM landscape reorganized into a coherent architecture for finance, commerce and operations.",
        challenge:
          "Regional workflows had evolved independently, creating duplicate data, manual handoffs and inconsistent reporting.",
        solution:
          "Prosperya defined the target operating architecture, rationalized integrations and established controlled data flows around NetSuite.",
        outcome:
          "Teams gained a clearer system of record, cleaner cross-system handoffs and an architecture designed for continued expansion.",
      },
      fr: {
        name: "Transformation retail internationale",
        title:
          "Un modèle opérationnel unique pour un réseau retail international.",
        description:
          "Un paysage ERP et CRM fragmenté réorganisé en une architecture cohérente pour la finance, le commerce et les opérations.",
        challenge:
          "Les processus régionaux avaient évolué séparément, créant des doublons, des tâches manuelles et un reporting incohérent.",
        solution:
          "Prosperya a défini l’architecture cible, rationalisé les intégrations et structuré les flux autour de NetSuite.",
        outcome:
          "Les équipes disposent d’un système de référence plus clair, de flux inter-systèmes plus fiables et d’une architecture évolutive.",
      },
    },
  },
  {
    id: "multi-entity-finance",
    slug: "multi-entity-finance",
    cover: "ledger",
    category: "Finance Transformation",
    featured: true,
    platformIds: ["netsuite", "yooz", "kyriba", "onestream"],
    expertiseIds: ["erp-transformation", "automation-custom-development"],
    metrics: [
      {
        id: "entities",
        value: "12",
        copy: {
          en: { label: "Entities standardized" },
          fr: { label: "Entités standardisées" },
        },
      },
      {
        id: "manual",
        value: "−42%",
        copy: {
          en: { label: "Manual finance touchpoints" },
          fr: { label: "Interactions financières manuelles" },
        },
      },
      {
        id: "close",
        value: "5d",
        copy: {
          en: { label: "Faster close cycle" },
          fr: { label: "Cycle de clôture accéléré" },
        },
      },
    ],
    copy: {
      en: {
        name: "Multi-entity Finance Platform",
        title: "Finance operations designed for multi-entity scale.",
        description:
          "Standardizing financial processes and automation across entities without flattening local requirements.",
        challenge:
          "Finance teams depended on spreadsheets and inconsistent approval paths across entities.",
        solution:
          "A common NetSuite model, automation rules and connected finance tools created one controlled financial backbone.",
        outcome:
          "Reduced manual work, more consistent controls and a faster route from transaction to trusted reporting.",
      },
      fr: {
        name: "Plateforme finance multi-entités",
        title:
          "Des opérations financières conçues pour l’échelle multi-entités.",
        description:
          "Standardiser les processus et l’automatisation sans effacer les besoins locaux.",
        challenge:
          "Les équipes finance dépendaient de feuilles de calcul et de circuits d’approbation incohérents.",
        solution:
          "Un modèle NetSuite commun, des règles d’automatisation et des outils financiers connectés ont créé un socle contrôlé.",
        outcome:
          "Moins de tâches manuelles, des contrôles plus cohérents et un reporting fiable plus rapidement.",
      },
    },
  },
  {
    id: "connected-commerce",
    slug: "connected-commerce",
    cover: "flow",
    category: "Connected Commerce",
    featured: false,
    platformIds: ["netsuite", "salesforce", "celigo", "hubspot"],
    expertiseIds: ["systems-integration"],
    metrics: [
      {
        id: "handoffs",
        value: "24/7",
        copy: {
          en: { label: "Automated synchronization" },
          fr: { label: "Synchronisation automatisée" },
        },
      },
      {
        id: "manual",
        value: "0",
        copy: {
          en: { label: "Duplicate order entry" },
          fr: { label: "Double saisie de commandes" },
        },
      },
    ],
    copy: {
      en: {
        name: "Connected Commerce Program",
        title: "A connected path from demand to delivery.",
        description:
          "CRM, orders and ERP synchronized around explicit integration contracts and observable failure states.",
        challenge:
          "Manual handoffs between commercial and finance systems created delays and mismatched records.",
        solution:
          "Prosperya designed event flows and reconciliation rules between CRM, integration middleware and NetSuite.",
        outcome:
          "Cleaner order handoffs, better visibility and less operational effort spent reconciling systems.",
      },
      fr: {
        name: "Programme commerce connecté",
        title: "Un parcours connecté de la demande à la livraison.",
        description:
          "CRM, commandes et ERP synchronisés autour de contrats d’intégration explicites et d’échecs observables.",
        challenge:
          "Les transferts manuels entre systèmes commerciaux et financiers créaient retards et incohérences.",
        solution:
          "Prosperya a conçu les flux événementiels et les règles de réconciliation entre CRM, middleware et NetSuite.",
        outcome:
          "Des transferts de commandes plus propres, une meilleure visibilité et moins de temps consacré aux rapprochements.",
      },
    },
  },
  {
    id: "erp-rescue-program",
    slug: "erp-rescue-program",
    cover: "stabilize",
    category: "ERP Rescue",
    featured: true,
    platformIds: ["netsuite", "salesforce"],
    expertiseIds: ["erp-optimization"],
    metrics: [
      {
        id: "issues",
        value: "47",
        copy: {
          en: { label: "Root causes isolated" },
          fr: { label: "Causes racines isolées" },
        },
      },
      {
        id: "priority",
        value: "6",
        copy: {
          en: { label: "Critical fixes sequenced" },
          fr: { label: "Correctifs critiques priorisés" },
        },
      },
    ],
    copy: {
      en: {
        name: "ERP Rescue Program",
        title: "When the implementation becomes the problem.",
        description:
          "A rescue program focused on root causes, financial trust and maintainable configuration—not another layer of patches.",
        challenge:
          "Years of reactive customization had created fragile workflows, unclear ownership and reporting distrust.",
        solution:
          "Prosperya audited configuration, scripts, integrations and data before sequencing remediation by business risk.",
        outcome:
          "A simpler environment, clearer controls and a roadmap that reduced technical debt without destabilizing operations.",
      },
      fr: {
        name: "Programme de redressement ERP",
        title: "Quand l’implémentation devient elle-même le problème.",
        description:
          "Un programme de redressement centré sur les causes racines, la fiabilité financière et une configuration maintenable.",
        challenge:
          "Des années de personnalisations réactives avaient créé des workflows fragiles, une responsabilité floue et une perte de confiance dans le reporting.",
        solution:
          "Prosperya a audité configuration, scripts, intégrations et données avant de séquencer la remédiation selon le risque métier.",
        outcome:
          "Un environnement simplifié, des contrôles plus clairs et une feuille de route réduisant la dette technique sans déstabiliser les opérations.",
      },
    },
  },
];
