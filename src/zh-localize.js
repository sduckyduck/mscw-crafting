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

const ITEM_TRANSLATIONS = new Map([
  // Ores / ingots
  ['Bronze Ore', '青铜矿石'], ['Iron Ore', '铁矿石'], ['Steel Ore', '钢铁矿石'], ['Mithril Ore', '秘银矿石'], ['Adamantium Ore', '金刚矿石'], ['Silver Ore', '银矿石'], ['Orihalcon Ore', '奥利哈钢矿石'], ['Gold Ore', '黄金矿石'],
  ['Bronze Ingot', '青铜锭'], ['Iron Ingot', '铁锭'], ['Steel Ingot', '钢铁锭'], ['Mithril Ingot', '秘银锭'], ['Adamantium Ingot', '金刚锭'], ['Silver Ingot', '银锭'], ['Orihalcon Ingot', '奥利哈钢锭'], ['Gold Ingot', '黄金锭'],
  ['Bronze Plate', '青铜板'], ['Iron Plate', '铁板'], ['Steel Plate', '钢铁板'], ['Mithril Plate', '秘银板'], ['Adamantium Plate', '金刚板'], ['Silver Plate', '银板'], ['Orihalcon Plate', '奥利哈钢板'], ['Gold Plate', '黄金板'],

  // Gems / crystals
  ['Garnet', '石榴石'], ['Amethyst', '紫水晶'], ['Aquamarine', '海蓝石'], ['Emerald', '祖母绿'], ['Opal', '蛋白石'], ['Sapphire', '蓝宝石'], ['Topaz', '黄晶'], ['Diamond', '钻石'], ['Black Crystal', '黑水晶'],
  ['Garnet Ore', '石榴石母矿'], ['Amethyst Ore', '紫水晶母矿'], ['Aquamarine Ore', '海蓝石母矿'], ['Emerald Ore', '祖母绿母矿'], ['Opal Ore', '蛋白石母矿'], ['Sapphire Ore', '蓝宝石母矿'], ['Topaz Ore', '黄晶母矿'], ['Diamond Ore', '钻石母矿'], ['Black Crystal Ore', '黑水晶母矿'],

  // Common materials
  ['Screw', '螺丝'], ['Processed Wood', '加工木材'], ['Firewood', '木柴'], ['Stiff Feather', '硬羽毛'], ['Leather', '皮革'], ['Processed Leather', '加工皮革'], ['Processed Cloth', '加工布料'], ['Spool of Thread', '线轴'], ['Dragon Skin', '龙皮'], ['Drake Skull', '幼龙头骨'], ['Stirge Wing', '蝙蝠翅膀'], ['Fragment of Magic', '魔法碎片'],
  ['Snail Shell', '蜗牛壳'], ['Blue Snail Shell', '蓝蜗牛壳'], ['Red Snail Shell', '红蜗牛壳'], ['Orange Mushroom Cap', '橙蘑菇盖'], ['Green Mushroom Cap', '绿蘑菇盖'], ['Blue Mushroom Cap', '蓝蘑菇盖'], ['Jr. Necki Skin', '小青蛇皮'], ['Curse Eye Tail', '诅咒眼尾巴'], ['Clang Claw', '机械章鱼爪'],

  // Arrows / woodcrafting
  ['Arrow for Bow', '弓箭矢'], ['Arrow for Crossbow', '弩箭矢'], ['Bow', '弓'], ['Crossbow', '弩'],

  // Common equipment examples already appearing in the tool
  ['Metal Gear', '金属头盔'], ['Yellow Metal Gear', '黄色金属头盔'], ['Blue Metal Gear', '蓝色金属头盔'], ['Steel Helmet', '钢铁头盔'], ['Bronze Helmet', '青铜头盔'], ['Mithril Helmet', '秘银头盔'], ['Steel Full Helm', '钢铁全盔'], ['Bronze Full Helm', '青铜全盔'], ['Mithril Full Helm', '秘银全盔'], ['Steel Football Helmet', '钢铁橄榄球头盔'], ['Bronze Football Helmet', '青铜橄榄球头盔'], ['Mithril Football Helmet', '秘银橄榄球头盔'], ['Iron Viking Helm', '铁维京头盔'], ['Bronze Viking Helm', '青铜维京头盔'], ['Mithril Viking Helm', '秘银维京头盔'], ['Steel Sharp Helm', '钢铁尖角头盔'], ['Bronze Coif', '青铜头巾'], ['Mithril Coif', '秘银头巾'], ['Gold Burgernet Helm', '黄金护面盔'], ['Orihalcon Burgernet Helm', '奥利哈钢护面盔'], ['Steel Fingerless Gloves', '钢铁露指手套']
]);

const PREFIX_TRANSLATIONS = new Map([
  ['Bronze', '青铜'], ['Iron', '铁'], ['Steel', '钢铁'], ['Mithril', '秘银'], ['Adamantium', '金刚'], ['Silver', '银'], ['Orihalcon', '奥利哈钢'], ['Gold', '黄金'], ['Dark', '黑暗'], ['Black', '黑色'], ['White', '白色'], ['Red', '红色'], ['Blue', '蓝色'], ['Green', '绿色'], ['Yellow', '黄色'], ['Orange', '橙色'], ['Brown', '棕色'], ['Purple', '紫色'], ['Old', '旧'], ['New', '新'], ['Basic', '基础'], ['Sturdy', '坚固'], ['Processed', '加工']
]);

const SUFFIX_TRANSLATIONS = new Map([
  ['Full Helm', '全盔'], ['Football Helmet', '橄榄球头盔'], ['Viking Helm', '维京头盔'], ['Burgernet Helm', '护面盔'], ['Sharp Helm', '尖角头盔'], ['Helmet', '头盔'], ['Helm', '头盔'], ['Coif', '头巾'], ['Cap', '帽子'], ['Hat', '帽子'], ['Gloves', '手套'], ['Fingerless Gloves', '露指手套'], ['Shoes', '鞋子'], ['Boots', '靴子'], ['Robe', '长袍'], ['Suit', '套服'], ['Armor', '盔甲'], ['Pants', '裤子'], ['Shirt', '上衣'], ['Skirt', '裙子'], ['Cape', '披风'], ['Shield', '盾牌'], ['Sword', '剑'], ['Axe', '斧'], ['Mace', '钝器'], ['Spear', '枪'], ['Pole Arm', '矛'], ['Polearm', '矛'], ['Wand', '短杖'], ['Staff', '长杖'], ['Bow', '弓'], ['Crossbow', '弩'], ['Dagger', '短刀'], ['Claw', '拳套'], ['Knuckler', '指节'], ['Gun', '枪械'], ['Ingot', '锭'], ['Ore', '矿石'], ['Plate', '板'], ['Leather', '皮革'], ['Cloth', '布料'], ['Thread', '线'], ['Wood', '木材']
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
  [/score /g, '评分 '], [/zero-meso stages/g, '个零金币阶段'], [/avg /g, '平均 '], [/ meso\/EXP/g, ' 金币/熟练度'], [/ route: level-by-level picks/g, '路线：逐级推荐'], [/ crafts · \+/g, '次制作 · +'], [/ EXP · /g, ' 熟练度 · '], [/ meso each/g, ' 金币/次'], [/char Lv\./g, '角色Lv.'], [/Crafted via /g, '由'], [/: /g, '：'], [/ craft\b/g, '次制作'], [/ crafts\b/g, '次制作'], [/sub-craft fee /g, '子配方手续费 '], [/No verified icon ID/g, '暂无已验证图标ID'], [/Verified icon ID /g, '已验证图标ID '], [/Material shopping\/farming list/g, '材料购买 / 刷怪清单'], [/Sub-branches show one-level craftable dependencies, such as ingots → ores\. Next we can add full recursive expansion and craft-vs-buy toggles\./g, '分支目前显示一层可制作依赖，比如锭 → 矿石。下一步可以加入完整递归展开，以及制作/购买切换。'], [/No-Meso Woodcrafting Planner/g, '木工零金币升级规划'], [/All Recipes/g, '全部配方'], [/Recipe Browser/g, '配方浏览器'], [/Lv\./g, 'Lv.'], [/EXP/g, '熟练度'], [/meso/g, '金币']
];

const PLACEHOLDER_TRANSLATIONS = new Map([
  ['Search materials, recipes, or verified icon ID...', '搜索材料、配方或已验证图标ID...'],
  ['Search materials, recipes, or item ID...', '搜索材料、配方或物品ID...']
]);

function normalizeItemName(name) {
  return String(name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function lookupItemTranslation(itemName) {
  const normalized = normalizeItemName(itemName);
  const exact = [...ITEM_TRANSLATIONS.entries()].find(([key]) => normalizeItemName(key) === normalized);
  if (exact) return exact[1];

  for (const [suffix, suffixZh] of [...SUFFIX_TRANSLATIONS.entries()].sort((a, b) => b[0].length - a[0].length)) {
    if (itemName.endsWith(suffix)) {
      const prefixRaw = itemName.slice(0, -suffix.length).trim();
      if (!prefixRaw) return suffixZh;
      const prefixParts = prefixRaw.split(/\s+/).map((part) => PREFIX_TRANSLATIONS.get(part) || part);
      return `${prefixParts.join('')}${suffixZh}`;
    }
  }

  return null;
}

function translateItemLikeText(text) {
  let result = text;

  const qtyMatch = result.match(/^(.+?)\s*×\s*([\d,]+)$/);
  if (qtyMatch) {
    const translated = lookupItemTranslation(qtyMatch[1]);
    if (translated) return `${translated} ×${qtyMatch[2]}`;
  }

  const direct = lookupItemTranslation(result);
  if (direct) return direct;

  // Translate item names inside longer text nodes, longest first to avoid partial replacement.
  const knownNames = [...ITEM_TRANSLATIONS.keys()].sort((a, b) => b.length - a.length);
  for (const name of knownNames) {
    const zh = ITEM_TRANSLATIONS.get(name);
    result = result.replace(new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'), zh);
  }

  return result;
}

function translateText(value) {
  if (!value || !value.trim()) return value;
  const leading = value.match(/^\s*/)?.[0] || '';
  const trailing = value.match(/\s*$/)?.[0] || '';
  let core = value.trim();

  if (EXACT_TRANSLATIONS.has(core)) return `${leading}${EXACT_TRANSLATIONS.get(core)}${trailing}`;

  core = translateItemLikeText(core);

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
