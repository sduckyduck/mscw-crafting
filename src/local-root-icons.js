const BASE_URL = import.meta.env.BASE_URL || '/';
const ICON_DIR = 'icons/';

// Only keep true local PNG overrides here.
// Do NOT put normal MapleStory item icons here unless there is no valid MapleStory.io icon.
// Example: Screw must stay on MapleStory.io item/4003000, not weapon_crafting_icon.png.
const LOCAL_ICON_FILES = {
  'Processed Cloth': 'processed_cloth.png',
  'Spool of Thread': 'spool_of_thread.png',
  'Animal Fur Bundle': 'animal_fur_bundle.png',
  Leather: '04003009.png',
  'Processed Leather': 'processed_leather.png',
  'Processed Wood': 'processed_wood.png',
  'Processed Parchment': 'processed_parchment.png',

  Smithing: 'smithing_icon.png',
  Weaponcrafting: 'weapon_crafting_icon.png',
  Tailoring: 'tailoring_icon.png',
  Woodcrafting: 'woodcrafting_icon.png',
  Leatherworking: 'leatherworking_icon.png',
  Arcforge: 'arcforge_icon.png'
};

const PROFESSION_ALIASES = {
  // Keep Arcforge before Smithing in matching by using longest-alias scoring below.
  Arcforge: ['Arcforge', 'Arc Forge', '奥术锻造', '奥术'],
  Weaponcrafting: ['Weaponcrafting', 'Weapon Crafting', 'Weapon', '武器制作', '武器'],
  Leatherworking: ['Leatherworking', 'Leather Working', '制皮'],
  Woodcrafting: ['Woodcrafting', 'Wood Crafting', 'Wood', '木工'],
  Tailoring: ['Tailoring', 'Tailor', '裁缝'],
  Smithing: ['Smithing', '锻造']
};

const ITEM_ALIASES = {
  'Processed Cloth': ['Processed Cloth', '加工布料'],
  'Spool of Thread': ['Spool of Thread', 'Thread Spool', '线轴'],
  'Animal Fur Bundle': ['Animal Fur Bundle', 'Animal Fur', '动物毛皮包', '动物毛束'],
  Leather: ['Leather', '皮革'],
  'Processed Leather': ['Processed Leather', '加工皮革'],
  'Processed Wood': ['Processed Wood', '加工木材'],
  'Processed Parchment': ['Processed Parchment', '加工羊皮纸', '羊皮纸']
};

const MAPLESTORY_IO_ITEM_ICONS = {
  Screw: {
    aliases: ['Screw', '螺丝'],
    id: '4003000'
  }
};

function iconUrl(fileName) {
  return `${BASE_URL}${ICON_DIR}${encodeURIComponent(fileName).replace(/%2F/g, '/')}`;
}

function maplestoryIoIconUrl(id) {
  return `https://maplestory.io/api/GMS/83/item/${id}/icon?resize=2`;
}

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function iconOwnText(el) {
  return [
    el?.getAttribute?.('alt'),
    el?.getAttribute?.('title'),
    el?.textContent
  ].filter(Boolean).join(' ');
}

function containerText(el) {
  return [
    el?.getAttribute?.('alt'),
    el?.getAttribute?.('title'),
    el?.textContent,
    el?.closest?.('button, article, tr, .ingredient-branch, .smart-mat, .material-name, .ingredient-pill, th')?.innerText
  ].filter(Boolean).join(' ');
}

function scoreAliasMatch(sourceText, alias) {
  const source = normalizeText(sourceText);
  const needle = normalizeText(alias);
  if (!source || !needle) return 0;
  if (source === needle) return 10000 + needle.length;
  if (source.includes(needle)) return 1000 + needle.length;
  return 0;
}

function matchByAliases(text, aliasMap) {
  let best = null;
  for (const [key, aliases] of Object.entries(aliasMap)) {
    for (const alias of aliases) {
      const score = scoreAliasMatch(text, alias);
      if (score > (best?.score || 0)) best = { key, score };
    }
  }
  return best?.key || null;
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

function createMapleStoryIoImg(key, itemId, className = 'real-item-icon') {
  const img = document.createElement('img');
  img.className = className;
  img.src = maplestoryIoIconUrl(itemId);
  img.alt = key;
  img.title = `${key} · MapleStory.io item ${itemId}`;
  img.loading = 'lazy';
  img.dataset.maplestoryIoIcon = itemId;
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

function forceMapleStoryIoIcon(el, key, itemId) {
  if (!key || !itemId) return false;
  const text = iconOwnText(el);
  const matched = MAPLESTORY_IO_ITEM_ICONS[key].aliases.some((alias) => scoreAliasMatch(text, alias) > 0);
  if (!matched) return false;
  if (el.dataset?.maplestoryIoIcon === itemId) return false;

  if (el.tagName === 'IMG') {
    const expected = maplestoryIoIconUrl(itemId);
    if (el.src === expected || el.getAttribute('src') === expected) return false;
    el.src = expected;
    el.alt = key;
    el.title = `${key} · MapleStory.io item ${itemId}`;
    el.dataset.maplestoryIoIcon = itemId;
    el.removeAttribute('data-local-icon');
    return true;
  }

  const img = createMapleStoryIoImg(key, itemId);
  el.replaceWith(img);
  return true;
}

function patchMaterialIcons(root = document.body) {
  let changed = 0;

  root.querySelectorAll?.('img.real-item-icon, .emoji-fallback, [data-local-icon]').forEach((el) => {
    for (const [key, config] of Object.entries(MAPLESTORY_IO_ITEM_ICONS)) {
      if (forceMapleStoryIoIcon(el, key, config.id)) changed += 1;
    }
  });

  root.querySelectorAll?.('img.real-item-icon, .emoji-fallback').forEach((el) => {
    const key = matchByAliases(iconOwnText(el), ITEM_ALIASES);
    if (replaceIconElement(el, key)) changed += 1;
  });

  return changed;
}

function patchProfessionButton(button) {
  const key = matchByAliases(containerText(button), PROFESSION_ALIASES);
  if (!key) return false;

  const existing = button.querySelector('[data-local-icon]');
  if (existing?.dataset?.localIcon === key) return false;
  existing?.remove();

  const target = button.querySelector('b, .head-icon, .profession-local-icon') || button.firstElementChild || button;
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
    const key = matchByAliases(containerText(tab), PROFESSION_ALIASES);
    if (!key) return;

    setTimeout(() => {
      const smartButtons = [...document.querySelectorAll('.smart-prof')];
      const target = smartButtons.find((button) => matchByAliases(containerText(button), PROFESSION_ALIASES) === key);
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
  const rows = [...document.querySelectorAll('[data-local-icon], [data-maplestory-io-icon]')].map((el, index) => ({
    index,
    key: el.dataset.localIcon || 'MapleStory.io item',
    maplestoryIoIcon: el.dataset.maplestoryIoIcon || '',
    src: el.getAttribute('src'),
    error: el.dataset.localIconError === '1',
    nearbyText: el.closest('button, article, tr, .ingredient-branch, .smart-mat, .material-name, .ingredient-pill, th')?.innerText?.slice(0, 220) || ''
  }));
  console.table(rows);
  return rows;
}

function helpLocalIcons() {
  const rows = [
    { command: 'MSCWLocalIcons.apply()', description: 'Force apply public/icons PNG icons and MapleStory.io item icon exceptions.' },
    { command: 'MSCWLocalIcons.scan()', description: 'List currently applied local PNG and MapleStory.io override icons.' },
    { command: 'MSCWLocalIcons.files', description: 'Show expected public/icons PNG filenames.' },
    { command: 'MSCWLocalIcons.maplestoryIoItems', description: 'Show items that must stay on MapleStory.io icons.' }
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
  maplestoryIoItems: MAPLESTORY_IO_ITEM_ICONS,
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

console.info('[MSCWLocalIcons] public/icons PNG icon override loaded. Screw stays on MapleStory.io item 4003000. Run MSCWLocalIcons.help()');
