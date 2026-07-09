# 📋 Backlog d'améliorations — TP & Labs IT

Idées classées par thème, pour reprendre plus tard. Rien n'est urgent — c'est une liste d'options, pas un plan figé.

---

## ☁️ Sync / Sauvegarde

- **Sync via GitHub Gist privé** — token GitHub collé dans un réglage, push/pull automatique de la progression vers un Gist privé. Marche multi-appareils sans backend.
- **Export/Import amélioré** — rappel périodique ("ça fait X jours, exporte ta progression"), bouton "Importer une progression" pour recharger un export sur un autre appareil, fusion intelligente au lieu d'un simple écrasement.
- **Petit backend perso** (Cloudflare Worker + KV, ou Deno Deploy) — solution la plus propre si tu es prêt à héberger un minimum de code serveur.
- **Sync via fichier local synchronisé** (Syncthing / Dropbox / Google Drive côté OS) — l'app écrit/lit un fichier JSON dans un dossier surveillé par un outil de sync tiers, zéro code réseau à écrire.
- **QR code de transfert** — génère un QR code encodant (en compressé) ta progression pour la transférer rapidement vers un mobile sans câble ni compte.
- **Sauvegarde automatique locale** — copie périodique de `localStorage` vers un fichier `.json` téléchargé automatiquement (ou proposé) toutes les N complétions, pour ne jamais perdre plus qu'un peu de progression.

---

## 🎓 Fonctionnalités pédagogiques

- **Mode révision** — pour un lab déjà terminé, un mode qui masque les commandes et ne montre que les objectifs/contexte, pour s'auto-tester avant de dévoiler la solution.
- **Quiz de fin de lab** — 2-3 questions rapides (QCM) à la fin de la checklist pour vérifier la compréhension, pas juste l'exécution mécanique.
- **Liens "labs suivants recommandés"** — suggestions de labs à faire après celui-ci, selon la catégorie/niveau, en plus de la navigation prev/next actuelle.
- **Glossaire transverse** — un lexique des termes techniques (VLAN, ACL, RAID, etc.) consultable en un clic depuis n'importe quel lab, avec liens croisés.
- **Parcours guidés ("tracks")** — regrouper plusieurs labs en un parcours ordonné avec une progression dédiée (ex: "Devenir admin réseau : 12 labs, 8h").
- **Annotations personnelles inline** — pouvoir surligner/commenter une commande précise dans une étape, pas seulement une note globale par lab.
- **Historique des tentatives** — si tu refais un lab plusieurs fois, garder un journal des dates au lieu d'une seule `completedAt`.
- **Badges/certificats de complétion** — un visuel "certificat" généré (PDF/image) quand tu termines une catégorie entière ou un parcours.

---

## 🎨 UX / Accessibilité

- **Mode clavier complet** — navigation entière au clavier (actuellement la recherche a des raccourcis, mais pas la checklist ni les filtres).
- **Vue "impression propre"** — un CSS d'impression dédié qui masque la nav, les boutons, et met en forme la checklist + commandes proprement pour PDF/papier.
- **Thème "haut contraste"** en plus de dark/light, pour l'accessibilité visuelle.
- **Réglage de taille de police** persistant (utile en lecture prolongée sur mobile).
- **Undo sur suppression** (labs importés, notes) — un court délai avec bouton "Annuler" avant suppression définitive, au lieu d'une suppression immédiate.
- **Aperçu au survol** — survoler une carte de lab affiche un mini-tooltip avec la checklist résumée, sans devoir l'ouvrir.

---

## ⚡ Performance / Robustesse

- **Virtualisation de la grille** — si le nombre de labs dépasse largement 200-300, ne rendre que les cartes visibles à l'écran (react-window ou équivalent maison).
- **Bundling/minification** — regrouper les 10 fichiers `data-*.js` en un seul fichier minifié pour réduire le nombre de requêtes HTTP et le poids total.
- **Compression des données** — les fichiers `data-reseau.js` (330 Ko) etc. pourraient être servis en JSON compressé/gzippé plutôt qu'en JS brut, si l'hébergement le permet.
- **Tests automatisés en CI** — le `smoke_test.js` fourni pourrait tourner automatiquement (GitHub Actions) à chaque modif des données pour détecter une régression avant mise en ligne.
- **Lint/format automatique** — ESLint + Prettier pour garder un style cohérent si le fichier `script.js` continue de grossir.
- **Découpage de script.js** — actuellement un seul fichier de ~1500 lignes ; le séparer en modules (rendu, état, sync, utils) faciliterait la maintenance à long terme.

---

## 🔒 Sécurité (usage perso, donc priorité basse, mais à garder en tête)

- **Content-Security-Policy** — ajouter un header/meta CSP restrictif si le site est un jour exposé publiquement (au-delà d'un usage 100% local).
- **Validation de schéma plus stricte à l'import** — actuellement `normalizeImportedLab` est permissif ; un vrai schéma (ex: JSON Schema) donnerait des messages d'erreur plus précis sur les fichiers importés invalides.
- **Rotation/expiration du token de sync** (si la sync Gist est implémentée un jour) — proposer de régénérer le token régulièrement.

---

## 📊 Contenu / Data

- **Compteur de labs par source** (auto-formation, formation pro, cours perso...) déjà présent dans les données — pourrait devenir un filtre/statistique visible sur l'accueil.
- **Tags "prérequis logiciel"** — indiquer clairement si un lab nécessite VirtualBox, GNS3, Docker, etc., avec un lien de téléchargement.
- **Difficulté affinée** — actuellement 3 niveaux (débutant/intermédiaire/avancé) ; un score numérique (1-10) permettrait un tri plus fin.
- **Estimation de temps recalculée automatiquement** — à partir du nombre d'étapes/commandes plutôt que saisie manuellement, pour rester cohérent quand un lab est enrichi.
- **Schémas réseau enrichis** — plus de labs `data-reseau.js` avec `schema_reseau` (SVG) ; les autres catégories pourraient bénéficier d'un schéma équivalent (topologie, architecture) quand c'est pertinent.

---

## 🎮 Gamification (optionnel, à ne prendre que si ça motive vraiment)

- **Séries (streaks)** — compteur de jours consécutifs avec au moins un item coché.
- **Objectifs hebdomadaires** — "termine 3 labs cette semaine", avec petite barre de progression sur l'accueil.
- **Statistiques temporelles** — graphique simple (jours/semaines) du nombre de labs complétés dans le temps, à partir de `completedAt`.

---

## 📱 PWA / Mobile

- **Raccourcis d'application (App Shortcuts)** dans le `manifest.json` — accès direct à "Labs en cours" ou "Recherche" depuis l'icône de l'app sur mobile/desktop.
- **Partage natif** — bouton "Partager ce lab" utilisant l'API Web Share sur mobile.
- **Mode hors-ligne visible** — un petit indicateur "Hors ligne" quand le Service Worker sert depuis le cache, pour que ce soit explicite plutôt qu'implicite.
- **Badge d'application (Badging API)** — afficher un petit chiffre sur l'icône de l'app (nombre de labs en cours) sur les plateformes qui le supportent.
- **Visite guidée au premier lancement** — un court onboarding (3-4 étapes) qui montre la recherche, les filtres et la checklist à la première ouverture.

---

## 🔍 Recherche & organisation avancée

- **Filtres combinés avancés** — curseur de durée (ex: "entre 20 et 60 min"), plage de date d'ajout, tri par "moins récemment pratiqué".
- **Recherche floue (fuzzy search)** — tolérer les fautes de frappe ou variantes ("reseau" trouve "réseau"), utile sur mobile où on tape vite.
- **Gestion des tags centralisée** — une vue pour renommer/fusionner un tag sur tous les labs d'un coup (ex: unifier "vlan" et "VLAN" trouvés dans des labs différents).
- **Détection de doublons à l'import** — avertir si un lab importé ressemble beaucoup (titre/tags proches) à un lab déjà présent.
- **Bouton "Lab aléatoire"** — tombe sur un lab au hasard (filtré par catégorie/niveau si voulu), pratique pour varier sans réfléchir.
- **Vue "Tableau" alternative à la grille** — une liste compacte triable par colonnes (titre, catégorie, durée, statut) pour scanner rapidement 130+ labs.

## 🧠 Rétention / mémorisation

- **Rappels façon répétition espacée** — "Tu as terminé ce lab il y a 30 jours, tu veux le refaire pour rafraîchir ?", basé sur `completedAt`.
- **Export vers Anki** — générer un paquet de flashcards (question = objectif/erreur courante, réponse = commande/solution) à partir des labs terminés.
- **Fiches de synthèse imprimables** — une version condensée (juste commandes clés + erreurs courantes) d'un lab terminé, pour réviser sans tout relire.

## 🛠️ Qualité des données / outils admin

- **Page de diagnostic des données** — une vue cachée listant les labs avec champs manquants (pas de checklist, pas de tags, description vide), pour repérer les fiches à compléter.
- **Détection de liens morts** — vérifier périodiquement que les `lien` dans `prerequis` répondent toujours (ou au moins qu'ils sont bien formés).
- **Changelog par lab** — un petit historique horodaté si le contenu d'un lab est modifié après coup (utile si tu corriges/enrichis des labs déjà pratiqués).
- **Validation JSON Schema à l'écriture** — un script Node à lancer avant de committer un nouveau `data-*.js`, qui vérifie la structure de chaque lab (déjà en partie couvert par `normalizeImportedLab`, mais pourrait s'appliquer aussi aux fichiers sources).

## 🖼️ Multimédia

- **Captures d'écran intégrées** — pouvoir attacher une ou deux images à une étape (ex: résultat attendu dans un terminal ou une interface graphique).
- **Notes vocales** — enregistrer une note audio rapide sur un lab plutôt que de taper, pratique sur mobile après une session de pratique.
- **Diagrammes interactifs** — au-delà du SVG statique actuel pour `schema_reseau`, un schéma cliquable où chaque élément renvoie à l'étape correspondante.

---



Quand tu voudras reprendre un point, dis-moi simplement lequel (ou colle la ligne correspondante) — pas besoin de relire tout le fichier, je peux le faire pour toi.
