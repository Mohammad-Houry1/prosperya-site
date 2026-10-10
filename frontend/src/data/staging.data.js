import { expertiseData } from "./expertise.data.js";
import { localizeEntity } from "../repositories/localize.js";

// Staging-only reference content. Nothing in this file is read from the CMS.
export const stagingPlatforms = ["NetSuite", "Salesforce", "HubSpot", "Celigo", "Agicap", "OneStream", "Yooz", "Kyriba", "Tableau"].map((name) => ({ id: name.toLowerCase(), slug: name.toLowerCase(), name }));

export function stagingTestimonials(locale) {
  const fr = locale === "fr";
  return [{ id: "reference", name: fr ? "Nom du client à renseigner" : "Client name to fill in", company: fr ? "Entreprise à renseigner" : "Company to fill in", role: fr ? "Texte de référence — à remplacer par un témoignage approuvé" : "Reference text — replace with an approved testimonial", quote: fr ? "Insérez ici le témoignage approuvé du client pour présenter son expérience et les résultats du projet." : "Add the approved client testimonial here to describe their experience and the project outcomes." }];
}

export function stagingFaqs(locale) {
  const fr = locale === "fr";
  return [
    { id: "start", question: fr ? "Comment commence un projet ?" : "How does a project start?", answer: fr ? "<p>Nous commençons par comprendre votre modèle opérationnel, vos contraintes et les sources de friction.</p>" : "<p>We start by understanding your operating model, constraints and sources of friction.</p>" },
    { id: "delivery", question: fr ? "Comment se déroule la mise en œuvre ?" : "How is implementation delivered?", answer: fr ? "<p>Découvrir, architecturer, construire, migrer, valider, lancer et optimiser : chaque étape prépare la suivante.</p>" : "<p>Discover, architect, build, migrate, validate, launch and optimize: each stage prepares the next.</p>" },
  ];
}

// Reuse the original expertise copy as article-layout reference material.
export function stagingArticles(locale) {
  return localizeEntity(expertiseData, locale).slice(0, 3).map((item) => ({ id: item.id, slug: item.slug, title: item.detailTitle, excerpt: item.description, body: `<p>${item.description}</p><p>${item.tagline || item.description}</p>`, category_id: "expertise", featured: false, published_at: "2026-10-10", cover_image: null, seo: null }));
}

export function stagingLegalPages(locale) {
  const fr = locale === "fr";
  return [
    ["privacy-policy", "Privacy policy", "Politique de confidentialité"],
    ["terms-of-use", "Terms of use", "Conditions d’utilisation"],
    ["cookie-policy", "Cookie policy", "Politique de cookies"],
    ["accessibility", "Accessibility", "Accessibilité"],
  ].map(([slug, en, french]) => ({ id: slug, slug, title: fr ? french : en, description: fr ? "Texte de référence pour la mise en page. Renseignez le contenu approuvé dans le CMS." : "Layout reference text. Add the approved content in the CMS.", sections: [{ title: fr ? "Contenu à renseigner" : "Content to fill in", description: fr ? "<p>Cette page permet de vérifier la présentation du contenu. Remplacez ce texte par votre document approuvé.</p>" : "<p>This page previews the content layout. Replace this text with your approved document.</p>" }], updated_at: null }));
}
