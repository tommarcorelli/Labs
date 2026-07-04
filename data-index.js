// TP & Labs IT — Index principal
// Ce fichier assemble tous les fichiers de données par catégorie.
// Pour ajouter des TPs dans une catégorie, éditer uniquement le fichier correspondant.

const CATEGORIES = {
  reseau:         { label: "Réseau & Infrastructure",       couleur: "#3B82F6", icone: "🌐" },
  securite:       { label: "Sécurité - Cyber",              couleur: "#EF4444", icone: "🔐" },
  systemes:       { label: "Systèmes (Linux · Windows)",    couleur: "#10B981", icone: "🖥️" },
  virtualisation: { label: "Virtualisation",                couleur: "#8B5CF6", icone: "📦" },
  automatisation: { label: "Automatisation & IaC & Docker", couleur: "#F59E0B", icone: "⚙️" },
  sauvegardes:    { label: "Sauvegardes & PRA",             couleur: "#06B6D4", icone: "💾" },
  supervision:    { label: "Supervision",                   couleur: "#84CC16", icone: "📊" },
  slam:           { label: "SLAM",                          couleur: "#EC4899", icone: "💻" },
  projets:        { label: "Projets & Veille",              couleur: "#F97316", icone: "🚀" }
};

const LABS = [
  ...LABS_RESEAU,
  ...LABS_SYSTEMES,
  ...LABS_VIRTUALISATION,
  ...LABS_SECURITE,
  ...LABS_SUPERVISION,
  ...LABS_AUTOMATISATION,
  ...LABS_SAUVEGARDES,
  ...LABS_PROJETS,
  ...LABS_SLAM,
];

window.CATEGORIES = CATEGORIES;
window.LABS = LABS;
