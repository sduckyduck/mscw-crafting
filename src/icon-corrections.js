const MAPLESTORY_IO_REGION = 'GMS';
const MAPLESTORY_IO_VERSION = '83';

// Corrections based on classic MapleStory item-name IDs.
// This layer intentionally overrides earlier wrong IDs from the app bundle without needing to rebuild every component.
const CORRECT_ICON_IDS = {
  'Blue Snail Shell': '4000000',
  'Orange Mushroom Cap': '4000001',
  "Pig's Ribbon": '4000002',
  'Tree Branch': '4000003',
  'Squishy Liquid': '4000004',
  'Leaf': '4000005',
  'Octopus Leg': '4000006',
  'Evil Eye Tail': '4000007',
  'Charm of the Undead': '4000008',
  'Blue Mushroom Cap': '4000009',
  'Slime Bubble': '4000010',
  'Mushroom Spore': '4000011',
  'Green Mushroom Cap': '4000012',
  'Curse Eye Tail': '4000013',
  'Drake Skull': '4000014',
  'Horny Mushroom Cap': '4000015',
  'Red Snail Shell': '4000016',
  "Pig's Head": '4000017',
  'Firewood': '4000018',
  'Snail Shell': '4000019',
  'Leather': '4000021',
  'Dragon Skin': '4000030',
  'Jr. Necki Skin': '4000034',
  'Stirge Wing': '4000042',
  'Clang Claw': '4000044',

  // Equipment confirmed from the user / classic data.
  'Brown Skullcap': '1002008'
};

const TEXT_CORRECTIONS = {
  'Animal Fur Bundle': '动物毛皮包',
  'Brown Skullcap': '棕色小帽',
  'Orange Mushroom Cap': '花蘑菇盖'
};

function normalize(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function iconUrl(id) {
  return `https://maplestory.io/api/${MAPLESTORY_IO_REGION}/${MAPLESTORY_IO_VERSION}/item/${id}/icon?resize=2`;
}

function findNameInText(text, mapping = CORRECT_ICON_IDS) {
  const value = String(text || '').toLowerCase();
  return Object.keys(mapping).find((name) => value.includes(name.toLowerCase())) || null;
}

function correctionForElement(el) {
  const text = [
    el.getAttribute?.('alt'),
    el.getAttribute?.('title'),
    el.closest?.('article, tr, .ingredient-branch, .smart-mat, .material-name, .ingredient-pill')?.innerText
  ].filter(Boolean).join(' ');
  const name = findNameInText(text);
  if (!name) return null;
  return { name, id: CORRECT_ICON_IDS[name], url: iconUrl(CORRECT_ICON_IDS[name]) };
}

function patchImage(img) {
  const correction = correctionForElement(img);
  if (!correction) return false;
  if (!img.src.includes(`/item/${correction.id}/`)) {
    img.src = correction.url;
    img.setAttribute('data-mscw-corrected-icon', correction.id);
    img.setAttribute('title', `${TEXT_CORRECTIONS[correction.name] || correction.name} · corrected icon ${correction.id}`);
    return true;
  }
  return false;
}

function replaceFallback(el) {
  const correction = correctionForElement(el);
  if (!correction) return false;
  const img = document.createElement('img');
  img.className = 'real-item-icon';
  img.src = correction.url;
  img.alt = correction.name;
  img.title = `${TEXT_CORRECTIONS[correction.name] || correction.name} · corrected icon ${correction.id}`;
  img.loading = 'lazy';
  img.setAttribute('data-mscw-corrected-icon', correction.id);
  img.onerror = () => {
    img.replaceWith(el);
  };
  el.replaceWith(img);
  return true;
}

function patchTextNode(node) {
  if (node.nodeType !== Node.TEXT_NODE || !node.nodeValue) return false;
  let next = node.nodeValue;
  for (const [en, zh] of Object.entries(TEXT_CORRECTIONS)) {
    next = next.replace(new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), zh);
  }
  if (next !== node.nodeValue) {
    node.nodeValue = next;
    return true;
  }
  return false;
}

function patchText(root = document.body) {
  if (!root) return 0;
  let changed = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => { if (patchTextNode(node)) changed += 1; });

  root.querySelectorAll?.('[title], [alt]').forEach((el) => {
    ['title', 'alt'].forEach((attr) => {
      const oldValue = el.getAttribute(attr);
      if (!oldValue) return;
      let next = oldValue;
      for (const [en, zh] of Object.entries(TEXT_CORRECTIONS)) {
        next = next.replace(new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), zh);
      }
      if (next !== oldValue) {
        el.setAttribute(attr, next);
        changed += 1;
      }
    });
  });
  return changed;
}

function applyIconCorrections(root = document.body) {
  if (!root) return { images: 0, fallbacks: 0, text: 0 };
  let images = 0;
  let fallbacks = 0;

  root.querySelectorAll?.('img.real-item-icon').forEach((img) => {
    if (patchImage(img)) images += 1;
  });

  root.querySelectorAll?.('.emoji-fallback').forEach((el) => {
    if (replaceFallback(el)) fallbacks += 1;
  });

  const text = patchText(root);
  return { images, fallbacks, text };
}

function inspectExpectedIcon(name) {
  const exactKey = Object.keys(CORRECT_ICON_IDS).find((key) => normalize(key) === normalize(name));
  if (!exactKey) {
    console.warn(`[MSCWIconFixes] No corrected icon ID registered for: ${name}`);
    return null;
  }
  const result = {
    name: exactKey,
    id: CORRECT_ICON_IDS[exactKey],
    url: iconUrl(CORRECT_ICON_IDS[exactKey]),
    translation: TEXT_CORRECTIONS[exactKey] || null
  };
  console.table([result]);
  return result;
}

function scanCorrectedIcons() {
  const rows = [...document.querySelectorAll('[data-mscw-corrected-icon]')].map((el, index) => ({
    index,
    tag: el.tagName.toLowerCase(),
    alt: el.getAttribute('alt') || '',
    title: el.getAttribute('title') || '',
    correctedIcon: el.getAttribute('data-mscw-corrected-icon'),
    src: el.getAttribute('src') || '',
    nearbyText: el.closest('article, tr, .ingredient-branch, .smart-mat, .material-name, .ingredient-pill')?.innerText?.slice(0, 260) || ''
  }));
  console.table(rows);
  return rows;
}

function helpCorrections() {
  const rows = [
    { command: "MSCWIconFixes.expected('Orange Mushroom Cap')", description: 'Show expected corrected icon ID and URL.' },
    { command: 'MSCWIconFixes.apply()', description: 'Force-apply icon and text corrections to the current page.' },
    { command: 'MSCWIconFixes.scan()', description: 'List elements corrected by this patch layer.' },
    { command: 'MSCWIconFixes.map', description: 'Show the current corrected name → ID map.' }
  ];
  console.table(rows);
  return rows;
}

function installCorrections() {
  const run = () => applyIconCorrections(document.body);
  const first = run();
  console.info('[MSCWIconFixes] Applied corrections:', first);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) applyIconCorrections(node);
        if (node.nodeType === Node.TEXT_NODE) patchTextNode(node);
      });
      if (mutation.type === 'characterData') patchTextNode(mutation.target);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

window.MSCWIconFixes = {
  map: CORRECT_ICON_IDS,
  translations: TEXT_CORRECTIONS,
  apply: () => applyIconCorrections(document.body),
  scan: scanCorrectedIcons,
  expected: inspectExpectedIcon,
  help: helpCorrections
};

if (window.MSCWDebug) {
  window.MSCWDebug.expectedIcon = inspectExpectedIcon;
  window.MSCWDebug.applyIconCorrections = () => applyIconCorrections(document.body);
  window.MSCWDebug.scanCorrectedIcons = scanCorrectedIcons;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installCorrections, { once: true });
} else {
  installCorrections();
}

console.info('[MSCWIconFixes] Correction tools loaded. Run MSCWIconFixes.help()');
