/* ============================================================
   TP & LABS IT — script.js
   Navigation, thème, animations, search, détail, checklist
   ============================================================ */

/* ─────────────────────────────────────────
   LOCALSTORAGE — accès sécurisés
   (évite un crash total si le storage est
   corrompu, plein, ou indisponible)
───────────────────────────────────────── */
function safeGetJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return fallback;
  }
}

function safeSetJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    console.warn(`Impossible d'enregistrer "${key}" (storage plein ou indisponible)`);
    return false;
  }
}

function safeGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v;
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/* ── État global ── */
const State = {
  theme: safeGet('theme', 'dark'),
  filters: {
    categories: [],
    niveau: '',
    source: '',
    statut: '',
    tags: [],
    favoritesOnly: false
  },
  sort: 'default',
  searchQuery: '',
  searchActiveIdx: -1,
  openLabId: null,
  progress: safeGetJSON('tp-progress', {}),
  favorites: safeGetJSON('tp-favorites', []),
  notes: safeGetJSON('tp-notes', {})
};

/* ─────────────────────────────────────────
   LABS IMPORTÉS — persistance
   Fusionne les labs importés (sauvegardés en
   localStorage) avec les labs statiques dès
   que data-index.js a défini window.LABS.
───────────────────────────────────────── */
(function mergeImportedLabs() {
  const imported = safeGetJSON('tp-imported-labs', []);
  if (Array.isArray(imported) && imported.length && Array.isArray(window.LABS)) {
    window.LABS = [...window.LABS, ...imported];
  }
})();

/* ─────────────────────────────────────────
   MIGRATION — anciennes progressions
   Avant ce correctif, la checklist était
   sauvegardée par INDEX (ex: [0,2,3]). C'est
   fragile : si l'ordre de la checklist change
   dans les données, la progression enregistrée
   ne correspond plus aux bons items.
   On migre vers un stockage par TEXTE de l'item,
   stable même si la checklist est réordonnée.
───────────────────────────────────────── */
(function migrateProgressFormat() {
  if (!Array.isArray(window.LABS) || !window.LABS.length) return;
  let changed = false;
  Object.keys(State.progress).forEach(labIdKey => {
    const lab = window.LABS.find(l => String(l.id) === String(labIdKey));
    const p = State.progress[labIdKey];
    if (lab && p && Array.isArray(p.checked) && p.checked.length && typeof p.checked[0] === 'number') {
      p.checked = p.checked.map(i => lab.checklist[i]).filter(t => t !== undefined);
      changed = true;
    }
  });
  if (changed) safeSetJSON('tp-progress', State.progress);
})();

/* ─────────────────────────────────────────
   FAVORIS · NOTES · STATUT
───────────────────────────────────────── */
function isFavorite(id) {
  return State.favorites.includes(id);
}

function toggleFavorite(id) {
  const idx = State.favorites.indexOf(id);
  let added;
  if (idx === -1) { State.favorites.push(id); added = true; }
  else { State.favorites.splice(idx, 1); added = false; }
  safeSetJSON('tp-favorites', State.favorites);
  showToast(added ? '⭐ Ajouté aux favoris' : '☆ Retiré des favoris', '#F59E0B');
  return added;
}

function getLabStatus(id) {
  const lab = (window.LABS || []).find(l => l.id === id);
  if (!lab) return 'afaire';
  if (isLabComplete(id)) return 'termine';
  return getProgress(id).checked.length > 0 ? 'encours' : 'afaire';
}

function getNote(id) {
  return State.notes[id] || '';
}

function saveNote(id, text) {
  if (text && text.trim()) State.notes[id] = text;
  else delete State.notes[id];
  safeSetJSON('tp-notes', State.notes);
}

function hasNote(id) {
  return !!(State.notes[id] && State.notes[id].trim());
}

/* ─────────────────────────────────────────
   THÈME
───────────────────────────────────────── */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  State.theme = theme;
  safeSet('theme', theme);
  document.querySelectorAll('.btn-theme').forEach(btn => {
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    btn.setAttribute('aria-label', theme === 'dark' ? 'Passer en mode jour' : 'Passer en mode nuit');
  });
}

function toggleTheme() {
  applyTheme(State.theme === 'dark' ? 'light' : 'dark');
}

/* ─────────────────────────────────────────
   TYPEWRITER (hero)
───────────────────────────────────────── */
function typeWriter(el, text, speed = 80) {
  if (!el) return;
  let i = 0;
  el.textContent = '';
  function type() {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(type, speed);
    }
  }
  type();
}

/* ─────────────────────────────────────────
   COUNT-UP ANIMATION
───────────────────────────────────────── */
function countUp(el, target, duration = 1500) {
  if (!el) return;
  const start = performance.now();
  function update(now) {
    const elapsed = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - elapsed, 3);
    el.textContent = Math.round(ease * target);
    if (elapsed < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

/* ─────────────────────────────────────────
   INTERSECTION OBSERVER (apparition + count-up)
───────────────────────────────────────── */
function initAnimations() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fade-in des cards catégories
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        if (reducedMotion) {
          entry.target.classList.add('visible');
        } else {
          setTimeout(() => entry.target.classList.add('visible'), i * 80);
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.cat-card, .lab-card').forEach(el => observer.observe(el));

  // Count-up sur les stats hero
  const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      const labs = window.LABS || [];
      const cats = window.CATEGORIES || {};
      const done = labs.filter(l => isLabComplete(l.id)).length;

      const els = document.querySelectorAll('.hero-stat-num');
      if (els[0]) countUp(els[0], labs.length);
      if (els[1]) countUp(els[1], Object.keys(cats).length);
      if (els[2]) countUp(els[2], done);
      statsObserver.disconnect();
    }
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) statsObserver.observe(heroStats);

  // Barres de progression (section Ma progression)
  const progObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      document.querySelectorAll('.prog-cat-fill').forEach(fill => {
        const pct = fill.dataset.pct || '0';
        fill.style.width = pct + '%';
      });
      progObserver.disconnect();
    }
  }, { threshold: 0.2 });

  const progSection = document.querySelector('.progression-section');
  if (progSection) progObserver.observe(progSection);
}

/* ─────────────────────────────────────────
   PROGRESSION HELPERS
───────────────────────────────────────── */
function getProgress(labId) {
  return State.progress[labId] || { checked: [] };
}

function isLabComplete(labId) {
  const lab = (window.LABS || []).find(l => l.id === labId);
  if (!lab) return false;
  const p = getProgress(labId);
  // On ne compte que les entrées qui correspondent encore à un item
  // existant de la checklist (texte), pour rester robuste si la
  // checklist a été modifiée depuis la dernière visite.
  const validChecked = p.checked.filter(c => lab.checklist.includes(c));
  return lab.checklist.length > 0 && validChecked.length === lab.checklist.length;
}

function saveProgress(labId, checked) {
  State.progress[labId] = { checked };
  safeSetJSON('tp-progress', State.progress);
}

function getValidChecked(lab, labId) {
  if (!lab) return [];
  const p = getProgress(labId);
  return p.checked.filter(c => lab.checklist.includes(c));
}

function getProgressPct(labId) {
  const lab = (window.LABS || []).find(l => l.id === labId);
  if (!lab || !lab.checklist.length) return 0;
  const p = getProgress(labId);
  const validChecked = p.checked.filter(c => lab.checklist.includes(c));
  return Math.round((validChecked.length / lab.checklist.length) * 100);
}

/* ─────────────────────────────────────────
   RENDER : CATEGORIES GRID (accueil)
───────────────────────────────────────── */
function renderCatGrid(container) {
  if (!container || !window.CATEGORIES || !window.LABS) return;

  container.innerHTML = '';
  const fragment = document.createDocumentFragment();
  Object.entries(window.CATEGORIES).forEach(([slug, cat]) => {
    const count = window.LABS.filter(l => l.categorie === slug).length;
    const a = document.createElement('a');
    a.href = `labs.html?cat=${slug}`;
    a.className = 'cat-card';
    a.style.setProperty('--cat-color', cat.couleur);
    a.innerHTML = `
      <span class="cat-card-icon">${cat.icone}</span>
      <div class="cat-card-name">${cat.label}</div>
      <div class="cat-card-count"><strong>${count}</strong> lab${count > 1 ? 's' : ''}</div>
    `;
    a.addEventListener('click', e => {
      e.preventDefault();
      if (window.location.pathname.includes('labs.html')) {
        setFilter('categories', slug);
      } else {
        window.location.href = `labs.html?cat=${slug}`;
      }
    });
    fragment.appendChild(a);
  });
  container.appendChild(fragment);
}

/* ─────────────────────────────────────────
   RENDER : LAB CARD
───────────────────────────────────────── */
function renderLabCard(lab) {
  const cat = (window.CATEGORIES || {})[lab.categorie] || { couleur: '#F59E0B', icone: '📋', label: lab.categorie };
  const p = getProgress(lab.id);
  const total = lab.checklist.length;
  const done = getValidChecked(lab, lab.id).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const complete = isLabComplete(lab.id);

  const niveauEmoji = { 'débutant': '🟢', 'intermédiaire': '🟡', 'avancé': '🔴' }[lab.niveau] || '⚪';
  const fav = isFavorite(lab.id);
  const inProgress = done > 0 && !complete;

  const card = document.createElement('div');
  card.className = 'lab-card';
  card.style.setProperty('--cat-color', cat.couleur);
  card.dataset.labId = lab.id;

  card.innerHTML = `
    <div class="lab-card-header">
      <span class="lab-badge" style="--cat-color:${cat.couleur}">${cat.icone} ${cat.label}</span>
      <div class="lab-card-header-right">
        ${complete ? '<span class="badge-done">✓ Terminé</span>' : (inProgress ? '<span class="badge-progress">◐ En cours</span>' : '')}
        <button class="btn-fav ${fav ? 'active' : ''}" aria-label="${fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}" title="Favori">${fav ? '★' : '☆'}</button>
      </div>
    </div>
    <div class="lab-title">${hasNote(lab.id) ? '<span class="note-dot" title="Tu as des notes sur ce lab">📝</span> ' : ''}${escapeHtml(lab.titre)}</div>
    <div class="lab-desc">${escapeHtml(lab.description)}</div>
    <div class="lab-meta">
      <span>${niveauEmoji} ${lab.niveau}</span>
      <span>⏱ ${lab.duree} min</span>
      <span>📁 ${lab.source}</span>
    </div>
    <div class="lab-progress-bar">
      <div class="lab-progress-fill" style="width:${pct}%;background:${cat.couleur}"></div>
    </div>
    <div class="lab-progress-label">${done}/${total} validés</div>
    <div class="lab-card-footer">
      <div class="tags-list">
        ${lab.tags.slice(0, 3).map(t => `<span class="tag" data-tag="${escapeHtml(t)}">${escapeHtml(t)}</span>`).join('')}
      </div>
      <button class="btn-open" aria-label="Ouvrir le lab ${escapeHtml(lab.titre)}">
        Ouvrir →
      </button>
    </div>
  `;

  card.querySelector('.btn-open').addEventListener('click', () => openLab(lab.id));
  card.querySelector('.btn-fav').addEventListener('click', e => {
    e.stopPropagation();
    const added = toggleFavorite(lab.id);
    const btn = e.currentTarget;
    btn.classList.toggle('active', added);
    btn.textContent = added ? '★' : '☆';
    btn.setAttribute('aria-label', added ? 'Retirer des favoris' : 'Ajouter aux favoris');
    if (!added && State.filters.favoritesOnly) renderLabsGrid();
  });
  card.querySelectorAll('.tag').forEach(tagEl => {
    tagEl.addEventListener('click', e => {
      e.stopPropagation();
      const tag = tagEl.dataset.tag;
      if (window.location.pathname.includes('labs.html')) {
        toggleTagFilter(tag);
      } else {
        window.location.href = `labs.html?tag=${tag}`;
      }
    });
  });

  return card;
}

/* ─────────────────────────────────────────
   RENDER : RECENT LABS (accueil)
───────────────────────────────────────── */
function renderRecentLabs(container) {
  if (!container || !window.LABS) return;
  container.innerHTML = '';

  // Labs en cours (progression > 0 mais pas terminés) en premier, puis les 3 derniers ajoutés
  const inProgress = window.LABS.filter(l => {
    return getValidChecked(l, l.id).length > 0 && !isLabComplete(l.id);
  });
  const recent = [...inProgress, ...window.LABS.slice(-3)].slice(0, 3);
  const dedup = [...new Map(recent.map(l => [l.id, l])).values()];

  dedup.forEach(lab => {
    container.appendChild(renderLabCard(lab));
  });
}

/* ─────────────────────────────────────────
   RENDER : PROGRESSION SECTION (accueil)
───────────────────────────────────────── */
function renderProgression(container) {
  if (!container || !window.CATEGORIES || !window.LABS) return;
  container.innerHTML = '';

  // Résumé global
  const total = window.LABS.length;
  const done = window.LABS.filter(l => isLabComplete(l.id)).length;
  const inProgress = window.LABS.filter(l => {
    return getValidChecked(l, l.id).length > 0 && !isLabComplete(l.id);
  }).length;
  const favs = State.favorites.length;
  const globalPct = total ? Math.round((done / total) * 100) : 0;

  const summary = document.createElement('div');
  summary.className = 'prog-global';
  summary.innerHTML = `
    <div class="prog-global-ring" style="--pct:${globalPct}">
      <div class="prog-global-ring-inner">
        <span class="prog-global-pct">${globalPct}%</span>
        <span class="prog-global-sub">global</span>
      </div>
    </div>
    <div class="prog-global-stats">
      <div class="prog-global-stat"><strong>${done}</strong><span>✓ Terminés</span></div>
      <div class="prog-global-stat"><strong>${inProgress}</strong><span>◐ En cours</span></div>
      <div class="prog-global-stat"><strong>${total - done - inProgress}</strong><span>⬜ À faire</span></div>
      <div class="prog-global-stat"><strong>${favs}</strong><span>⭐ Favoris</span></div>
    </div>
  `;
  container.appendChild(summary);

  Object.entries(window.CATEGORIES).forEach(([slug, cat]) => {
    const catLabs = window.LABS.filter(l => l.categorie === slug);
    if (!catLabs.length) return;
    const doneLabs = catLabs.filter(l => isLabComplete(l.id)).length;
    const pct = Math.round((doneLabs / catLabs.length) * 100);

    const item = document.createElement('div');
    item.className = 'prog-cat-item';
    item.innerHTML = `
      <span class="prog-cat-icon">${cat.icone}</span>
      <span class="prog-cat-name">${cat.label}</span>
      <div class="prog-cat-bar">
        <div class="prog-cat-fill" style="background:${cat.couleur}" data-pct="${pct}"></div>
      </div>
      <span class="prog-cat-pct">${doneLabs}/${catLabs.length}</span>
    `;
    container.appendChild(item);
  });
}

/* ─────────────────────────────────────────
   LABS PAGE — Sidebar filters
───────────────────────────────────────── */
function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar || !window.CATEGORIES || !window.LABS) return;

  // Catégories
  const catSection = sidebar.querySelector('.cat-filter-list');
  if (catSection) {
    catSection.innerHTML = '';
    const catFragment = document.createDocumentFragment();
    Object.entries(window.CATEGORIES).forEach(([slug, cat]) => {
      const count = window.LABS.filter(l => l.categorie === slug).length;
      const item = document.createElement('label');
      item.className = 'filter-item';
      item.style.setProperty('--cat-color', cat.couleur);
      item.innerHTML = `
        <input type="checkbox" value="${slug}" class="cat-checkbox" style="--cat-color:${cat.couleur}">
        <span class="filter-dot" style="background:${cat.couleur}"></span>
        <span class="filter-label">${cat.label}</span>
        <span class="filter-count">${count}</span>
      `;
      catFragment.appendChild(item);
    });
    catSection.appendChild(catFragment);

    catSection.querySelectorAll('.cat-checkbox').forEach(cb => {
      cb.addEventListener('change', () => {
        State.filters.categories = [...catSection.querySelectorAll('.cat-checkbox:checked')].map(c => c.value);
        renderLabsGrid();
      });
    });
  }

  // Tags populaires
  const tagSection = sidebar.querySelector('.tag-filter-list');
  if (tagSection) {
    const allTags = [...new Set(window.LABS.flatMap(l => l.tags))].sort();
    tagSection.innerHTML = '';
    const tagFragment = document.createDocumentFragment();
    allTags.forEach(tag => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = tag;
      span.dataset.tag = tag;
      span.addEventListener('click', () => toggleTagFilter(tag, span));
      tagFragment.appendChild(span);
    });
    tagSection.appendChild(tagFragment);
  }
}

function toggleTagFilter(tag, el) {
  const idx = State.filters.tags.indexOf(tag);
  if (idx === -1) State.filters.tags.push(tag);
  else State.filters.tags.splice(idx, 1);

  document.querySelectorAll('.tag').forEach(t => {
    if (t.dataset.tag === tag) {
      t.style.borderColor = State.filters.tags.includes(tag) ? 'var(--accent)' : '';
      t.style.color = State.filters.tags.includes(tag) ? 'var(--accent)' : '';
    }
  });
  renderLabsGrid();
}

function setFilter(type, value) {
  if (type === 'categories') {
    const idx = State.filters.categories.indexOf(value);
    if (idx === -1) State.filters.categories.push(value);
    else State.filters.categories.splice(idx, 1);
    const cb = document.querySelector(`.cat-checkbox[value="${value}"]`);
    if (cb) cb.checked = State.filters.categories.includes(value);
  }
  renderLabsGrid();
}

/* ─────────────────────────────────────────
   LABS PAGE — Render grid
───────────────────────────────────────── */
function getFilteredLabs() {
  let labs = window.LABS || [];

  if (State.searchQuery) {
    const q = State.searchQuery.toLowerCase();
    labs = labs.filter(l =>
      l.titre.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.tags.some(t => t.toLowerCase().includes(q)) ||
      l.etapes.some(e => e.titre.toLowerCase().includes(q) || e.contexte.toLowerCase().includes(q))
    );
  }

  if (State.filters.categories.length) {
    labs = labs.filter(l => State.filters.categories.includes(l.categorie));
  }
  if (State.filters.niveau) {
    labs = labs.filter(l => l.niveau === State.filters.niveau);
  }
  if (State.filters.source) {
    labs = labs.filter(l => l.source === State.filters.source);
  }
  if (State.filters.statut) {
    labs = labs.filter(l => getLabStatus(l.id) === State.filters.statut);
  }
  if (State.filters.favoritesOnly) {
    labs = labs.filter(l => isFavorite(l.id));
  }
  if (State.filters.tags.length) {
    labs = labs.filter(l => State.filters.tags.every(t => l.tags.includes(t)));
  }

  // Tri
  switch (State.sort) {
    case 'alpha': labs = [...labs].sort((a, b) => a.titre.localeCompare(b.titre)); break;
    case 'niveau':
      const order = ['débutant', 'intermédiaire', 'avancé'];
      labs = [...labs].sort((a, b) => order.indexOf(a.niveau) - order.indexOf(b.niveau));
      break;
    case 'duree': labs = [...labs].sort((a, b) => a.duree - b.duree); break;
    case 'progression': labs = [...labs].sort((a, b) => getProgressPct(b.id) - getProgressPct(a.id)); break;
  }

  return labs;
}

function renderLabsGrid() {
  const grid = document.getElementById('labs-grid');
  const countEl = document.getElementById('labs-count');
  if (!grid) return;

  const labs = getFilteredLabs();
  grid.innerHTML = '';

  if (!labs.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted)">
      <div style="font-size:2rem;margin-bottom:12px">🔍</div>
      <div style="font-size:0.9rem">Aucun lab ne correspond à ces filtres.</div>
    </div>`;
  } else {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Un seul DocumentFragment pour n'imposer qu'un seul reflow au DOM,
    // même quand la liste contient une centaine de labs.
    const fragment = document.createDocumentFragment();
    const cards = labs.map(lab => renderLabCard(lab));
    cards.forEach(card => fragment.appendChild(card));
    grid.appendChild(fragment);

    // L'effet d'apparition en cascade est plafonné aux ~20 premières
    // cartes : au-delà, l'attente cumulée devient perceptible sans
    // apporter grand-chose visuellement.
    const staggerLimit = 20;
    cards.forEach((card, i) => {
      if (reducedMotion) {
        card.classList.add('visible');
      } else if (i < staggerLimit) {
        setTimeout(() => card.classList.add('visible'), i * 60);
      } else {
        card.classList.add('visible');
      }
    });
  }

  if (countEl) {
    const active = State.filters.categories.length || State.filters.niveau ||
      State.filters.source || State.filters.tags.length || State.searchQuery ||
      State.filters.statut || State.filters.favoritesOnly;
    countEl.innerHTML = `<strong>${labs.length}</strong> lab${labs.length > 1 ? 's' : ''} trouvé${labs.length > 1 ? 's' : ''}`;
    if (active) {
      const reset = document.createElement('button');
      reset.className = 'btn-reset-filters';
      reset.type = 'button';
      reset.textContent = '✕ Réinitialiser les filtres';
      reset.addEventListener('click', resetFilters);
      countEl.appendChild(reset);
    }
  }
}

function resetFilters() {
  State.filters = { categories: [], niveau: '', source: '', statut: '', tags: [], favoritesOnly: false };
  State.searchQuery = '';
  document.querySelectorAll('.cat-checkbox:checked').forEach(cb => cb.checked = false);
  const niveauSel = document.getElementById('niveau-select');
  const sourceSel = document.getElementById('source-select');
  const statutSel = document.getElementById('statut-select');
  const favToggle = document.getElementById('fav-toggle');
  if (niveauSel) niveauSel.value = '';
  if (sourceSel) sourceSel.value = '';
  if (statutSel) statutSel.value = '';
  if (favToggle) favToggle.checked = false;
  document.querySelectorAll('.tag-filter-list .tag').forEach(t => {
    t.style.borderColor = '';
    t.style.color = '';
  });
  renderLabsGrid();
}

/* ─────────────────────────────────────────
   DÉTAIL LAB — Render panel
───────────────────────────────────────── */
function openLab(labId) {
  const lab = (window.LABS || []).find(l => l.id === labId);
  if (!lab) return;
  State.openLabId = labId;

  const panel = document.getElementById('detail-panel');
  const overlay = document.getElementById('detail-overlay');
  if (!panel) return;

  renderDetailPanel(lab, panel);

  panel.classList.add('open');
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLab() {
  const panel = document.getElementById('detail-panel');
  const overlay = document.getElementById('detail-overlay');
  panel?.classList.remove('open');
  overlay?.classList.remove('open');
  document.body.style.overflow = '';
  State.openLabId = null;
}

function renderDetailPanel(lab, panel) {
  const cat = (window.CATEGORIES || {})[lab.categorie] || { couleur: '#F59E0B', icone: '📋', label: lab.categorie };
  const niveauEmoji = { 'débutant': '🟢', 'intermédiaire': '🟡', 'avancé': '🔴' }[lab.niveau] || '⚪';
  const p = getProgress(lab.id);
  const validChecked = getValidChecked(lab, lab.id);
  const allChecked = validChecked.length === lab.checklist.length;

  panel.innerHTML = `
    <!-- Header sticky -->
    <div class="detail-header">
      <div class="detail-actions">
        <button class="detail-icon-btn btn-fav-detail ${isFavorite(lab.id) ? 'active' : ''}" onclick="toggleFavoriteDetail(${lab.id}, this)" aria-label="Favori" title="Favori">${isFavorite(lab.id) ? '★' : '☆'}</button>
        <button class="detail-icon-btn" onclick="printLab()" aria-label="Imprimer ce lab" title="Imprimer / PDF">🖨</button>
        <button class="detail-close" onclick="closeLab()" aria-label="Fermer">✕</button>
      </div>
      <div class="detail-title-row">
        <span style="font-size:1.5rem">${cat.icone}</span>
        <div class="detail-title">${escapeHtml(lab.titre)}</div>
      </div>
      <div class="detail-meta-row">
        <span class="lab-badge" style="--cat-color:${cat.couleur}">${cat.label}</span>
        <span class="meta-chip">${niveauEmoji} ${lab.niveau}</span>
        <span class="meta-chip">⏱ ${lab.duree} min</span>
        <span class="meta-chip">📁 ${lab.source}</span>
        <span class="meta-chip">🗓 ${lab.date_ajout}</span>
      </div>
      <button class="btn-complete ${allChecked ? 'enabled done' : (validChecked.length > 0 ? '' : '')}" id="btn-complete" 
        ${allChecked ? '' : 'disabled'}>
        ${allChecked ? '✓ Lab terminé !' : '🔒 Compléter la checklist pour valider'}
      </button>
    </div>

    <!-- Corps -->
    <div class="detail-body">

      <!-- Objectifs -->
      <div class="detail-section">
        <div class="detail-section-title">Objectifs</div>
        <ul class="objectifs-list">
          ${lab.objectifs.map(o => `<li>${escapeHtml(o)}</li>`).join('')}
        </ul>
      </div>

      <!-- Prérequis -->
      <div class="detail-section">
        <div class="detail-section-title">Prérequis</div>
        <ul class="prereq-list">
          ${lab.prerequis.map(p => {
            const safeLien = typeof p.lien === 'string' && /^https?:\/\//i.test(p.lien) ? p.lien : null;
            const nom = escapeHtml(p.nom || '');
            return `
            <li class="prereq-item">
              <span class="prereq-type">${escapeHtml(p.type || '')}</span>
              <span class="prereq-name">${safeLien ? `<a href="${escapeHtml(safeLien)}" target="_blank" rel="noopener">${nom} ↗</a>` : nom}</span>
            </li>
          `;
          }).join('')}
        </ul>
      </div>

      <!-- Schéma réseau -->
      ${lab.schema_reseau ? `
        <div class="detail-section">
          <div class="detail-section-title">Schéma réseau</div>
          <div class="schema-container">${lab.schema_reseau}</div>
        </div>
      ` : ''}

      <!-- Étapes -->
      <div class="detail-section">
        <div class="detail-section-title">Étapes (${lab.etapes.length})</div>
        ${lab.etapes.map((etape, i) => renderEtape(etape, i)).join('')}
      </div>

      <!-- Checklist -->
      <div class="detail-section">
        <div class="detail-section-title">Checklist de validation</div>
        <div class="checklist-progress">
          <div class="checklist-bar">
            <div class="checklist-fill" id="checklist-fill" style="width:${getProgressPct(lab.id)}%"></div>
          </div>
          <div class="checklist-label" id="checklist-label">${validChecked.length}/${lab.checklist.length} points validés</div>
        </div>
        <ul class="checklist" id="checklist">
          ${lab.checklist.map((item, i) => `
            <li class="check-item ${validChecked.includes(item) ? 'checked' : ''}" data-idx="${i}">
              <div class="check-box">${validChecked.includes(item) ? '✓' : ''}</div>
              <span class="check-text">${escapeHtml(item)}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <!-- Notes personnelles -->
      <div class="detail-section">
        <div class="detail-section-title">Mes notes</div>
        <textarea id="lab-notes" class="lab-notes-area" placeholder="Note ici tes observations, IP utilisées, points bloquants… (sauvegarde automatique)">${escapeHtml(getNote(lab.id))}</textarea>
        <div class="lab-notes-status" id="lab-notes-status"></div>
      </div>

      <!-- Tags -->
      <div class="detail-section">
        <div class="detail-section-title">Tags</div>
        <div class="tags-list">
          ${lab.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>
    </div>

    <!-- Navigation bas -->
    <div class="detail-nav" id="detail-nav"></div>
  `;

  // Init checklist interactions
  initChecklist(lab, panel);

  // Init bouton complet
  updateCompleteBtn(lab);

  // Init notes (autosave)
  initNotes(lab, panel);

  // Nav précédent/suivant
  renderDetailNav(lab);
}

/* ─────────────────────────────────────────
   NOTES · FAVORI (détail) · IMPRESSION
───────────────────────────────────────── */
function initNotes(lab, panel) {
  const area = panel.querySelector('#lab-notes');
  const status = panel.querySelector('#lab-notes-status');
  if (!area) return;
  let t;
  area.addEventListener('input', () => {
    clearTimeout(t);
    if (status) status.textContent = '…';
    t = setTimeout(() => {
      saveNote(lab.id, area.value);
      if (status) {
        status.textContent = '✓ Enregistré';
        setTimeout(() => { status.textContent = ''; }, 1500);
      }
    }, 500);
  });
}

function toggleFavoriteDetail(id, btn) {
  const added = toggleFavorite(id);
  btn.classList.toggle('active', added);
  btn.textContent = added ? '★' : '☆';
  // Rafraîchir la carte correspondante si présente
  const card = document.querySelector(`.lab-card[data-lab-id="${id}"] .btn-fav`);
  if (card) {
    card.classList.toggle('active', added);
    card.textContent = added ? '★' : '☆';
  }
}

function printLab() {
  window.print();
}

function renderEtape(etape, i) {
  const cmds = etape.commandes.map(c => {
    const osLabel = c.os === 'linux' ? '🐧 Linux' : c.os === 'windows' ? '🪟 Windows' : '🔄 Les deux';
    return `
      <div class="cmd-block">
        <div class="cmd-top">
          <span class="cmd-os-badge">${osLabel}</span>
          <span class="cmd-comment">${escapeHtml(c.commentaire)}</span>
          <button class="btn-copy" onclick="copyCmd(this)" data-cmd="${encodeURIComponent(c.cmd)}" aria-label="Copier la commande">
            Copier
          </button>
        </div>
        <div class="cmd-line">${escapeHtml(c.cmd)}</div>
      </div>
    `;
  }).join('');

  const errors = etape.erreurs_courantes.length ? `
    <div class="errors-accordion">
      <button class="errors-toggle" onclick="toggleErrors(this)" aria-expanded="false">
        <span>⚠️ Erreurs courantes (${etape.erreurs_courantes.length})</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="errors-body">
        ${etape.erreurs_courantes.map(e => `
          <div class="error-item">
            <div class="error-symptome">${escapeHtml(e.symptome)}</div>
            <div class="error-cause">${escapeHtml(e.cause)}</div>
            <div class="error-solution">${escapeHtml(e.solution)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  return `
    <div class="step-block">
      <div class="step-header">
        <div class="step-num">${i + 1}</div>
        <div class="step-title">${escapeHtml(etape.titre)}</div>
      </div>
      <div class="step-body">
        <div class="step-contexte">${escapeHtml(etape.contexte)}</div>
        ${cmds}
        ${errors}
      </div>
    </div>
  `;
}

function renderDetailNav(lab) {
  const navEl = document.getElementById('detail-nav');
  if (!navEl || !window.LABS) return;

  const catLabs = window.LABS.filter(l => l.categorie === lab.categorie);
  const idx = catLabs.findIndex(l => l.id === lab.id);

  const prev = catLabs[idx - 1];
  const next = catLabs[idx + 1];

  navEl.innerHTML = `
    <button class="detail-nav-btn" ${!prev ? 'disabled' : ''} onclick="openLab(${prev?.id})">
      ← ${prev ? escapeHtml(prev.titre.substring(0, 40) + (prev.titre.length > 40 ? '…' : '')) : 'Premier lab'}
    </button>
    <button class="detail-nav-btn" ${!next ? 'disabled' : ''} onclick="openLab(${next?.id})">
      ${next ? escapeHtml(next.titre.substring(0, 40) + (next.titre.length > 40 ? '…' : '')) : 'Dernier lab'} →
    </button>
  `;
}

/* ─────────────────────────────────────────
   CHECKLIST
───────────────────────────────────────── */
function initChecklist(lab, panel) {
  const items = panel.querySelectorAll('.check-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.dataset.idx);
      const text = lab.checklist[idx];
      const p = getProgress(lab.id);
      const cidx = p.checked.indexOf(text);

      if (cidx === -1) {
        p.checked.push(text);
        item.classList.add('checked');
        item.querySelector('.check-box').textContent = '✓';
      } else {
        p.checked.splice(cidx, 1);
        item.classList.remove('checked');
        item.querySelector('.check-box').textContent = '';
      }

      saveProgress(lab.id, p.checked);
      updateChecklistProgress(lab, panel);
      updateCompleteBtn(lab);
    });
  });
}

function updateChecklistProgress(lab, panel) {
  const total = lab.checklist.length;
  const done = getValidChecked(lab, lab.id).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const fill = panel.querySelector('#checklist-fill');
  const label = panel.querySelector('#checklist-label');
  if (fill) fill.style.width = pct + '%';
  if (label) label.textContent = `${done}/${total} points validés`;
}

function updateCompleteBtn(lab) {
  const btn = document.getElementById('btn-complete');
  if (!btn) return;
  const done = getValidChecked(lab, lab.id).length;
  const allDone = done === lab.checklist.length;

  if (allDone) {
    btn.classList.add('enabled', 'done');
    btn.disabled = false;
    btn.textContent = '✓ Lab terminé !';
    btn.onclick = () => celebrateLab(lab.id);
  } else {
    btn.classList.remove('enabled', 'done');
    btn.disabled = true;
    btn.textContent = `🔒 ${done}/${lab.checklist.length} — complète la checklist`;
  }
}

/* ─────────────────────────────────────────
   CELEBRATION CONFETTI
───────────────────────────────────────── */
function celebrateLab(labId) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showToast('🎉 Lab validé !', '#10B981');
    return;
  }
  const colors = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#FCD34D'];
  for (let i = 0; i < 60; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.cssText = `
        left:${Math.random() * 100}vw;
        top:-10px;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        width:${6 + Math.random() * 8}px;
        height:${6 + Math.random() * 8}px;
        border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        animation-duration:${1.5 + Math.random() * 2}s;
        animation-delay:${Math.random() * 0.5}s;
      `;
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }, i * 30);
  }
  showToast('🎉 Lab validé ! Bravo !', '#10B981');
}

/* ─────────────────────────────────────────
   COPY COMMAND
───────────────────────────────────────── */
function copyCmd(btn) {
  const cmd = decodeURIComponent(btn.dataset.cmd);
  navigator.clipboard.writeText(cmd).then(() => {
    btn.textContent = 'Copié ✓';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copier';
      btn.classList.remove('copied');
    }, 2000);
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = cmd;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    btn.textContent = 'Copié ✓';
    setTimeout(() => { btn.textContent = 'Copier'; }, 2000);
  });
}

/* ─────────────────────────────────────────
   ACCORDION ERREURS
───────────────────────────────────────── */
function toggleErrors(btn) {
  const body = btn.nextElementSibling;
  const open = btn.classList.toggle('open');
  body.classList.toggle('open', open);
  btn.setAttribute('aria-expanded', open);
}

/* ─────────────────────────────────────────
   SEARCH OVERLAY
───────────────────────────────────────── */
function openSearch() {
  const overlay = document.getElementById('search-overlay');
  if (!overlay) return;
  overlay.classList.add('open');
  const input = overlay.querySelector('input');
  if (input) { input.value = ''; input.focus(); renderSearchResults(''); }
  State.searchActiveIdx = -1;
}

/* Navigation clavier dans les résultats de recherche (↑ ↓ Entrée) */
function handleSearchKeydown(e) {
  const items = [...document.querySelectorAll('.search-result-item')];
  if (!items.length) return;

  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const dir = e.key === 'ArrowDown' ? 1 : -1;
    State.searchActiveIdx = (State.searchActiveIdx + dir + items.length) % items.length;
    items.forEach((it, i) => it.classList.toggle('active', i === State.searchActiveIdx));
    items[State.searchActiveIdx]?.scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'Enter' && State.searchActiveIdx >= 0) {
    e.preventDefault();
    items[State.searchActiveIdx]?.click();
  }
}

function closeSearch() {
  document.getElementById('search-overlay')?.classList.remove('open');
}

function renderSearchResults(query) {
  const results = document.getElementById('search-results');
  if (!results || !window.LABS) return;

  if (!query.trim()) {
    results.innerHTML = `<div class="search-empty">Tape un mot-clé pour rechercher un lab...</div>`;
    return;
  }

  const q = query.toLowerCase();
  const matches = window.LABS.filter(l =>
    l.titre.toLowerCase().includes(q) ||
    l.description.toLowerCase().includes(q) ||
    l.tags.some(t => t.toLowerCase().includes(q)) ||
    (l.etapes || []).some(e =>
      e.titre.toLowerCase().includes(q) ||
      (e.contexte || '').toLowerCase().includes(q) ||
      (e.commandes || []).some(c =>
        (c.cmd || '').toLowerCase().includes(q) ||
        (c.commentaire || '').toLowerCase().includes(q)
      )
    )
  );

  if (!matches.length) {
    results.innerHTML = `<div class="search-empty">Aucun résultat pour "<strong>${escapeHtml(query)}</strong>"</div>`;
    return;
  }

  results.innerHTML = matches.map(lab => {
    const cat = (window.CATEGORIES || {})[lab.categorie] || {};
    return `
      <div class="search-result-item" onclick="handleSearchSelect(${lab.id})">
        <span class="search-result-icon">${cat.icone || '📋'}</span>
        <div>
          <div class="search-result-title">${escapeHtml(lab.titre)}</div>
          <div class="search-result-sub">${escapeHtml(cat.label || lab.categorie)} · ${escapeHtml(lab.niveau)} · ${lab.duree} min</div>
        </div>
      </div>
    `;
  }).join('');
}

function handleSearchSelect(labId) {
  closeSearch();
  if (window.location.pathname.includes('labs.html')) {
    openLab(labId);
  } else {
    window.location.href = `labs.html?open=${labId}`;
  }
}

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
function showToast(msg, borderColor = '#F59E0B') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.borderLeftColor = borderColor;
  toast.innerHTML = `<span>${msg}</span>`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}

/* ─────────────────────────────────────────
   IMPORT / EXPORT
───────────────────────────────────────── */
function exportProgress() {
  const data = JSON.stringify({
    exported: new Date().toISOString(),
    progress: State.progress
  }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tp-labs-progression-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📥 Progression exportée !');
}

/* Valide et normalise un lab importé : garantit la présence de tous les
   tableaux/objets attendus par le renderer (évite un crash si le JSON
   importé est partiel), sans jamais faire confiance au contenu. */
function normalizeImportedLab(raw, newId) {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.titre !== 'string' || !raw.titre.trim()) return null;

  return {
    id: newId,
    titre: String(raw.titre),
    categorie: typeof raw.categorie === 'string' ? raw.categorie : 'projets',
    niveau: ['débutant', 'intermédiaire', 'avancé'].includes(raw.niveau) ? raw.niveau : 'débutant',
    duree: Number.isFinite(raw.duree) ? raw.duree : 0,
    source: typeof raw.source === 'string' ? raw.source : 'Personnel',
    date_ajout: typeof raw.date_ajout === 'string' ? raw.date_ajout : new Date().toISOString().split('T')[0],
    description: typeof raw.description === 'string' ? raw.description : '',
    objectifs: Array.isArray(raw.objectifs) ? raw.objectifs.map(String) : [],
    prerequis: Array.isArray(raw.prerequis) ? raw.prerequis : [],
    schema_reseau: '', // on n'importe jamais de HTML/SVG brut d'un fichier externe
    etapes: Array.isArray(raw.etapes) ? raw.etapes.map(et => ({
      titre: typeof et.titre === 'string' ? et.titre : '',
      contexte: typeof et.contexte === 'string' ? et.contexte : '',
      commandes: Array.isArray(et.commandes) ? et.commandes.map(c => ({
        os: c.os,
        commentaire: typeof c.commentaire === 'string' ? c.commentaire : '',
        cmd: typeof c.cmd === 'string' ? c.cmd : ''
      })) : [],
      erreurs_courantes: Array.isArray(et.erreurs_courantes) ? et.erreurs_courantes : []
    })) : [],
    checklist: Array.isArray(raw.checklist) ? raw.checklist.map(String) : [],
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : []
  };
}

function importLabs(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) {
        showToast('❌ Format JSON invalide (un tableau de labs est attendu)', '#EF4444');
        return;
      }

      let nextId = Math.max(0, ...(window.LABS || []).map(l => l.id)) + 1;
      const normalized = data
        .map(raw => normalizeImportedLab(raw, nextId++))
        .filter(Boolean);

      if (!normalized.length) {
        showToast('❌ Aucun lab valide dans ce fichier', '#EF4444');
        return;
      }

      // Fusion + persistance (contrairement à avant, les labs importés
      // survivent désormais à un rechargement de la page).
      const existingImported = safeGetJSON('tp-imported-labs', []);
      const allImported = [...existingImported, ...normalized];
      safeSetJSON('tp-imported-labs', allImported);

      window.LABS = [...(window.LABS || []), ...normalized];
      renderLabsGrid?.();
      renderSidebar?.();
      showToast(`✅ ${normalized.length} lab(s) importé(s) et sauvegardé(s) !`);
    } catch {
      showToast('❌ Erreur de lecture du fichier', '#EF4444');
    }
  };
  reader.readAsText(file);
}

/* ─────────────────────────────────────────
   UTILITAIRES
───────────────────────────────────────── */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* Limite la fréquence d'appel d'une fonction coûteuse (ex: redessiner
   toute la grille de labs) pendant une saisie clavier rapide. */
function debounce(fn, delay = 150) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

/* ─────────────────────────────────────────
   INIT PAGE ACCUEIL
───────────────────────────────────────── */
function initIndex() {
  applyTheme(State.theme);

  // Typewriter
  typeWriter(document.getElementById('typewriter-target'), 'TP & Labs IT');

  // Stats hero
  const els = document.querySelectorAll('.hero-stat-num');
  if (window.LABS && window.CATEGORIES) {
    if (els[0]) els[0].textContent = window.LABS.length;
    if (els[1]) els[1].textContent = Object.keys(window.CATEGORIES).length;
    if (els[2]) els[2].textContent = window.LABS.filter(l => isLabComplete(l.id)).length;
  }

  // Catégories grid
  renderCatGrid(document.getElementById('cat-grid'));

  // Labs récents
  renderRecentLabs(document.getElementById('recent-grid'));

  // Progression
  renderProgression(document.getElementById('prog-list'));

  // Animations
  initAnimations();

  // Nav search click → overlay
  document.querySelectorAll('.nav-search input').forEach(inp => {
    inp.addEventListener('focus', openSearch);
    inp.addEventListener('click', openSearch);
  });

  // Search overlay input
  const searchInp = document.getElementById('search-input-overlay');
  if (searchInp) {
    searchInp.addEventListener('input', e => { State.searchActiveIdx = -1; renderSearchResults(e.target.value); });
    searchInp.addEventListener('keydown', handleSearchKeydown);
  }
  document.getElementById('search-overlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeSearch();
  });

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeSearch();
      closeLab();
    }
  });
}

/* ─────────────────────────────────────────
   INIT PAGE LABS
───────────────────────────────────────── */
function initLabs() {
  applyTheme(State.theme);

  renderSidebar();
  renderLabsGrid();

  // URL params
  const params = new URLSearchParams(window.location.search);
  if (params.get('cat')) {
    State.filters.categories = [params.get('cat')];
    const cb = document.querySelector(`.cat-checkbox[value="${params.get('cat')}"]`);
    if (cb) cb.checked = true;
    renderLabsGrid();
  }
  if (params.get('tag')) {
    State.filters.tags = [params.get('tag')];
    renderLabsGrid();
  }
  if (params.get('open')) {
    openLab(parseInt(params.get('open')));
  }

  // Overlay close
  document.getElementById('detail-overlay')?.addEventListener('click', closeLab);

  // Sort
  document.getElementById('sort-select')?.addEventListener('change', e => {
    State.sort = e.target.value;
    renderLabsGrid();
  });

  // Niveau + source filters
  document.getElementById('niveau-select')?.addEventListener('change', e => {
    State.filters.niveau = e.target.value;
    renderLabsGrid();
  });

  document.getElementById('source-select')?.addEventListener('change', e => {
    State.filters.source = e.target.value;
    renderLabsGrid();
  });

  document.getElementById('statut-select')?.addEventListener('change', e => {
    State.filters.statut = e.target.value;
    renderLabsGrid();
  });

  document.getElementById('fav-toggle')?.addEventListener('change', e => {
    State.filters.favoritesOnly = e.target.checked;
    renderLabsGrid();
  });

  // Search dans labs
  document.querySelectorAll('.nav-search input').forEach(inp => {
    inp.addEventListener('focus', openSearch);
    inp.addEventListener('click', openSearch);
  });

  const searchInp = document.getElementById('search-input-overlay');
  if (searchInp) {
    const debouncedGridRefresh = debounce(() => renderLabsGrid(), 180);
    searchInp.addEventListener('input', e => {
      State.searchQuery = e.target.value;
      State.searchActiveIdx = -1;
      renderSearchResults(e.target.value); // retour visuel immédiat dans l'overlay
      debouncedGridRefresh(); // le re-rendu complet de la grille (plus coûteux) est différé
    });
    searchInp.addEventListener('keydown', handleSearchKeydown);
  }

  document.getElementById('search-overlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeSearch();
  });

  // Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeSearch();
      closeLab();
    }
  });

  // FAB mobile filtres
  document.getElementById('fab-filter')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('mobile-open');
  });

  // Import labs
  document.getElementById('import-input')?.addEventListener('change', e => {
    importLabs(e.target.files[0]);
  });

  // Export
  document.getElementById('btn-export')?.addEventListener('click', exportProgress);

  initAnimations();
}

/* ─────────────────────────────────────────
   MENU MOBILE (burger) + recherche mobile
───────────────────────────────────────── */
function initMobileNav() {
  const burger = document.getElementById('btn-burger');
  const navLinks = document.querySelector('.nav-links');
  const mobileSearchBtn = document.getElementById('btn-mobile-search');

  if (burger && navLinks) {
    burger.addEventListener('click', (e) => {
      // Empêche le clic de remonter jusqu'au handler `document` ci-dessous :
      // burger.innerHTML est réécrit juste après, ce qui détache le nœud cliqué
      // et ferait refermer le menu instantanément.
      e.stopPropagation();
      const open = navLinks.classList.toggle('mobile-open');
      burger.setAttribute('aria-expanded', open);
      burger.innerHTML = open
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 6l12 12M18 6L6 18"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
    });

    // Fermer le menu mobile si on clique un lien ou en dehors
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
        burger.setAttribute('aria-expanded', false);
      });
    });
    document.addEventListener('click', e => {
      if (navLinks.classList.contains('mobile-open') &&
          !navLinks.contains(e.target) && e.target !== burger && !burger.contains(e.target)) {
        navLinks.classList.remove('mobile-open');
        burger.setAttribute('aria-expanded', false);
      }
    });
  }

  if (mobileSearchBtn) {
    mobileSearchBtn.addEventListener('click', openSearch);
  }
}

/* ─────────────────────────────────────────
   AUTO-INIT selon la page
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Thème boutons
  document.querySelectorAll('.btn-theme').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });

  initMobileNav();

  applyTheme(State.theme);

  if (document.getElementById('cat-grid')) initIndex();
  else if (document.getElementById('labs-grid')) initLabs();

  // Raccourci clavier global : Ctrl/Cmd+K ouvre la recherche, / aussi
  document.addEventListener('keydown', e => {
    const inField = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearch();
    } else if (e.key === '/' && !inField) {
      e.preventDefault();
      openSearch();
    }
  });
});
