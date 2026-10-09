export const companyData = {
  leadership: [
    {
      id: "walid-houry",
      initials: "WH",
      linkedin: null,
      copy: {
        en: {
          name: "Walid Houry",
          role: "Founder & Managing Director",
          bio: "Enterprise systems consultant focused on NetSuite, integrations, finance operations and supply-chain transformation.",
        },
        fr: {
          name: "Walid Houry",
          role: "Fondateur et directeur général",
          bio: "Consultant en systèmes d’entreprise spécialisé en NetSuite, intégrations, opérations financières et transformation supply chain.",
        },
      },
    },
  ],
  process: [
    {
      id: "discover",
      number: "01",
      copy: {
        en: {
          title: "Discover",
          description:
            "Understand the operating model, constraints and sources of friction.",
        },
        fr: {
          title: "Découvrir",
          description:
            "Comprendre le modèle opérationnel, les contraintes et les points de friction.",
        },
      },
    },
    {
      id: "architect",
      number: "02",
      copy: {
        en: {
          title: "Architect",
          description:
            "Define process boundaries, system responsibilities and the target architecture.",
        },
        fr: {
          title: "Architecturer",
          description:
            "Définir les frontières de processus, les responsabilités des systèmes et l’architecture cible.",
        },
      },
    },
    {
      id: "build",
      number: "03",
      copy: {
        en: {
          title: "Build",
          description:
            "Configure, integrate and automate against explicit design decisions.",
        },
        fr: {
          title: "Construire",
          description:
            "Configurer, intégrer et automatiser selon des décisions d’architecture explicites.",
        },
      },
    },
    {
      id: "migrate",
      number: "04",
      copy: {
        en: {
          title: "Migrate",
          description:
            "Move data through controlled validation and reconciliation.",
        },
        fr: {
          title: "Migrer",
          description:
            "Migrer les données avec validation et réconciliation contrôlées.",
        },
      },
    },
    {
      id: "validate",
      number: "05",
      copy: {
        en: {
          title: "Validate",
          description:
            "Test real business scenarios, controls and exception paths.",
        },
        fr: {
          title: "Valider",
          description:
            "Tester les scénarios métiers réels, contrôles et chemins d’exception.",
        },
      },
    },
    {
      id: "launch",
      number: "06",
      copy: {
        en: {
          title: "Launch",
          description:
            "Go live with ownership, observability and support paths in place.",
        },
        fr: {
          title: "Lancer",
          description:
            "Mettre en production avec responsabilités, observabilité et support clairement définis.",
        },
      },
    },
    {
      id: "optimize",
      number: "07",
      copy: {
        en: {
          title: "Optimize",
          description:
            "Measure friction and improve the architecture as the organization evolves.",
        },
        fr: {
          title: "Optimiser",
          description:
            "Mesurer les frictions et faire évoluer l’architecture avec l’organisation.",
        },
      },
    },
  ],
};

// Stage detail for the Approach path: icon, key activities and what the stage hands over.
const stageDetail = {
  discover: ["search", ["Stakeholder interviews", "Process discovery", "Data assessment"], ["Entretiens avec les parties prenantes", "Découverte des processus", "Évaluation des données"], "Current-state map and priorities", "Cartographie de l’existant et priorités"],
  architect: ["ruler", ["Target operating model", "Integration design", "Data model"], ["Modèle opérationnel cible", "Conception des intégrations", "Modèle de données"], "Target architecture and roadmap", "Architecture cible et feuille de route"],
  build: ["cog", ["Configuration", "Custom development", "Peer reviews"], ["Paramétrage", "Développements sur mesure", "Revues croisées"], "A working, reviewed solution", "Une solution fonctionnelle et relue"],
  migrate: ["database", ["Data cleansing", "Rehearsed loads", "Reconciliation"], ["Nettoyage des données", "Chargements répétés", "Rapprochements"], "Reconciled, trusted data", "Des données rapprochées et fiables"],
  validate: ["shield", ["End-to-end scenarios", "User acceptance", "Performance & security"], ["Scénarios de bout en bout", "Recette utilisateurs", "Performance & sécurité"], "Business sign-off", "Validation par le métier"],
  launch: ["rocket", ["Cutover plan", "Hypercare", "Monitoring"], ["Plan de bascule", "Hypercare", "Supervision"], "A stable go-live", "Un démarrage stable"],
  optimize: ["chart", ["Performance reviews", "Enhancement backlog", "Automation"], ["Revues de performance", "Backlog d’améliorations", "Automatisation"], "Measured, continuous gains", "Des gains mesurés et continus"],
};
for (const step of companyData.process) {
  const [icon, en, fr, deliverableEn, deliverableFr] = stageDetail[step.id];
  step.icon = icon;
  Object.assign(step.copy.en, { activities: en, deliverable: deliverableEn });
  Object.assign(step.copy.fr, { activities: fr, deliverable: deliverableFr });
}
