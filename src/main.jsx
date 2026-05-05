import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertTriangle, CheckCircle2, Coins, Database, Hammer, Network, Route, Search, Sparkles, Wheat } from 'lucide-react';
import './styles.css';

const CRAFTING_DATA_URL = 'https://ohmi69.github.io/osms_datamine_dashboard/data/current/crafting.json';
const OVERVIEW_DATA_URL = 'https://ohmi69.github.io/osms_datamine_dashboard/data/current/overview.json';
const EXPECTED_DASHBOARD_RECIPES = 342;
const maxProfessionLevel = 10;

const sampleProfessions = [
  { id: 'smithing', name: 'Smithing', description: 'Metal plates, weapon bases, and heavy gear materials.' },
  { id: 'weaponcrafting', name: 'Weaponcrafting', description: 'Physical weapons and high-value attack progression.' },
  { id: 'tailoring', name: 'Tailoring', description: 'Cloth armor, robes, and magic-user progression.' },
  { id: 'woodcrafting', name: 'Woodcrafting', description: 'Bows, crossbows, staffs, handles, and wooden parts.' },
  { id: 'leatherworking', name: 'Leatherworking', description: 'Leather gear, thief/archer pieces, and flexible materials.' },
  { id: 'arcforge', name: 'Arcforge', description: 'Magic catalysts, refined crystals, and late-game enhancement parts.' }
];

const expTable = [
  { level: 1, nextExp: 80 },
  { level: 2, nextExp: 120 },
  { level: 3, nextExp: 180 },
  { level: 4, nextExp: 260 },
  { level: 5, nextExp: 360 },
  { level: 6, nextExp: 500 },
  { level: 7, nextExp: 680 },
  { level: 8, nextExp: 880 },
  { level: 9, nextExp: 1100 }
];

const sampleItems = {
  iron_ore: { id: 'iron_ore', name: 'Iron Ore', source: 'monster_drop', rarity: 1, basePrice: 120 },
  bronze_ore: { id: 'bronze_ore', name: 'Bronze Ore', source: 'monster_drop', rarity: 1, basePrice: 90 },
  steel_ore: { id: 'steel_ore', name: 'Steel Ore', source: 'monster_drop', rarity: 2, basePrice: 210 },
  mithril_ore: { id: 'mithril_ore', name: 'Mithril Ore', source: 'monster_drop', rarity: 3, basePrice: 450 },
  adamantium_ore: { id: 'adamantium_ore', name: 'Adamantium Ore', source: 'monster_drop', rarity: 4, basePrice: 850 },
  coal: { id: 'coal', name: 'Coal', source: 'npc', rarity: 1, basePrice: 80 },
  screw: { id: 'screw', name: 'Screw', source: 'crafted', rarity: 2, basePrice: 250 },
  stiff_feather: { id: 'stiff_feather', name: 'Stiff Feather', source: 'monster_drop', rarity: 1, basePrice: 70 },
  animal_skin: { id: 'animal_skin', name: 'Animal Skin', source: 'monster_drop', rarity: 1, basePrice: 100 },
  leather: { id: 'leather', name: 'Leather', source: 'crafted', rarity: 2, basePrice: 300 },
  processed_wood: { id: 'processed_wood', name: 'Processed Wood', source: 'crafted', rarity: 1, basePrice: 180 },
  firewood: { id: 'firewood', name: 'Firewood', source: 'monster_drop', rarity: 1, basePrice: 60 },
  branch: { id: 'branch', name: 'Branch', source: 'monster_drop', rarity: 1, basePrice: 45 },
  magic_powder: { id: 'magic_powder', name: 'Magic Powder', source: 'monster_drop', rarity: 3, basePrice: 600 },
  crystal_shard: { id: 'crystal_shard', name: 'Crystal Shard', source: 'monster_drop', rarity: 3, basePrice: 700 },
  dark_crystal: { id: 'dark_crystal', name: 'Dark Crystal', source: 'monster_drop', rarity: 5, basePrice: 1500 },
  silk_thread: { id: 'silk_thread', name: 'Silk Thread', source: 'monster_drop', rarity: 2, basePrice: 240 },
  linen_cloth: { id: 'linen_cloth', name: 'Linen Cloth', source: 'monster_drop', rarity: 1, basePrice: 120 },
  enchanted_thread: { id: 'enchanted_thread', name: 'Enchanted Thread', source: 'crafted', rarity: 3, basePrice: 650 },
  catalyst: { id: 'catalyst', name: 'Catalyst', source: 'npc', rarity: 3, basePrice: 900 },
  monster_crystal: { id: 'monster_crystal', name: 'Monster Crystal', source: 'monster_drop', rarity: 4, basePrice: 1200 }
};

const sampleRecipes = [
  { id: 'iron_plate', profession: 'smithing', professionName: 'Smithing', outputType: 'Material', name: 'Iron Plate', level: 1, exp: 20, meso: 30, resale: 80, ingredients: [{ id: 'iron_ore', name: 'Iron Ore', qty: 2 }, { id: 'coal', name: 'Coal', qty: 1 }] },
  { id: 'bronze_plate', profession: 'smithing', professionName: 'Smithing', outputType: 'Material', name: 'Bronze Plate', level: 2, exp: 28, meso: 35, resale: 90, ingredients: [{ id: 'bronze_ore', name: 'Bronze Ore', qty: 3 }, { id: 'coal', name: 'Coal', qty: 1 }] },
  { id: 'steel_plate', profession: 'smithing', professionName: 'Smithing', outputType: 'Material', name: 'Steel Plate', level: 4, exp: 50, meso: 70, resale: 160, ingredients: [{ id: 'steel_ore', name: 'Steel Ore', qty: 3 }, { id: 'coal', name: 'Coal', qty: 2 }, { id: 'screw', name: 'Screw', qty: 1 }] },
  { id: 'mithril_plate', profession: 'smithing', professionName: 'Smithing', outputType: 'Material', name: 'Mithril Plate', level: 6, exp: 82, meso: 120, resale: 280, ingredients: [{ id: 'mithril_ore', name: 'Mithril Ore', qty: 3 }, { id: 'coal', name: 'Coal', qty: 2 }, { id: 'screw', name: 'Screw', qty: 1 }] },
  { id: 'adamantium_frame', profession: 'smithing', professionName: 'Smithing', outputType: 'Material', name: 'Adamantium Frame', level: 8, exp: 120, meso: 220, resale: 480, ingredients: [{ id: 'adamantium_ore', name: 'Adamantium Ore', qty: 3 }, { id: 'dark_crystal', name: 'Dark Crystal', qty: 1 }, { id: 'screw', name: 'Screw', qty: 2 }] },
  { id: 'training_sword', profession: 'weaponcrafting', professionName: 'Weaponcrafting', outputType: 'Equipment', name: 'Training Sword', level: 1, exp: 22, meso: 25, resale: 95, ingredients: [{ id: 'iron_ore', name: 'Iron Ore', qty: 2 }, { id: 'processed_wood', name: 'Processed Wood', qty: 1 }] },
  { id: 'bronze_spear', profession: 'weaponcrafting', professionName: 'Weaponcrafting', outputType: 'Equipment', name: 'Bronze Spear', level: 2, exp: 32, meso: 45, resale: 120, ingredients: [{ id: 'bronze_ore', name: 'Bronze Ore', qty: 3 }, { id: 'processed_wood', name: 'Processed Wood', qty: 2 }] },
  { id: 'steel_blade', profession: 'weaponcrafting', professionName: 'Weaponcrafting', outputType: 'Equipment', name: 'Steel Blade', level: 4, exp: 58, meso: 80, resale: 210, ingredients: [{ id: 'steel_ore', name: 'Steel Ore', qty: 4 }, { id: 'screw', name: 'Screw', qty: 1 }, { id: 'leather', name: 'Leather', qty: 1 }] },
  { id: 'mithril_halberd', profession: 'weaponcrafting', professionName: 'Weaponcrafting', outputType: 'Equipment', name: 'Mithril Halberd', level: 6, exp: 95, meso: 140, resale: 360, ingredients: [{ id: 'mithril_ore', name: 'Mithril Ore', qty: 4 }, { id: 'processed_wood', name: 'Processed Wood', qty: 3 }, { id: 'monster_crystal', name: 'Monster Crystal', qty: 1 }] },
  { id: 'dark_edge', profession: 'weaponcrafting', professionName: 'Weaponcrafting', outputType: 'Equipment', name: 'Dark Edge', level: 8, exp: 145, meso: 260, resale: 650, ingredients: [{ id: 'adamantium_ore', name: 'Adamantium Ore', qty: 4 }, { id: 'dark_crystal', name: 'Dark Crystal', qty: 2 }, { id: 'monster_crystal', name: 'Monster Crystal', qty: 1 }] },
  { id: 'linen_patch', profession: 'tailoring', professionName: 'Tailoring', outputType: 'Material', name: 'Linen Patch', level: 1, exp: 18, meso: 20, resale: 70, ingredients: [{ id: 'linen_cloth', name: 'Linen Cloth', qty: 3 }] },
  { id: 'silk_wrap', profession: 'tailoring', professionName: 'Tailoring', outputType: 'Material', name: 'Silk Wrap', level: 3, exp: 38, meso: 50, resale: 130, ingredients: [{ id: 'silk_thread', name: 'Silk Thread', qty: 3 }, { id: 'linen_cloth', name: 'Linen Cloth', qty: 2 }] },
  { id: 'enchanted_lining', profession: 'tailoring', professionName: 'Tailoring', outputType: 'Material', name: 'Enchanted Lining', level: 5, exp: 70, meso: 95, resale: 240, ingredients: [{ id: 'enchanted_thread', name: 'Enchanted Thread', qty: 2 }, { id: 'magic_powder', name: 'Magic Powder', qty: 1 }] },
  { id: 'mystic_robe_base', profession: 'tailoring', professionName: 'Tailoring', outputType: 'Equipment', name: 'Mystic Robe Base', level: 7, exp: 110, meso: 160, resale: 420, ingredients: [{ id: 'silk_thread', name: 'Silk Thread', qty: 5 }, { id: 'crystal_shard', name: 'Crystal Shard', qty: 1 }, { id: 'enchanted_thread', name: 'Enchanted Thread', qty: 2 }] },
  { id: 'darkweave_panel', profession: 'tailoring', professionName: 'Tailoring', outputType: 'Material', name: 'Darkweave Panel', level: 8, exp: 142, meso: 260, resale: 620, ingredients: [{ id: 'dark_crystal', name: 'Dark Crystal', qty: 1 }, { id: 'enchanted_thread', name: 'Enchanted Thread', qty: 4 }, { id: 'monster_crystal', name: 'Monster Crystal', qty: 1 }] },
  { id: 'wooden_handle', profession: 'woodcrafting', professionName: 'Woodcrafting', outputType: 'Material', name: 'Wooden Handle', level: 1, exp: 19, meso: 15, resale: 65, ingredients: [{ id: 'branch', name: 'Branch', qty: 4 }] },
  { id: 'processed_wood_recipe', profession: 'woodcrafting', professionName: 'Woodcrafting', outputType: 'Material', name: 'Processed Wood', level: 2, exp: 30, meso: 30, resale: 120, ingredients: [{ id: 'firewood', name: 'Firewood', qty: 4 }, { id: 'branch', name: 'Branch', qty: 2 }] },
  { id: 'bow_frame', profession: 'woodcrafting', professionName: 'Woodcrafting', outputType: 'Equipment', name: 'Bow Frame', level: 4, exp: 55, meso: 65, resale: 190, ingredients: [{ id: 'processed_wood', name: 'Processed Wood', qty: 3 }, { id: 'stiff_feather', name: 'Stiff Feather', qty: 2 }, { id: 'screw', name: 'Screw', qty: 1 }] },
  { id: 'staff_core', profession: 'woodcrafting', professionName: 'Woodcrafting', outputType: 'Equipment', name: 'Staff Core', level: 6, exp: 88, meso: 130, resale: 330, ingredients: [{ id: 'processed_wood', name: 'Processed Wood', qty: 4 }, { id: 'magic_powder', name: 'Magic Powder', qty: 2 }, { id: 'crystal_shard', name: 'Crystal Shard', qty: 1 }] },
  { id: 'ancient_bow_limb', profession: 'woodcrafting', professionName: 'Woodcrafting', outputType: 'Equipment', name: 'Ancient Bow Limb', level: 8, exp: 132, meso: 230, resale: 540, ingredients: [{ id: 'processed_wood', name: 'Processed Wood', qty: 6 }, { id: 'dark_crystal', name: 'Dark Crystal', qty: 1 }, { id: 'monster_crystal', name: 'Monster Crystal', qty: 1 }] },
  { id: 'basic_leather', profession: 'leatherworking', professionName: 'Leatherworking', outputType: 'Material', name: 'Basic Leather', level: 1, exp: 18, meso: 20, resale: 75, ingredients: [{ id: 'animal_skin', name: 'Animal Skin', qty: 3 }] },
  { id: 'sturdy_leather', profession: 'leatherworking', professionName: 'Leatherworking', outputType: 'Material', name: 'Sturdy Leather', level: 3, exp: 42, meso: 55, resale: 145, ingredients: [{ id: 'leather', name: 'Leather', qty: 2 }, { id: 'animal_skin', name: 'Animal Skin', qty: 2 }] },
  { id: 'glove_padding', profession: 'leatherworking', professionName: 'Leatherworking', outputType: 'Equipment', name: 'Glove Padding', level: 5, exp: 72, meso: 100, resale: 250, ingredients: [{ id: 'leather', name: 'Leather', qty: 3 }, { id: 'stiff_feather', name: 'Stiff Feather', qty: 3 }, { id: 'screw', name: 'Screw', qty: 1 }] },
  { id: 'shadow_strap', profession: 'leatherworking', professionName: 'Leatherworking', outputType: 'Equipment', name: 'Shadow Strap', level: 7, exp: 105, meso: 150, resale: 390, ingredients: [{ id: 'leather', name: 'Leather', qty: 5 }, { id: 'crystal_shard', name: 'Crystal Shard', qty: 1 }, { id: 'magic_powder', name: 'Magic Powder', qty: 1 }] },
  { id: 'dark_leather_core', profession: 'leatherworking', professionName: 'Leatherworking', outputType: 'Equipment', name: 'Dark Leather Core', level: 8, exp: 138, meso: 240, resale: 600, ingredients: [{ id: 'leather', name: 'Leather', qty: 6 }, { id: 'dark_crystal', name: 'Dark Crystal', qty: 1 }, { id: 'monster_crystal', name: 'Monster Crystal', qty: 1 }] },
  { id: 'minor_catalyst', profession: 'arcforge', professionName: 'Arcforge', outputType: 'Material', name: 'Minor Catalyst', level: 1, exp: 24, meso: 90, resale: 100, ingredients: [{ id: 'magic_powder', name: 'Magic Powder', qty: 1 }, { id: 'coal', name: 'Coal', qty: 1 }] },
  { id: 'crystal_focus', profession: 'arcforge', professionName: 'Arcforge', outputType: 'Material', name: 'Crystal Focus', level: 3, exp: 48, meso: 130, resale: 180, ingredients: [{ id: 'crystal_shard', name: 'Crystal Shard', qty: 1 }, { id: 'magic_powder', name: 'Magic Powder', qty: 1 }, { id: 'catalyst', name: 'Catalyst', qty: 1 }] },
  { id: 'monster_crystal_refine', profession: 'arcforge', professionName: 'Arcforge', outputType: 'Material', name: 'Monster Crystal Refine', level: 5, exp: 76, meso: 180, resale: 300, ingredients: [{ id: 'monster_crystal', name: 'Monster Crystal', qty: 1 }, { id: 'catalyst', name: 'Catalyst', qty: 1 }, { id: 'magic_powder', name: 'Magic Powder', qty: 2 }] },
  { id: 'dark_catalyst', profession: 'arcforge', professionName: 'Arcforge', outputType: 'Material', name: 'Dark Catalyst', level: 7, exp: 118, meso: 270, resale: 480, ingredients: [{ id: 'dark_crystal', name: 'Dark Crystal', qty: 1 }, { id: 'monster_crystal', name: 'Monster Crystal', qty: 1 }, { id: 'catalyst', name: 'Catalyst', qty: 2 }] },
  { id: 'arcane_core', profession: 'arcforge', professionName: 'Arcforge', outputType: 'Material', name: 'Arcane Core', level: 8, exp: 160, meso: 420, resale: 750, ingredients: [{ id: 'dark_crystal', name: 'Dark Crystal', qty: 2 }, { id: 'monster_crystal', name: 'Monster Crystal', qty: 2 }, { id: 'catalyst', name: 'Catalyst', qty: 3 }] }
];

function slugify(value) {
  return String(value || 'unknown')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'unknown';
}

function inferSource(name) {
  const lower = String(name).toLowerCase();
  if (lower.includes('screw') || lower.includes('ingot') || lower.includes('processed') || lower.includes('plate')) return 'crafted';
  if (lower.includes('catalyst')) return 'npc';
  return 'unknown';
}

function inferRarity(name) {
  const lower = String(name).toLowerCase();
  if (lower.includes('black') || lower.includes('dark') || lower.includes('crystal')) return 5;
  if (lower.includes('adamantium') || lower.includes('orihalcon')) return 4;
  if (lower.includes('mithril') || lower.includes('gold')) return 3;
  if (lower.includes('steel') || lower.includes('silver')) return 2;
  return 1;
}

function estimateBasePrice(name, rarity) {
  const lower = String(name).toLowerCase();
  let base = 100 + rarity * 120;
  if (lower.includes('screw')) base = 250;
  if (lower.includes('ingot')) base = 180 + rarity * 180;
  if (lower.includes('crystal')) base = 600 + rarity * 220;
  if (lower.includes('processed')) base = 220 + rarity * 120;
  return base;
}

function createItemRecord(name) {
  const id = slugify(name);
  const rarity = inferRarity(name);
  return {
    id,
    name,
    source: inferSource(name),
    rarity,
    basePrice: estimateBasePrice(name, rarity)
  };
}

function flattenCraftingData(rawCrafting) {
  const items = {};
  const recipes = [];
  const professions = [];

  (rawCrafting?.disciplines || []).forEach((discipline) => {
    const professionId = slugify(discipline.discipline);
    professions.push({
      id: professionId,
      name: discipline.discipline,
      description: `Imported from dashboard skill ${discipline.skill_id ?? 'unknown'}.`
    });

    (discipline.output_types || []).forEach((outputType) => {
      (outputType.levels || []).forEach((levelGroup) => {
        (levelGroup.recipes || []).forEach((recipe) => {
          const resultId = recipe.output_id != null ? `item_${recipe.output_id}` : slugify(recipe.result_item_name);
          if (recipe.result_item_name && !items[resultId]) {
            items[resultId] = {
              ...createItemRecord(recipe.result_item_name),
              id: resultId,
              outputId: recipe.output_id,
              source: 'crafted'
            };
          }

          const ingredients = (recipe.ingredients || []).map((ingredient) => {
            const item = createItemRecord(ingredient.item_name);
            if (!items[item.id]) items[item.id] = item;
            return {
              id: item.id,
              name: ingredient.item_name,
              qty: Number(ingredient.count || 0)
            };
          });

          recipes.push({
            id: `${professionId}_${recipe.id}_${resultId}`,
            sourceRecipeId: recipe.id,
            outputId: recipe.output_id,
            profession: professionId,
            professionName: discipline.discipline,
            outputType: outputType.output_type,
            name: recipe.result_item_name,
            level: Number(recipe.req_level ?? levelGroup.level ?? 1),
            exp: Number(recipe.craft_exp ?? 0),
            meso: Number(recipe.meso_cost ?? 0),
            resale: 0,
            resultCount: Number(recipe.result_count ?? 1),
            ingredients
          });
        });
      });
    });
  });

  return { professions, recipes, items };
}

function countNestedRecipes(rawCrafting) {
  return (rawCrafting?.disciplines || []).reduce((disciplineSum, discipline) => (
    disciplineSum + (discipline.output_types || []).reduce((typeSum, outputType) => (
      typeSum + (outputType.levels || []).reduce((levelSum, level) => levelSum + (level.recipes || []).length, 0)
    ), 0)
  ), 0);
}

function createSampleData() {
  return {
    professions: sampleProfessions,
    recipes: sampleRecipes,
    items: sampleItems,
    source: 'sample',
    expectedRecipes: EXPECTED_DASHBOARD_RECIPES,
    loadedRecipes: sampleRecipes.length,
    rawRecipes: sampleRecipes.length,
    error: null
  };
}

async function loadCraftingDataset() {
  const [craftingResponse, overviewResponse] = await Promise.all([
    fetch(CRAFTING_DATA_URL),
    fetch(OVERVIEW_DATA_URL)
  ]);
  if (!craftingResponse.ok) throw new Error(`Crafting data request failed: ${craftingResponse.status}`);
  if (!overviewResponse.ok) throw new Error(`Overview data request failed: ${overviewResponse.status}`);

  const [rawCrafting, overview] = await Promise.all([craftingResponse.json(), overviewResponse.json()]);
  const flattened = flattenCraftingData(rawCrafting);
  const rawCount = countNestedRecipes(rawCrafting);
  const expectedRecipes = Number(overview?.stats?.recipes ?? EXPECTED_DASHBOARD_RECIPES);

  return {
    ...flattened,
    source: 'ohmi69 dashboard current',
    expectedRecipes,
    loadedRecipes: flattened.recipes.length,
    rawRecipes: rawCount,
    error: null
  };
}

function itemCost(itemId, mode, items) {
  const item = items[itemId];
  if (!item) return 999999;
  const sourcePenalty = {
    cheapest: { monster_drop: 1, crafted: 1.1, npc: 1, unknown: 1.4 },
    fastest: { monster_drop: 1.15, crafted: 1.05, npc: 0.95, unknown: 1.5 },
    farm: { monster_drop: 0.55, crafted: 0.75, npc: 4, unknown: 3 },
    balanced: { monster_drop: 0.9, crafted: 1, npc: 1.35, unknown: 1.8 }
  }[mode];
  return item.basePrice * (sourcePenalty[item.source] || 1.5) * (1 + item.rarity * 0.08);
}

function recipeCost(recipe, mode, items) {
  const materialCost = recipe.ingredients.reduce((sum, ing) => sum + itemCost(ing.id, mode, items) * ing.qty, 0);
  const rarityPenalty = recipe.ingredients.reduce((sum, ing) => sum + (items[ing.id]?.rarity || 1) * ing.qty * (mode === 'farm' ? 30 : 12), 0);
  const resaleCredit = mode === 'cheapest' || mode === 'balanced' ? (recipe.resale || 0) * 0.6 : (recipe.resale || 0) * 0.25;
  return Math.max(1, recipe.meso + materialCost + rarityPenalty - resaleCredit);
}

function rankRecipe(recipe, mode, items) {
  const cost = recipeCost(recipe, mode, items);
  if (mode === 'fastest') return recipe.exp * 1000 - cost * 0.15;
  if (mode === 'farm') return recipe.exp / cost - recipe.ingredients.filter((ing) => items[ing.id]?.source === 'npc').length * 0.02;
  return recipe.exp / cost;
}

function aggregateMaterials(target, ingredients, times = 1) {
  ingredients.forEach((ing) => {
    if (!target[ing.id]) target[ing.id] = { name: ing.name, qty: 0 };
    target[ing.id].qty += ing.qty * times;
  });
}

function simulateLeveling(recipes, items, professionId, mode, startLevel, targetLevel) {
  let level = Number(startLevel);
  const goal = Number(targetLevel);
  const steps = [];
  const totalMaterials = {};
  let totalCost = 0;
  let totalCrafts = 0;

  while (level < goal) {
    const expNeeded = expTable.find((row) => row.level === level)?.nextExp || 1000;
    const unlocked = recipes.filter((r) => r.profession === professionId && r.level <= level && r.exp > 0);
    if (!unlocked.length) break;
    const best = [...unlocked].sort((a, b) => rankRecipe(b, mode, items) - rankRecipe(a, mode, items))[0];
    const crafts = Math.ceil(expNeeded / best.exp);
    const costEach = recipeCost(best, mode, items);
    const stepCost = Math.round(costEach * crafts);
    aggregateMaterials(totalMaterials, best.ingredients, crafts);
    totalCost += stepCost;
    totalCrafts += crafts;
    steps.push({ from: level, to: level + 1, recipe: best, crafts, costEach: Math.round(costEach), stepCost });
    level += 1;
  }

  return { steps, totalMaterials, totalCost, totalCrafts };
}

function materialRanking(recipes, items) {
  const stats = {};
  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((ing) => {
      if (!stats[ing.id]) stats[ing.id] = { itemId: ing.id, name: ing.name, totalQty: 0, recipes: new Set(), professions: new Set(), highLevelUse: 0 };
      stats[ing.id].totalQty += ing.qty;
      stats[ing.id].recipes.add(recipe.id);
      stats[ing.id].professions.add(recipe.profession);
      stats[ing.id].highLevelUse += ing.qty * recipe.level;
    });
  });
  return Object.values(stats)
    .map((row) => {
      const item = items[row.itemId] || createItemRecord(row.name);
      const score = row.totalQty * 2 + row.recipes.size * 8 + row.professions.size * 12 + row.highLevelUse + item.rarity * 10;
      return { ...row, item, score: Math.round(score), recipeCount: row.recipes.size, professionCount: row.professions.size };
    })
    .sort((a, b) => b.score - a.score);
}

function formatMeso(value) {
  return `${Math.round(value).toLocaleString()} meso`;
}

function Pill({ children }) {
  return <span className="pill">{children}</span>;
}

function AuditBadge({ data, loading }) {
  if (loading) return <span className="audit-badge warning"><Database size={16} /> Loading real dataset...</span>;
  const ok = data.loadedRecipes === data.expectedRecipes && data.rawRecipes === data.expectedRecipes;
  return (
    <span className={`audit-badge ${ok ? 'ok' : 'warning'}`}>
      {ok ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
      {ok ? 'Data count matched' : 'Data count discrepancy'}
    </span>
  );
}

function App() {
  const [dataset, setDataset] = useState(createSampleData);
  const [loadingData, setLoadingData] = useState(true);
  const [profession, setProfession] = useState('smithing');
  const [mode, setMode] = useState('cheapest');
  const [startLevel, setStartLevel] = useState(1);
  const [targetLevel, setTargetLevel] = useState(10);

  useEffect(() => {
    let active = true;
    loadCraftingDataset()
      .then((loaded) => {
        if (!active) return;
        setDataset(loaded);
        setProfession(loaded.professions[0]?.id || 'smithing');
      })
      .catch((error) => {
        if (!active) return;
        setDataset({ ...createSampleData(), error: error.message });
      })
      .finally(() => {
        if (active) setLoadingData(false);
      });
    return () => { active = false; };
  }, []);

  const { professions, recipes, items } = dataset;
  const selectedProfession = professions.find((p) => p.id === profession) || professions[0];
  const filteredRecipes = recipes.filter((r) => r.profession === selectedProfession?.id);
  const sim = useMemo(() => simulateLeveling(recipes, items, selectedProfession?.id, mode, startLevel, targetLevel), [recipes, items, selectedProfession, mode, startLevel, targetLevel]);
  const rankedMaterials = useMemo(() => materialRanking(recipes, items), [recipes, items]);

  return (
    <main className="app-shell">
      <section className="hero card">
        <div>
          <p className="eyebrow"><Sparkles size={16} /> MSCW Crafting Lab</p>
          <h1>Profession Leveling Optimizer</h1>
          <p className="hero-copy">Simulator for comparing cheap, fast, farm-friendly, and balanced crafting routes. It now attempts to load the dashboard's real current crafting dataset, then falls back to sample data if unavailable.</p>
          <div className="audit-row">
            <AuditBadge data={dataset} loading={loadingData} />
            <span>Source: {dataset.source}</span>
            {dataset.error && <span className="error-text">Fallback reason: {dataset.error}</span>}
          </div>
        </div>
        <div className="hero-stats">
          <div><strong>{professions.length}</strong><span>Professions</span></div>
          <div><strong>{recipes.length}</strong><span>Loaded Recipes</span></div>
          <div><strong>{Object.keys(items).length}</strong><span>Known Items</span></div>
        </div>
      </section>

      <section className="card data-audit-card">
        <h2><Database size={20} /> Data Audit</h2>
        <div className="audit-grid">
          <div><span>Dashboard expected</span><strong>{dataset.expectedRecipes}</strong></div>
          <div><span>Raw nested count</span><strong>{dataset.rawRecipes}</strong></div>
          <div><span>Flattened optimizer count</span><strong>{dataset.loadedRecipes}</strong></div>
          <div><span>Prototype fallback count</span><strong>{sampleRecipes.length}</strong></div>
        </div>
        <p className="audit-note">The dashboard stores recipes as discipline → output type → level → recipes. The optimizer flattens that nested structure into one recipe list for simulation.</p>
      </section>

      <section className="layout">
        <aside className="controls card">
          <h2><Hammer size={20} /> Simulator Settings</h2>
          <label>Profession</label>
          <select value={selectedProfession?.id || ''} onChange={(e) => setProfession(e.target.value)}>
            {professions.map((p) => <option value={p.id} key={p.id}>{p.name}</option>)}
          </select>

          <label>Optimization Mode</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="cheapest">Cheapest Meso Path</option>
            <option value="fastest">Fastest EXP Path</option>
            <option value="farm">Farm-Friendly / Low Meso</option>
            <option value="balanced">Balanced Path</option>
          </select>

          <div className="level-row">
            <div>
              <label>Start Lv.</label>
              <input type="number" min="1" max="9" value={startLevel} onChange={(e) => setStartLevel(Math.max(1, Math.min(9, Number(e.target.value))))} />
            </div>
            <div>
              <label>Target Lv.</label>
              <input type="number" min="2" max="10" value={targetLevel} onChange={(e) => setTargetLevel(Math.max(2, Math.min(maxProfessionLevel, Number(e.target.value))))} />
            </div>
          </div>

          <div className="note-box">
            <strong>{selectedProfession?.name}</strong>
            <p>{selectedProfession?.description}</p>
            <p>{filteredRecipes.length} recipes in this profession.</p>
          </div>
        </aside>

        <section className="results">
          <div className="summary-grid">
            <div className="card metric"><Coins /><span>Total Est. Cost</span><strong>{formatMeso(sim.totalCost)}</strong></div>
            <div className="card metric"><Route /><span>Total Crafts</span><strong>{sim.totalCrafts}</strong></div>
            <div className="card metric"><Wheat /><span>Unique Materials</span><strong>{Object.keys(sim.totalMaterials).length}</strong></div>
          </div>

          <div className="card">
            <h2><Route size={20} /> Recommended Leveling Route</h2>
            {sim.steps.length === 0 ? (
              <p className="empty-state">No unlocked recipe with EXP was found for this level range.</p>
            ) : (
              <div className="steps">
                {sim.steps.map((step) => (
                  <div className="step" key={`${step.from}-${step.recipe.id}`}>
                    <div className="step-level">Lv. {step.from} → {step.to}</div>
                    <div className="step-main">
                      <strong>{step.recipe.name} × {step.crafts}</strong>
                      <p>{formatMeso(step.stepCost)} total · {step.recipe.exp} EXP each · {formatMeso(step.costEach)} each · {step.recipe.outputType}</p>
                      <div className="ingredients">
                        {step.recipe.ingredients.map((ing) => <Pill key={ing.id}>{ing.name} × {ing.qty * step.crafts}</Pill>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="two-col">
            <div className="card">
              <h2><Search size={20} /> Total Shopping / Farming List</h2>
              <table>
                <thead><tr><th>Material</th><th>Qty</th><th>Source</th><th>Rarity</th></tr></thead>
                <tbody>
                  {Object.entries(sim.totalMaterials).sort((a, b) => b[1].qty - a[1].qty).map(([id, row]) => (
                    <tr key={id}><td>{row.name}</td><td>{row.qty}</td><td>{items[id]?.source?.replace('_', ' ') || 'unknown'}</td><td>{items[id]?.rarity || '-'}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card">
              <h2><Network size={20} /> Most Valuable Materials</h2>
              <table>
                <thead><tr><th>Material</th><th>Score</th><th>Recipes</th><th>Prof.</th></tr></thead>
                <tbody>
                  {rankedMaterials.slice(0, 10).map((row) => (
                    <tr key={row.itemId}><td>{row.item.name}</td><td>{row.score}</td><td>{row.recipeCount}</td><td>{row.professionCount}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h2><Hammer size={20} /> Recipe Explorer</h2>
            <div className="recipe-grid">
              {filteredRecipes.map((r) => (
                <div className="recipe-card" key={r.id}>
                  <strong>{r.name}</strong>
                  <p>Lv. {r.level}+ · {r.exp} EXP · fee {formatMeso(r.meso)} · {r.outputType}</p>
                  <div className="ingredients">{r.ingredients.map((ing) => <Pill key={ing.id}>{ing.name} × {ing.qty}</Pill>)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
