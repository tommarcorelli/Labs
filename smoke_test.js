const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = '/home/claude/Labs';

function loadPage(htmlFile, initialStorage = {}) {
  const html = fs.readFileSync(path.join(ROOT, htmlFile), 'utf8');
  const dom = new JSDOM(html, {
    url: `http://localhost/${htmlFile}`,
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    beforeParse(window) {
      // Stub navigator.serviceWorker (jsdom n'implémente pas les Service Workers)
      window.navigator.serviceWorker = { register: () => Promise.resolve() };
      window.matchMedia = window.matchMedia || (() => ({ matches: false }));
      window.IntersectionObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    }
  });

  // jsdom fournit un vrai localStorage dès qu'une URL http(s) valide est donnée
  // (origine non "opaque"). On pré-remplit l'état initial demandé.
  Object.entries(initialStorage).forEach(([k, v]) => dom.window.localStorage.setItem(k, v));

  // Charger manuellement les scripts locaux car jsdom ne résout pas <script src> sur disque sans serveur.
  // On concatène tout en UN SEUL eval : plusieurs appels window.eval() séparés ne partagent pas
  // toujours le même scope lexical top-level (const/let) selon l'implémentation, contrairement
  // à de vrais <script> tags dans un navigateur qui partagent le scope global du document.
  const scripts = [...dom.window.document.querySelectorAll('script[src]')].map(s => s.getAttribute('src'));
  const combined = scripts.map(src => fs.readFileSync(path.join(ROOT, src), 'utf8')).join('\n;\n');
  dom.window.eval(combined);
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded', { bubbles: true, cancelable: true }));
  return dom;
}

function assert(cond, msg) {
  if (!cond) throw new Error('ÉCHEC: ' + msg);
  console.log('OK -', msg);
}

(async () => {

// ---- Test page labs.html ----
const dom = loadPage('labs.html');
const { window } = dom;
const doc = window.document;

assert(Array.isArray(window.LABS) && window.LABS.length > 100, `LABS chargé (${window.LABS.length} labs)`);
assert(doc.querySelectorAll('.lab-card').length === window.LABS.length, 'Toutes les cartes labs sont rendues');

// Ouvrir un lab et interagir avec la checklist
const firstLab = window.LABS[0];
window.openLab(firstLab.id);
assert(doc.getElementById('detail-panel').classList.contains('open'), 'Le panneau détail s\'ouvre');

const checkItems = doc.querySelectorAll('.check-item');
assert(checkItems.length === firstLab.checklist.length, 'Checklist rendue avec le bon nombre d\'items');

// Cocher le premier item et vérifier la progression basée sur le TEXTE
checkItems[0].dispatchEvent(new window.Event('click', { bubbles: true }));
const progressAfterClick = window.getProgress(firstLab.id);
assert(progressAfterClick.checked[0] === firstLab.checklist[0], 'La checklist stocke le TEXTE de l\'item, pas son index');
assert(window.getProgressPct(firstLab.id) === Math.round(1 / firstLab.checklist.length * 100), 'Pourcentage de progression correct après un clic');

// Simuler un réordonnancement de la checklist (le vieux bug d'index)
const reordered = [...firstLab.checklist].reverse();
firstLab.checklist = reordered;
assert(window.getValidChecked(firstLab, firstLab.id).length === 1, 'La progression reste valide après réordonnancement de la checklist (texte stable)');

// ---- Test migration ancien format (index numérique) ----
const dom2 = loadPage('labs.html', {
  'tp-progress': JSON.stringify({ [firstLab.id]: { checked: [0, 1] } })
});
const w2 = dom2.window;
const migratedLab = w2.LABS.find(l => l.id === firstLab.id);
const migratedProgress = w2.getProgress(migratedLab.id);
assert(
  Array.isArray(migratedProgress.checked) && typeof migratedProgress.checked[0] === 'string',
  'Migration : anciennes progressions par index converties en texte'
);

// ---- Test filtre reset (statut / favoris) ----
const statutSelect = dom2.window.document.getElementById('statut-select');
statutSelect.value = 'encours';
statutSelect.dispatchEvent(new w2.Event('change', { bubbles: true }));
const countEl2 = dom2.window.document.getElementById('labs-count');
assert(countEl2.querySelector('.btn-reset-filters') !== null, 'Le bouton Réinitialiser apparaît quand seul le filtre "statut" est actif');

statutSelect.value = '';
statutSelect.dispatchEvent(new w2.Event('change', { bubbles: true }));
const favToggle = dom2.window.document.getElementById('fav-toggle');
favToggle.checked = true;
favToggle.dispatchEvent(new w2.Event('change', { bubbles: true }));
assert(dom2.window.document.getElementById('labs-count').querySelector('.btn-reset-filters') !== null, 'Le bouton Réinitialiser apparaît quand seul "favoris" est actif');
favToggle.checked = false;
favToggle.dispatchEvent(new w2.Event('change', { bubbles: true }));

// ---- Test recherche insensible à la casse sur les tags ----
const tagSample = w2.LABS.flatMap(l => l.tags)[0];
const searchInputOverlay = dom2.window.document.getElementById('search-input-overlay');
searchInputOverlay.value = tagSample.toUpperCase();
searchInputOverlay.dispatchEvent(new w2.Event('input', { bubbles: true }));

await new Promise(r => setTimeout(r, 250)); // laisser le debounce (180ms) se déclencher

const countAfterSearch = dom2.window.document.getElementById('labs-count').textContent;
assert(!countAfterSearch.includes('0 lab'), `Recherche insensible à la casse sur les tags ("${tagSample.toUpperCase()}" trouve des résultats) — "${countAfterSearch.trim()}"`);
searchInputOverlay.value = '';
searchInputOverlay.dispatchEvent(new w2.Event('input', { bubbles: true }));
await new Promise(r => setTimeout(r, 250));

// ---- Test import de labs (persistance + sanitation) ----
const maliciousImport = JSON.stringify([
  { titre: '<img src=x onerror=alert(1)>Lab injecté', categorie: 'projets', checklist: ['étape'] },
  { titre: 'Lab sans champ requis' /* categorie manquante -> valeurs par défaut */ }
]);
const fakeFile = { name: 'import.json' };
const before = w2.LABS.length;
class FakeReader {
  readAsText() { this.onload({ target: { result: maliciousImport } }); }
}
const originalFileReader = w2.FileReader;
w2.FileReader = FakeReader;
w2.importLabs(fakeFile);
assert(w2.LABS.length === before + 2, 'Les 2 labs importés sont bien ajoutés à window.LABS');

const importedStored = JSON.parse(w2.localStorage.getItem('tp-imported-labs'));
assert(importedStored.length === 2, 'Les labs importés sont persistés dans localStorage (survivent à un reload)');

// Le HTML n'est neutralisé qu'AU RENDU (échappement), pas à l'écriture — on vérifie donc
// que l'affichage réel dans le DOM ne contient jamais de balise exécutable.
w2.renderLabsGrid();
const injectedCardTitle = [...dom2.window.document.querySelectorAll('.lab-title')].find(el => el.textContent.includes('Lab injecté'));
assert(injectedCardTitle && injectedCardTitle.querySelector('img') === null, 'Le HTML injecté via import est échappé au rendu (pas de <img> exécutable)');

const ids = w2.LABS.map(l => l.id);
assert(new Set(ids).size === ids.length, 'Aucun doublon d\'ID après import (y compris les nouveaux labs importés)');

w2.FileReader = originalFileReader;

console.log('\n✅ Tous les tests de fumée sont passés.');

// ─────────────────────────────────────────────
// Tests des fonctionnalités additionnelles
// ─────────────────────────────────────────────

// ---- Date de complétion ----
const domC = loadPage('labs.html');
const wC = domC.window;
const labC = wC.LABS.find(l => l.checklist.length > 0);
labC.checklist.forEach((_, i) => {
  wC.openLab(labC.id);
  const items = domC.window.document.querySelectorAll('.check-item');
  items[i].dispatchEvent(new wC.Event('click', { bubbles: true }));
});
assert(wC.isLabComplete(labC.id), 'Lab marqué complet après avoir coché tous les items');
const progC = wC.getProgress(labC.id);
assert(typeof progC.completedAt === 'string' && !isNaN(Date.parse(progC.completedAt)), 'Une date de complétion (completedAt) est enregistrée');

// Décocher un item -> le lab redevient incomplet
const itemsAfter = domC.window.document.querySelectorAll('.check-item');
itemsAfter[0].dispatchEvent(new wC.Event('click', { bubbles: true }));
assert(!wC.isLabComplete(labC.id), 'Décocher un item rend le lab incomplet à nouveau');

// ---- Favoris sur la page d'accueil ----
const domH = loadPage('index.html', {
  'tp-favorites': JSON.stringify([wC.LABS[2].id])
});
const favCards = domH.window.document.querySelectorAll('#fav-grid .lab-card');
assert(favCards.length === 1, `La section Favoris de l'accueil affiche les labs marqués favoris (${favCards.length} trouvée(s))`);
const favSectionDisplay = domH.window.document.getElementById('fav-section').style.display;
assert(favSectionDisplay !== 'none', 'La section Favoris est visible quand il y a au moins un favori');

// ---- Catégorie inconnue à l'import ----
const domI = loadPage('labs.html');
const wI = domI.window;
const badCatImport = JSON.stringify([
  { titre: 'Lab avec catégorie bidon', categorie: 'n_existe_pas', checklist: ['a'] }
]);
class FakeReader2 { readAsText() { this.onload({ target: { result: badCatImport } }); } }
wI.FileReader = FakeReader2;
wI.importLabs({ name: 'x.json' });
const importedBad = JSON.parse(wI.localStorage.getItem('tp-imported-labs'))[0];
assert(importedBad.categorie === 'projets', 'Catégorie inconnue repliée automatiquement sur "projets"');
assert(importedBad._categorieInconnue === 'n_existe_pas', 'La catégorie d\'origine invalide est conservée pour information/avertissement');

// ---- Suppression d'un lab importé ----
const beforeDelete = wI.LABS.length;
wI.deleteImportedLab(importedBad.id);
const afterDeleteStorage = JSON.parse(wI.localStorage.getItem('tp-imported-labs'));
assert(afterDeleteStorage.every(l => l.id !== importedBad.id), 'Le lab importé est retiré de la persistance après suppression');

console.log('\n✅ Tous les tests des fonctionnalités additionnelles sont passés.');

})().catch(err => {
  console.error(err);
  process.exit(1);
});
