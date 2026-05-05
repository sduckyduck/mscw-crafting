const BASE_URL = import.meta.env.BASE_URL || '/';

const ROOT_ICON_FILES = {
  'Processed Cloth': 'Processed Cloth.png',
  'Spool of Thread': 'Spool of Thread.png',
  'Animal Fur Bundle': 'Animal Fur Bundle.png',
  'Leather': '04003009.png',
  'Processed Leather': 'Processed Leather.png',
  'Processed Wood': '04003001(1).png',
  'Screw': 'weapon crafting Icon.png',

  Smithing: 'smithing Icon.png',
  Weaponcrafting: 'weapon crafting Icon.png',
  Tailoring: 'tailoring Icon.png',
  Woodcrafting: '916987b4-3066-4302-aec4-38636a3eb047(2).png',
  Leatherworking: 'leatherworking Icon.png',
  Arcforge: 'Arcforge Icon.png'
};

const PROFESSION_ALIASES = {
  Smithing: ['Smithing', '锻造'],
  Weaponcrafting: ['Weaponcrafting', 'Weapon', '武器制作', '武器'],
  Tailoring: ['Tailoring', 'Tailor', '裁缝'],
  Woodcrafting: ['Woodcrafting', 'Wood', '木工'],
  Leatherworking: ['Leatherworking', 'Leather', '制皮'],
  Arcforge: ['Arcforge', '奥术锻造', '奥术']
};

const ITEM_ALIASES = {
  'Processed Cloth': ['Processed Cloth', '加工布料'],
  'Spool of Thread': ['Spool of Thread', '线轴'],
  'Animal Fur Bundle': ['Animal Fur Bundle', '动物毛皮包', '动物毛束'],
  Leather: ['Leather', '皮革'],
  'Processed Leather': ['Processed Leather', '加工皮革'],
  'Processed Wood': ['Processed Wood', '加工木材'],
  Screw: ['Screw', '螺丝']
};

function rootIconUrl(fileName) {
  return `${BASE_URL}${encodeURIComponent(fileName).replace(/%2F/g, '/')}`;
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
  const fileName = ROOT_ICON_FILES[key];
  if (!fileName) return null;
  const img = document.createElement('img');
  img.className = className;
  img.src = rootIconUrl(fileName);
  img.alt = key;
  img.title = `${key} · local root PNG`;
  img.loading = 'lazy';
  img.dataset.localRootIcon = key;
  img.onerror = () => {
    img.dataset.localRootIconError = '1';
    img.style.display = 'none';
    console.warn(`[MSCWLocalIcons] Missing local PNG for ${key}: ${img.src}. Make sure ${fileName} exists in repo root and workflow copies root PNGs to dist.`);
  };
  return img;
}

function replaceIconElement(el, key) {
  if (!key || !ROOT_ICON_FILES[key]) return false;
  if (el.dataset?.localRootIcon === key) return false;
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

  const existing = button.querySelector('[data-local-root-icon]');
  if (existing?.dataset?.localRootIcon === key) return false;
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
  const rows = [...document.querySelectorAll('[data-local-root-icon]')].map((el, index) => ({
    index,
    key: el.dataset.localRootIcon,
    src: el.getAttribute('src'),
    error: el.dataset.localRootIconError === '1',
    nearbyText: el.closest('button, article, tr, .ingredient-branch, .smart-mat, .material-name, .ingredient-pill, th')?.innerText?.slice(0, 220) || ''
  }));
  console.table(rows);
  return rows;
}

function helpLocalIcons() {
  const rows = [
    { command: 'MSCWLocalIcons.apply()', description: 'Force apply root PNG icons to current page.' },
    { command: 'MSCWLocalIcons.scan()', description: 'List currently applied local PNG icons.' },
    { command: 'MSCWLocalIcons.files', description: 'Show expected root PNG filenames.' }
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
  files: ROOT_ICON_FILES,
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

console.info('[MSCWLocalIcons] Local root PNG icon override loaded. Run MSCWLocalIcons.help()');
