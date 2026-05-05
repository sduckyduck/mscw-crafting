const CRAFTING_URL = 'https://ohmi69.github.io/osms_datamine_dashboard/data/current/crafting.json';

function getAllTextNodes(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}

function looksLikeEnglishItemName(text) {
  const value = String(text || '').trim();
  if (!value) return false;
  if (!/[A-Za-z]/.test(value)) return false;
  if (/^(Lv\.|ID|GMS|EXP|MSCW)$/i.test(value)) return false;
  if (/github|sduckyduck|http|www\./i.test(value)) return false;
  if (/^[A-Za-z]\.?$/.test(value)) return false;
  return /\b(ingot|ore|helm|helmet|gloves|shoes|cap|shell|tail|skin|thread|wood|leather|screw|crystal|topaz|garnet|bow|crossbow|bundle|fur|skull|mushroom|animal|claw|wing)\b/i.test(value);
}

function scanIcons() {
  const imgs = [...document.querySelectorAll('img.real-item-icon')];
  const rows = imgs.map((img, index) => ({
    index,
    alt: img.alt || '',
    title: img.title || '',
    src: img.currentSrc || img.src || '',
    loaded: img.complete && img.naturalWidth > 0,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    visible: !!(img.offsetWidth || img.offsetHeight || img.getClientRects().length)
  }));
  const broken = rows.filter((row) => !row.loaded);
  console.table(rows);
  if (broken.length) {
    console.warn('[MSCWDebug] Broken icon images:', broken);
  } else {
    console.info('[MSCWDebug] No broken <img.real-item-icon> found on current screen. Wrong-looking icons usually mean wrong name→ID mapping, not a failed PNG load.');
  }
  return rows;
}

function scanFallbackIcons() {
  const rows = [...document.querySelectorAll('.emoji-fallback')].map((el, index) => ({
    index,
    text: el.textContent?.trim() || '',
    title: el.getAttribute('title') || '',
    nearbyText: el.closest('article, tr, .ingredient-branch, .smart-mat, .material-name, .ingredient-pill')?.innerText?.slice(0, 220) || ''
  }));
  console.table(rows);
  console.info(`[MSCWDebug] ${rows.length} fallback icons found on current screen.`);
  return rows;
}

function scanUntranslated() {
  const rows = getAllTextNodes()
    .map((node) => ({ text: node.nodeValue.trim(), element: node.parentElement?.tagName?.toLowerCase() || '' }))
    .filter((row) => looksLikeEnglishItemName(row.text))
    .map((row, index) => ({ index, ...row }));
  console.table(rows);
  console.info(`[MSCWDebug] ${rows.length} likely untranslated item/material/equipment text nodes on current screen.`);
  return rows;
}

function inspectText(query) {
  const q = String(query || '').toLowerCase();
  const rows = getAllTextNodes()
    .map((node, index) => ({
      index,
      text: node.nodeValue.trim(),
      tag: node.parentElement?.tagName?.toLowerCase() || '',
      className: node.parentElement?.className || '',
      parentText: node.parentElement?.innerText?.slice(0, 280) || ''
    }))
    .filter((row) => row.text.toLowerCase().includes(q) || row.parentText.toLowerCase().includes(q));
  console.table(rows);
  return rows;
}

function inspectIcon(query) {
  const q = String(query || '').toLowerCase();
  const rows = [...document.querySelectorAll('img.real-item-icon, .emoji-fallback')]
    .map((el, index) => ({
      index,
      type: el.tagName.toLowerCase() === 'img' ? 'image' : 'fallback',
      alt: el.getAttribute('alt') || '',
      title: el.getAttribute('title') || '',
      src: el.getAttribute('src') || '',
      loaded: el.tagName.toLowerCase() === 'img' ? el.complete && el.naturalWidth > 0 : null,
      nearbyText: el.closest('article, tr, .ingredient-branch, .smart-mat, .material-name, .ingredient-pill')?.innerText?.slice(0, 260) || ''
    }))
    .filter((row) => `${row.alt} ${row.title} ${row.nearbyText}`.toLowerCase().includes(q));
  console.table(rows);
  return rows;
}

async function listDatasetNames() {
  const data = await fetch(CRAFTING_URL).then((res) => res.json());
  const resultNames = new Set();
  const ingredientNames = new Set();
  const rows = [];
  (data.disciplines || []).forEach((discipline) => {
    (discipline.output_types || []).forEach((type) => {
      (type.levels || []).forEach((level) => {
        (level.recipes || []).forEach((recipe) => {
          resultNames.add(recipe.result_item_name);
          rows.push({ kind: 'result', profession: discipline.discipline, level: recipe.req_level ?? level.level, name: recipe.result_item_name, output_id: recipe.output_id ?? '', exp: recipe.craft_exp ?? '' });
          (recipe.ingredients || []).forEach((ingredient) => {
            ingredientNames.add(ingredient.item_name);
            rows.push({ kind: 'ingredient', profession: discipline.discipline, level: recipe.req_level ?? level.level, name: ingredient.item_name, output_id: '', exp: '' });
          });
        });
      });
    });
  });
  const summary = {
    resultCount: resultNames.size,
    ingredientCount: ingredientNames.size,
    totalUnique: new Set([...resultNames, ...ingredientNames]).size,
    resultNames: [...resultNames].sort(),
    ingredientNames: [...ingredientNames].sort(),
    rows
  };
  console.info('[MSCWDebug] Dataset name summary:', summary);
  console.table(rows.slice(0, 200));
  return summary;
}

async function findDatasetName(query) {
  const summary = await listDatasetNames();
  const q = String(query || '').toLowerCase();
  const rows = summary.rows.filter((row) => String(row.name || '').toLowerCase().includes(q));
  console.table(rows);
  return rows;
}

function help() {
  const commands = {
    'MSCWDebug.scanIcons()': 'List all real MapleStory.io icon images currently rendered and whether the PNG loaded.',
    'MSCWDebug.scanFallbackIcons()': 'List all fallback emoji icons currently rendered; usually missing verified icon ID.',
    'MSCWDebug.scanUntranslated()': 'Find likely English item/material/equipment names still visible on the current page.',
    "MSCWDebug.inspectIcon('Brown Skullcap')": 'Inspect icon element, src, title, and nearby text for one item.',
    "MSCWDebug.inspectText('Animal Fur Bundle')": 'Find where a text appears in the current DOM.',
    'await MSCWDebug.listDatasetNames()': 'Fetch crafting.json and list unique recipe result/ingredient names.',
    "await MSCWDebug.findDatasetName('Skullcap')": 'Search names from the raw dataset.'
  };
  console.table(Object.entries(commands).map(([command, description]) => ({ command, description })));
  return commands;
}

window.MSCWDebug = {
  help,
  scanIcons,
  scanFallbackIcons,
  scanUntranslated,
  inspectIcon,
  inspectText,
  listDatasetNames,
  findDatasetName
};

console.info('[MSCWDebug] Debug tools loaded. Run MSCWDebug.help()');
