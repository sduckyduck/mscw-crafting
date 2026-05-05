const BASE_URL = import.meta.env.BASE_URL || '/';
const ICON_DIR = 'icons/';

const LOCAL_ICON_FILES = {
  'Processed Cloth': 'processed_cloth.png',
  'Spool of Thread': 'spool_of_thread.png',
  'Animal Fur Bundle': 'animal_fur_bundle.png',
  Leather: '04003009.png',
  'Processed Leather': 'processed_leather.png',
  'Processed Wood': 'processed_wood.png',
  'Processed Parchment': 'processed_parchment.png',
  Screw: 'weapon_crafting_icon.png',

  Smithing: 'smithing_icon.png',
  Weaponcrafting: 'weapon_crafting_icon.png',
  Tailoring: 'tailoring_icon.png',
  Woodcrafting: 'woodcrafting_icon.png',
  Leatherworking: 'leatherworking_icon.png',
  Arcforge: 'arcforge_icon.png'
};

const PROFESSION_ALIASES = {
  Smithing: ['Smithing', '锻造'],
  Weaponcrafting: ['Weaponcrafting', 'Weapon', 'Weapon Crafting', '武器制作', '武器'],
  Tailoring: ['Tailoring', 'Tailor', '裁缝'],
  Woodcrafting: ['Woodcrafting', 'Wood', '木工'],
  Leatherworking: ['Leatherworking', 'Leather Working', 'Leather', '制皮'],
  Arcforge: ['Arcforge', '奥术锻造', '奥术']
};

const ITEM_ALIASES = {
  'Processed Cloth': ['Processed Cloth', '加工布料'],
  'Spool of Thread': ['Spool of Thread', 'Thread Spool', '线轴'],
  'Animal Fur Bundle': ['Animal Fur Bundle', 'Animal Fur', '动物毛皮包', '动物毛束'],
  Leather: ['Leather', '皮革'],
  'Processed Leather': ['Processed Leather', '加工皮革'],
  'Processed Wood': ['Processed Wood', '加工木材'],
  'Processed Parchment': ['Processed Parchment', '加工羊皮纸', '羊皮纸'],
  Screw: ['Screw', '螺丝']
};

function iconUrl(fileName) {
  return `${BASE_URL}${ICON_DIR}${encodeURIComponent(fileName).replace(/%2F/g, '/')}`;
}

function textOf(el) {
  return [
    el?.getAttribute?.('alt'),
    el?.getAttribute?.('title'),
    el?.textContent,
    el?.closest?.('button, article, tr, .ingredient-branch, .smart-mat, .material-name, .ingredient-pill, th')?.innerText
  ].filter(Boolean).join(' ');
}

function matchByAliases(text, aliasMap) {
  const source = String(text || '').toLowerCase();
  return Object.entries(aliasMap).find(([, aliases]) => aliases.some((alias) => source.includes(alias.toLowerCase())))?.[0] || null;
}

function createLocalImg(key, className = 'manual-local-icon') {
  const fileName = LOCAL_ICON_FILES[key];
  if (!fileName) return null;
  const img = document.createElement('img');
  img.className = className;
  img.src = iconUrl(fileName);
  img.alt = key;
  img.title = `${key} · local PNG`;
  img.loading = 'lazy';
  img.dataset.localIcon = key;
  img.onerror = () => {
    img.dataset.localIconError = '1';
    img.style.display = 'none';
    console.warn(`[MSCWLocalIcons] Missing local PNG for ${key}: ${img.src}. Expected public/icons/${fileName}.`);
  };
  return img;
}

function replaceIconElement(el, key) {
  if (!key || !LOCAL_ICON_FILES[key]) return false;
  if (el.dataset?.localIcon === key) return false;
  const img = createLocalImg(key, el.classList?.contains('head-icon-img') ? 'head-icon-img manual-local-icon' : 'real-item-icon manual-local-icon');
  if (!img) return false;
  el.replaceWith(img);
  return true;
}

function patchMaterialIcons(root = document.body) {
  let changed = 0;
  root.querySelectorAll?.('img.real-item-icon, .emoji-fallback').forEach((el) => {
    const key = matchByAliases(textOf(el), ITEM_ALIASES);
    if (replaceIconElement(el, key)) changed += 1;
  });
  return changed;
}

function patchProfessionButton(button) {
  const key = matchByAliases(button.innerText, PROFESSION_ALIASES);
  if (!key) return false;

  const existing = button.querySelector('[data-local-icon]');
  if (existing?.dataset?.localIcon === key) return false;
  existing?.remove();

  const target = button.querySelector('b, .head-icon') || button.firstElementChild || button;
  const img = createLocalImg(key, 'profession-local-icon manual-local-icon');
  if (!img) return false;

  if (target === button) button.prepend(img);
  else target.replaceWith(img);

  button.dataset.professionKey = key;
  return true;
}

function patchProfessionIcons(root = document.body) {
  let changed = 0;
  root.querySelectorAll?.('.fx-tabs button, .smart-prof, .fantasy-matrix th').forEach((button) => {
    if (patchProfessionButton(button)) changed += 1;
  });
  return changed;
}

function setupProfessionSync() {
  document.addEventListener('click', (event) => {
    const tab = event.target.closest?.('.fx-tabs button');
    if (!tab) return;
    const key = matchByAliases(tab.innerText, PROFESSION_ALIASES);
    if (!key) return;

    setTimeout(() => {
      const smartButtons = [...document.querySelectorAll('.smart-prof')];
      const target = smartButtons.find((button) => matchByAliases(button.innerText, PROFESSION_ALIASES) === key);
      if (target) {
        target.click();
        console.info(`[MSCWLocalIcons] Synced top profession tab to Smart Guide route: ${key}`);
      } else {
        console.info(`[MSCWLocalIcons] ${key} is not currently in the Smart Guide recommendation list. Choose class 通用/Any or use the Smart Guide profession cards.`);
      }
    }, 60);
  }, true);
}

function applyLocalIcons(root = document.body) {
  const result = {
    materials: patchMaterialIcons(root),
    professions: patchProfessionIcons(root)
  };
  return result;
}

function scanLocalIcons() {
  const rows = [...document.querySelectorAll('[data-local-icon]')].map((el, index) => ({
    index,
    key: el.dataset.localIcon,
    src: el.getAttribute('src'),
    error: el.dataset.localIconError === '1',
    nearbyText: el.closest('button, article, tr, .ingredient-branch, .smart-mat, .material-name, .ingredient-pill, th')?.innerText?.slice(0, 220) || ''
  }));
  console.table(rows);
  return rows;
}

function helpLocalIcons() {
  const rows = [
    { command: 'MSCWLocalIcons.apply()', description: 'Force apply public/icons PNG icons to current page.' },
    { command: 'MSCWLocalIcons.scan()', description: 'List currently applied local PNG icons.' },
    { command: 'MSCWLocalIcons.files', description: 'Show expected public/icons PNG filenames.' }
  ];
  console.table(rows);
  return rows;
}

function installLocalIcons() {
  applyLocalIcons(document.body);
  setupProfessionSync();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) applyLocalIcons(node);
      });
      if (mutation.type === 'characterData') applyLocalIcons(document.body);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

window.MSCWLocalIcons = {
  files: LOCAL_ICON_FILES,
  itemAliases: ITEM_ALIASES,
  professionAliases: PROFESSION_ALIASES,
  apply: () => applyLocalIcons(document.body),
  scan: scanLocalIcons,
  help: helpLocalIcons
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installLocalIcons, { once: true });
} else {
  installLocalIcons();
}

console.info('[MSCWLocalIcons] public/icons PNG icon override loaded. Run MSCWLocalIcons.help()');
