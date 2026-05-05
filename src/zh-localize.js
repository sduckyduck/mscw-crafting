const EXACT_TRANSLATIONS = new Map([
  ['MSCW Crafting Optimizer', '冒险岛经典世界制作优化器'],
  ['Crafting Intelligence Dashboard', '制作系统智能仪表盘'],
  ['Smart Guide', '智能推荐'],
  ['Matrix', '材料矩阵'],
  ['Materials', '材料分析'],
  ['No-Meso Planner', '零金币升级'],
  ['Recipes', '配方库'],
  ['All', '全部'],
  ['Smart Recommendation', '智能推荐'],
  ['Profession Leveling Strategy', '专业升级策略'],
  ['Character class', '角色职业'],
  ['Goal', '目标'],
  ['Balanced', '均衡'],
  ['Lowest meso', '最省金币'],
  ['Fastest EXP', '最快经验'],
  ['Any', '通用'],
  ['Warrior', '战士'],
  ['Archer', '弓箭手'],
  ['Mage', '法师'],
  ['Thief', '飞侠'],
  ['Pirate', '海盗'],
  ['Smithing', '锻造'],
  ['Weaponcrafting', '武器制作'],
  ['Tailoring', '裁缝'],
  ['Woodcrafting', '木工'],
  ['Leatherworking', '制皮'],
  ['Arcforge', '奥术锻造'],
  ['Recommended profession order', '推荐专业顺序'],
  ['Material shopping/farming list', '材料购买 / 刷怪清单'],
  ['Total crafts', '总制作次数'],
  ['Total meso fee', '总金币手续费'],
  ['Mastery gained', '获得熟练度'],
  ['Cross-Profession Material Matrix', '跨专业材料矩阵'],
  ['Shows which materials are shared across the six professions.', '显示六大专业之间共享使用的材料。'],
  ['Shared Only', '只看共享材料'],
  ['Craftable Intermediates', '可制作中间材料'],
  ['Raw Mats', '原始材料'],
  ['Material', '材料'],
  ['Total', '总量'],
  ['Weapon', '武器'],
  ['Tailor', '裁缝'],
  ['Wood', '木工'],
  ['Leather', '制皮'],
  ['How to read', '如何阅读'],
  ['quantity needed / number of recipes', '所需数量 / 使用配方数'],
  ['High overlap', '高重合度'],
  ['Used in many recipes', '被大量配方使用'],
  ['Medium overlap', '中等重合度'],
  ['Used in several recipes', '被多个配方使用'],
  ['Single profession', '单一专业'],
  ['Narrow use case', '用途较窄'],
  ['Materials shown', '显示材料数'],
  ['Top total qty', '最高总需求'],
  ['Material Bottleneck Ranking', '材料瓶颈排行'],
  ['No-Meso Woodcrafting Planner', '木工零金币升级规划'],
  ['No zero-meso Woodcrafting recipe found.', '没有找到木工零金币且有熟练度的配方。'],
  ['Recipe', '配方'],
  ['EXP each', '每次熟练度'],
  ['Total crafts to Lv.10', '升到Lv.10总制作次数'],
  ['Stage', '阶段'],
  ['Need', '所需熟练度'],
  ['Crafts', '制作次数'],
  ['Overflow', '溢出'],
  ['Char Lv.', '角色Lv.'],
  ['All Recipes', '全部配方'],
  ['Recipe Browser', '配方浏览器']
]);

const PHRASE_TRANSLATIONS = [
  [/recipes loaded · smart branches active/g, '个配方已加载 · 智能分支已启用'],
  [/recipes loaded · smart recommendation active/g, '个配方已加载 · 智能推荐已启用'],
  [/recipes loaded · strict verified-name icons active/g, '个配方已加载 · 严格名称图标已启用'],
  [/Loading current data\.\.\./g, '正在加载当前数据...'],
  [/General account progression\. Prioritizes cheap mastery and broadly useful intermediate materials\./g, '通用账号发展路线。优先考虑低成本熟练度和泛用中间材料。'],
  [/Warriors benefit from Smithing and Weaponcrafting for metal armor and weapon chains\. Leatherworking can still matter for glove\/secondary material chains\./g, '战士优先考虑锻造和武器制作，用于金属护甲与武器链。制皮也会影响手套和部分中间材料链。'],
  [/Archers benefit most from Woodcrafting for bow\/crossbow\/arrows and Leatherworking for archer gear support\./g, '弓箭手最适合木工，用于弓、弩和箭矢；制皮可补足弓手装备材料。'],
  [/Mages usually care about Arcforge for magic materials and Tailoring for robes\/cloth gear\. Woodcrafting can support staffs and wooden intermediates\./g, '法师通常优先奥术锻造和裁缝，前者负责魔法材料，后者负责长袍/布甲；木工可辅助法杖和木制中间材料。'],
  [/Thieves lean into Leatherworking for gear and Weaponcrafting for weapon progression\. Smithing helps with shared metal intermediates\./g, '飞侠偏向制皮和武器制作；锻造可以补充共享金属中间材料。'],
  [/Pirates, if included in your version, usually lean Weaponcrafting and Leatherworking, with Smithing feeding metal parts\./g, '如果版本包含海盗，通常偏向武器制作和制皮，锻造负责提供金属部件。'],
  [/score /g, '评分 '],
  [/zero-meso stages/g, '个零金币阶段'],
  [/avg /g, '平均 '],
  [/ meso\/EXP/g, ' 金币/熟练度'],
  [/ route: level-by-level picks/g, '路线：逐级推荐'],
  [/ crafts · \+/g, '次制作 · +'],
  [/ EXP · /g, ' 熟练度 · '],
  [/ meso each/g, ' 金币/次'],
  [/char Lv\./g, '角色Lv.'],
  [/Crafted via /g, '由'],
  [/: /g, '：'],
  [/ craft\b/g, '次制作'],
  [/ crafts\b/g, '次制作'],
  [/sub-craft fee /g, '子配方手续费 '],
  [/No verified icon ID/g, '暂无已验证图标ID'],
  [/Verified icon ID /g, '已验证图标ID '],
  [/Material shopping\/farming list/g, '材料购买 / 刷怪清单'],
  [/Sub-branches show one-level craftable dependencies, such as ingots → ores\. Next we can add full recursive expansion and craft-vs-buy toggles\./g, '分支目前显示一层可制作依赖，比如锭 → 矿石。下一步可以加入完整递归展开，以及制作/购买切换。'],
  [/No-Meso Woodcrafting Planner/g, '木工零金币升级规划'],
  [/All Recipes/g, '全部配方'],
  [/Recipe Browser/g, '配方浏览器'],
  [/Lv\./g, 'Lv.'],
  [/EXP/g, '熟练度'],
  [/meso/g, '金币']
];

const PLACEHOLDER_TRANSLATIONS = new Map([
  ['Search materials, recipes, or verified icon ID...', '搜索材料、配方或已验证图标ID...'],
  ['Search materials, recipes, or item ID...', '搜索材料、配方或物品ID...']
]);

function translateText(value) {
  if (!value || !value.trim()) return value;
  const leading = value.match(/^\s*/)?.[0] || '';
  const trailing = value.match(/\s*$/)?.[0] || '';
  let core = value.trim();

  if (EXACT_TRANSLATIONS.has(core)) return `${leading}${EXACT_TRANSLATIONS.get(core)}${trailing}`;

  for (const [pattern, replacement] of PHRASE_TRANSLATIONS) {
    core = core.replace(pattern, replacement);
  }

  core = core
    .replace(/^(Smithing|Weaponcrafting|Tailoring|Woodcrafting|Leatherworking|Arcforge)路线：/, (match, prof) => `${EXACT_TRANSLATIONS.get(prof) || prof}路线：`)
    .replace(/^(Smithing|Weaponcrafting|Tailoring|Woodcrafting|Leatherworking|Arcforge) Recipe Browser$/, (match, prof) => `${EXACT_TRANSLATIONS.get(prof) || prof}配方浏览器`)
    .replace(/\bSmithing\b/g, '锻造')
    .replace(/\bWeaponcrafting\b/g, '武器制作')
    .replace(/\bTailoring\b/g, '裁缝')
    .replace(/\bWoodcrafting\b/g, '木工')
    .replace(/\bLeatherworking\b/g, '制皮')
    .replace(/\bArcforge\b/g, '奥术锻造')
    .replace(/\bBalanced\b/g, '均衡')
    .replace(/\bLowest meso\b/g, '最省金币')
    .replace(/\bFastest 熟练度\b/g, '最快熟练度')
    .replace(/\bFastest EXP\b/g, '最快熟练度')
    .replace(/\bAny\b/g, '通用')
    .replace(/\bWarrior\b/g, '战士')
    .replace(/\bArcher\b/g, '弓箭手')
    .replace(/\bMage\b/g, '法师')
    .replace(/\bThief\b/g, '飞侠')
    .replace(/\bPirate\b/g, '海盗');

  return `${leading}${core}${trailing}`;
}

function translateNodeText(node) {
  if (node.nodeType !== Node.TEXT_NODE) return;
  const next = translateText(node.nodeValue);
  if (next !== node.nodeValue) node.nodeValue = next;
}

function translateAttributes(root) {
  const elements = root.querySelectorAll?.('[placeholder], [title], [aria-label], option, button, select') || [];
  elements.forEach((el) => {
    ['placeholder', 'title', 'aria-label'].forEach((attr) => {
      const value = el.getAttribute?.(attr);
      if (!value) return;
      const exact = PLACEHOLDER_TRANSLATIONS.get(value) || translateText(value);
      if (exact !== value) el.setAttribute(attr, exact);
    });
  });
}

function translateTree(root = document.body) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(translateNodeText);
  translateAttributes(root);
}

function installChineseLocalization() {
  const run = () => translateTree(document.body);
  run();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) translateNodeText(node);
        else if (node.nodeType === Node.ELEMENT_NODE) translateTree(node);
      });
      if (mutation.type === 'characterData') translateNodeText(mutation.target);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installChineseLocalization, { once: true });
} else {
  installChineseLocalization();
}
