const MAPLESTORY_IO_REGION = 'GMS';
const MAPLESTORY_IO_VERSION = '83';

// Corrections based on classic MapleStory item-name IDs.
// This layer intentionally overrides earlier wrong IDs from the app bundle without needing to rebuild every component.
const CORRECT_ICON_IDS = {
  'Arrow for Bow': '2060000',
  'Arrow for Crossbow': '2061000',

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

  // Crafting ETC materials.
  'Screw': '4003000',
  'Processed Wood': '4003001',
  'Stiff Feather': '4003004',
  'Soft Feather': '4003005',

  // Equipment confirmed from the user / classic data.
  'Brown Skullcap': '1002008'
};

const ICON_ALIASES = {
  'Arrow for Bow': ['Arrow for Bow', '弓箭矢', '弓箭'],
  'Arrow for Crossbow': ['Arrow for Crossbow', '弩箭矢', '弩箭'],
  'Tree Branch': ['Tree Branch', '树枝'],
  'Stiff Feather': ['Stiff Feather', '硬羽毛'],
  'Soft Feather': ['Soft Feather', '柔软羽毛'],
  'Screw': ['Screw', '螺丝'],
  'Processed Wood': ['Processed Wood', '加工木材'],
  'Blue Snail Shell': ['Blue Snail Shell', '蓝蜗牛壳'],
  'Orange Mushroom Cap': ['Orange Mushroom Cap', '花蘑菇盖', '橙蘑菇盖'],
  "Pig's Ribbon": ["Pig's Ribbon", '猪的蝴蝶结'],
  'Squishy Liquid': ['Squishy Liquid', '黏稠液体'],
  'Leaf': ['Leaf', '叶子'],
  'Octopus Leg': ['Octopus Leg', '章鱼脚'],
  'Evil Eye Tail': ['Evil Eye Tail', '邪恶眼尾巴'],
  'Charm of the Undead': ['Charm of the Undead', '亡灵符咒'],
  'Blue Mushroom Cap': ['Blue Mushroom Cap', '蓝蘑菇盖'],
  'Slime Bubble': ['Slime Bubble', '绿水灵泡泡'],
  'Mushroom Spore': ['Mushroom Spore', '蘑菇孢子'],
  'Green Mushroom Cap': ['Green Mushroom Cap', '绿蘑菇盖'],
  'Curse Eye Tail': ['Curse Eye Tail', '诅咒眼尾巴'],
  'Drake Skull': ['Drake Skull', '幼龙头骨'],
  'Horny Mushroom Cap': ['Horny Mushroom Cap', '刺蘑菇盖'],
  'Red Snail Shell': ['Red Snail Shell', '红蜗牛壳'],
  "Pig's Head": ["Pig's Head", '猪头'],
  'Firewood': ['Firewood', '木柴'],
  'Snail Shell': ['Snail Shell', '蜗牛壳'],
  'Leather': ['Leather', '皮革'],
  'Dragon Skin': ['Dragon Skin', '龙皮'],
  'Jr. Necki Skin': ['Jr. Necki Skin', '小青蛇皮'],
  'Stirge Wing': ['Stirge Wing', '蝙蝠翅膀'],
  'Clang Claw': ['Clang Claw', '机械章鱼爪'],
  'Brown Skullcap': ['Brown Skullcap', '棕色小帽']
};

const TEXT_CORRECTIONS = {
  'Animal Fur Bundle': '动物毛皮包',
  'Brown Skullcap': '棕色小帽',
  'Orange Mushroom Cap': '花蘑菇盖',
  'Tree Branch': '树枝',
  'Stiff Feather': '硬羽毛',
  'Soft Feather': '柔软羽毛',
  'Arrow for Bow': '弓箭矢',
  'Arrow for Crossbow': '弩箭矢'
};

function normalize(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function iconUrl(id) {
  return `https://maplestory.io/api/${MAPLESTORY_IO_REGION}/${MAPLESTORY_IO_VERSION}/item/${id}/icon?resize=2`;
}

function scoreAliasMatch(text, alias) {
  const value = normalize(text);
  const needle = normalize(alias);
  if (!value || !needle) return 0;
  if (value === needle) return 10000 + needle.length;
  if (value.includes(needle)) return 1000 + needle.length;
  return 0;
}

function findNameInText(text) {
  let best = null;
  for (const name of Object.keys(CORRECT_ICON_IDS)) {
    const aliases = ICON_ALIASES[name] || [name];
    for (const alias of aliases) {
      const score = scoreAliasMatch(text, alias);
      if (score > (best?.score || 0)) best = { name, score };
    }
  }
  return best?.name || null;
}

function ownIconText(el) {
  return [
    el.getAttribute?.('alt'),
    el.getAttribute?.('title'),
    el.textContent
  ].filter(Boolean).join(' ');
}

function nearbyText(el) {
  return [
    ownIconText(el),
    el.closest?.('article, tr, .ingredient-branch, .smart-mat, .material-name, .ingredient-pill')?.innerText
  ].filter(Boolean).join(' ');
}

function correctionForElement(el) {
  // Important: for real <img> icons, use only the icon's own alt/title/text.
  // Using the parent recipe card caused result icons such as Arrow for Bow to be mistaken for ingredient icons such as Tree Branch.
  let name = findNameInText(ownIconText(el));

  // Emoji fallback spans usually carry the item name in the title, but keep a narrow fallback for old renders.
  if (!name && el.classList?.contains('emoji-fallback')) name = findNameInText(nearbyText(el));

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
    img.setAttribute('alt', TEXT_CORRECTIONS[correction.name] || correction.name);
    img.removeAttribute('data-local-icon');
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
  img.alt = TEXT_CORRECTIONS[correction.name] || correction.name;
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

  root.querySelectorAll?.('img.real-item-icon, img[data-local-icon]').forEach((img) => {
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
  const aliasKey = exactKey || findNameInText(name);
  if (!aliasKey) {
    console.warn(`[MSCWIconFixes] No corrected icon ID registered for: ${name}`);
    return null;
  }
  const result = {
    name: aliasKey,
    id: CORRECT_ICON_IDS[aliasKey],
    url: iconUrl(CORRECT_ICON_IDS[aliasKey]),
    translation: TEXT_CORRECTIONS[aliasKey] || null
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
    { command: "MSCWIconFixes.expected('Arrow for Bow')", description: 'Show expected arrow icon ID and URL.' },
    { command: "MSCWIconFixes.expected('Tree Branch')", description: 'Show expected Tree Branch icon ID and URL.' },
    { command: "MSCWIconFixes.expected('Stiff Feather')", description: 'Show expected Stiff Feather icon ID and URL.' },
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
  aliases: ICON_ALIASES,
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

console.info('[MSCWIconFixes] Correction tools loaded. Arrow icons no longer inherit ingredient icons. Run MSCWIconFixes.help()');
