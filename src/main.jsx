import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Hammer, Route, Coins, Wheat, Network, Search, Sparkles } from 'lucide-react';
import './styles.css';

const professions = [
  { id: 'smithing', name: 'Smithing', description: 'Metal plates, weapon bases, and heavy gear materials.' },
  { id: 'weaponcrafting', name: 'Weaponcrafting', description: 'Physical weapons and high-value attack progression.' },
  { id: 'tailoring', name: 'Tailoring', description: 'Cloth armor, robes, and magic-user progression.' },
  { id: 'woodcrafting', name: 'Woodcrafting', description: 'Bows, crossbows, staffs, handles, and wooden parts.' },
  { id: 'leatherworking', name: 'Leatherworking', description: 'Leather gear, thief/archer pieces, and flexible materials.' },
  { id: 'arcforge', name: 'Arcforge', description: 'Magic catalysts, refined crystals, and late-game enhancement parts.' }
];

const maxProfessionLevel = 10;

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

const items = {
  iron_ore: { name: 'Iron Ore', source: 'monster_drop', rarity: 1, basePrice: 120 },
  bronze_ore: { name: 'Bronze Ore', source: 'monster_drop', rarity: 1, basePrice: 90 },
  steel_ore: { name: 'Steel Ore', source: 'monster_drop', rarity: 2, basePrice: 210 },
  mithril_ore: { name: 'Mithril Ore', source: 'monster_drop', rarity: 3, basePrice: 450 },
  adamantium_ore: { name: 'Adamantium Ore', source: 'monster_drop', rarity: 4, basePrice: 850 },
  coal: { name: 'Coal', source: 'npc', rarity: 1, basePrice: 80 },
  screw: { name: 'Screw', source: 'crafted', rarity: 2, basePrice: 250 },
  stiff_feather: { name: 'Stiff Feather', source: 'monster_drop', rarity: 1, basePrice: 70 },
  animal_skin: { name: 'Animal Skin', source: 'monster_drop', rarity: 1, basePrice: 100 },
  leather: { name: 'Leather', source: 'crafted', rarity: 2, basePrice: 300 },
  processed_wood: { name: 'Processed Wood', source: 'crafted', rarity: 1, basePrice: 180 },
  firewood: { name: 'Firewood', source: 'monster_drop', rarity: 1, basePrice: 60 },
  branch: { name: 'Branch', source: 'monster_drop', rarity: 1, basePrice: 45 },
  magic_powder: { name: 'Magic Powder', source: 'monster_drop', rarity: 3, basePrice: 600 },
  crystal_shard: { name: 'Crystal Shard', source: 'monster_drop', rarity: 3, basePrice: 700 },
  dark_crystal: { name: 'Dark Crystal', source: 'monster_drop', rarity: 5, basePrice: 1500 },
  silk_thread: { name: 'Silk Thread', source: 'monster_drop', rarity: 2, basePrice: 240 },
  linen_cloth: { name: 'Linen Cloth', source: 'monster_drop', rarity: 1, basePrice: 120 },
  enchanted_thread: { name: 'Enchanted Thread', source: 'crafted', rarity: 3, basePrice: 650 },
  catalyst: { name: 'Catalyst', source: 'npc', rarity: 3, basePrice: 900 },
  monster_crystal: { name: 'Monster Crystal', source: 'monster_drop', rarity: 4, basePrice: 1200 }
};

const recipes = [
  // Smithing
  { id: 'iron_plate', profession: 'smithing', name: 'Iron Plate', level: 1, exp: 20, meso: 30, resale: 80, ingredients: [{ id: 'iron_ore', qty: 2 }, { id: 'coal', qty: 1 }] },
  { id: 'bronze_plate', profession: 'smithing', name: 'Bronze Plate', level: 2, exp: 28, meso: 35, resale: 90, ingredients: [{ id: 'bronze_ore', qty: 3 }, { id: 'coal', qty: 1 }] },
  { id: 'steel_plate', profession: 'smithing', name: 'Steel Plate', level: 4, exp: 50, meso: 70, resale: 160, ingredients: [{ id: 'steel_ore', qty: 3 }, { id: 'coal', qty: 2 }, { id: 'screw', qty: 1 }] },
  { id: 'mithril_plate', profession: 'smithing', name: 'Mithril Plate', level: 6, exp: 82, meso: 120, resale: 280, ingredients: [{ id: 'mithril_ore', qty: 3 }, { id: 'coal', qty: 2 }, { id: 'screw', qty: 1 }] },
  { id: 'adamantium_frame', profession: 'smithing', name: 'Adamantium Frame', level: 8, exp: 120, meso: 220, resale: 480, ingredients: [{ id: 'adamantium_ore', qty: 3 }, { id: 'dark_crystal', qty: 1 }, { id: 'screw', qty: 2 }] },

  // Weaponcrafting
  { id: 'training_sword', profession: 'weaponcrafting', name: 'Training Sword', level: 1, exp: 22, meso: 25, resale: 95, ingredients: [{ id: 'iron_ore', qty: 2 }, { id: 'processed_wood', qty: 1 }] },
  { id: 'bronze_spear', profession: 'weaponcrafting', name: 'Bronze Spear', level: 2, exp: 32, meso: 45, resale: 120, ingredients: [{ id: 'bronze_ore', qty: 3 }, { id: 'processed_wood', qty: 2 }] },
  { id: 'steel_blade', profession: 'weaponcrafting', name: 'Steel Blade', level: 4, exp: 58, meso: 80, resale: 210, ingredients: [{ id: 'steel_ore', qty: 4 }, { id: 'screw', qty: 1 }, { id: 'leather', qty: 1 }] },
  { id: 'mithril_halberd', profession: 'weaponcrafting', name: 'Mithril Halberd', level: 6, exp: 95, meso: 140, resale: 360, ingredients: [{ id: 'mithril_ore', qty: 4 }, { id: 'processed_wood', qty: 3 }, { id: 'monster_crystal', qty: 1 }] },
  { id: 'dark_edge', profession: 'weaponcrafting', name: 'Dark Edge', level: 8, exp: 145, meso: 260, resale: 650, ingredients: [{ id: 'adamantium_ore', qty: 4 }, { id: 'dark_crystal', qty: 2 }, { id: 'monster_crystal', qty: 1 }] },

  // Tailoring
  { id: 'linen_patch', profession: 'tailoring', name: 'Linen Patch', level: 1, exp: 18, meso: 20, resale: 70, ingredients: [{ id: 'linen_cloth', qty: 3 }] },
  { id: 'silk_wrap', profession: 'tailoring', name: 'Silk Wrap', level: 3, exp: 38, meso: 50, resale: 130, ingredients: [{ id: 'silk_thread', qty: 3 }, { id: 'linen_cloth', qty: 2 }] },
  { id: 'enchanted_lining', profession: 'tailoring', name: 'Enchanted Lining', level: 5, exp: 70, meso: 95, resale: 240, ingredients: [{ id: 'enchanted_thread', qty: 2 }, { id: 'magic_powder', qty: 1 }] },
  { id: 'mystic_robe_base', profession: 'tailoring', name: 'Mystic Robe Base', level: 7, exp: 110, meso: 160, resale: 420, ingredients: [{ id: 'silk_thread', qty: 5 }, { id: 'crystal_shard', qty: 1 }, { id: 'enchanted_thread', qty: 2 }] },
  { id: 'darkweave_panel', profession: 'tailoring', name: 'Darkweave Panel', level: 8, exp: 142, meso: 260, resale: 620, ingredients: [{ id: 'dark_crystal', qty: 1 }, { id: 'enchanted_thread', qty: 4 }, { id: 'monster_crystal', qty: 1 }] },

  // Woodcrafting
  { id: 'wooden_handle', profession: 'woodcrafting', name: 'Wooden Handle', level: 1, exp: 19, meso: 15, resale: 65, ingredients: [{ id: 'branch', qty: 4 }] },
  { id: 'processed_wood_recipe', profession: 'woodcrafting', name: 'Processed Wood', level: 2, exp: 30, meso: 30, resale: 120, ingredients: [{ id: 'firewood', qty: 4 }, { id: 'branch', qty: 2 }] },
  { id: 'bow_frame', profession: 'woodcrafting', name: 'Bow Frame', level: 4, exp: 55, meso: 65, resale: 190, ingredients: [{ id: 'processed_wood', qty: 3 }, { id: 'stiff_feather', qty: 2 }, { id: 'screw', qty: 1 }] },
  { id: 'staff_core', profession: 'woodcrafting', name: 'Staff Core', level: 6, exp: 88, meso: 130, resale: 330, ingredients: [{ id: 'processed_wood', qty: 4 }, { id: 'magic_powder', qty: 2 }, { id: 'crystal_shard', qty: 1 }] },
  { id: 'ancient_bow_limb', profession: 'woodcrafting', name: 'Ancient Bow Limb', level: 8, exp: 132, meso: 230, resale: 540, ingredients: [{ id: 'processed_wood', qty: 6 }, { id: 'dark_crystal', qty: 1 }, { id: 'monster_crystal', qty: 1 }] },

  // Leatherworking
  { id: 'basic_leather', profession: 'leatherworking', name: 'Basic Leather', level: 1, exp: 18, meso: 20, resale: 75, ingredients: [{ id: 'animal_skin', qty: 3 }] },
  { id: 'sturdy_leather', profession: 'leatherworking', name: 'Sturdy Leather', level: 3, exp: 42, meso: 55, resale: 145, ingredients: [{ id: 'leather', qty: 2 }, { id: 'animal_skin', qty: 2 }] },
  { id: 'glove_padding', profession: 'leatherworking', name: 'Glove Padding', level: 5, exp: 72, meso: 100, resale: 250, ingredients: [{ id: 'leather', qty: 3 }, { id: 'stiff_feather', qty: 3 }, { id: 'screw', qty: 1 }] },
  { id: 'shadow_strap', profession: 'leatherworking', name: 'Shadow Strap', level: 7, exp: 105, meso: 150, resale: 390, ingredients: [{ id: 'leather', qty: 5 }, { id: 'crystal_shard', qty: 1 }, { id: 'magic_powder', qty: 1 }] },
  { id: 'dark_leather_core', profession: 'leatherworking', name: 'Dark Leather Core', level: 8, exp: 138, meso: 240, resale: 600, ingredients: [{ id: 'leather', qty: 6 }, { id: 'dark_crystal', qty: 1 }, { id: 'monster_crystal', qty: 1 }] },

  // Arcforge
  { id: 'minor_catalyst', profession: 'arcforge', name: 'Minor Catalyst', level: 1, exp: 24, meso: 90, resale: 100, ingredients: [{ id: 'magic_powder', qty: 1 }, { id: 'coal', qty: 1 }] },
  { id: 'crystal_focus', profession: 'arcforge', name: 'Crystal Focus', level: 3, exp: 48, meso: 130, resale: 180, ingredients: [{ id: 'crystal_shard', qty: 1 }, { id: 'magic_powder', qty: 1 }, { id: 'catalyst', qty: 1 }] },
  { id: 'monster_crystal_refine', profession: 'arcforge', name: 'Monster Crystal Refine', level: 5, exp: 76, meso: 180, resale: 300, ingredients: [{ id: 'monster_crystal', qty: 1 }, { id: 'catalyst', qty: 1 }, { id: 'magic_powder', qty: 2 }] },
  { id: 'dark_catalyst', profession: 'arcforge', name: 'Dark Catalyst', level: 7, exp: 118, meso: 270, resale: 480, ingredients: [{ id: 'dark_crystal', qty: 1 }, { id: 'monster_crystal', qty: 1 }, { id: 'catalyst', qty: 2 }] },
  { id: 'arcane_core', profession: 'arcforge', name: 'Arcane Core', level: 8, exp: 160, meso: 420, resale: 750, ingredients: [{ id: 'dark_crystal', qty: 2 }, { id: 'monster_crystal', qty: 2 }, { id: 'catalyst', qty: 3 }] }
];

function itemCost(itemId, mode) {
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

function recipeCost(recipe, mode) {
  const materialCost = recipe.ingredients.reduce((sum, ing) => sum + itemCost(ing.id, mode) * ing.qty, 0);
  const rarityPenalty = recipe.ingredients.reduce((sum, ing) => sum + (items[ing.id]?.rarity || 1) * ing.qty * (mode === 'farm' ? 30 : 12), 0);
  const resaleCredit = mode === 'cheapest' || mode === 'balanced' ? recipe.resale * 0.6 : recipe.resale * 0.25;
  return Math.max(1, recipe.meso + materialCost + rarityPenalty - resaleCredit);
}

function rankRecipe(recipe, mode) {
  const cost = recipeCost(recipe, mode);
  if (mode === 'fastest') return recipe.exp * 1000 - cost * 0.15;
  if (mode === 'farm') return recipe.exp / cost - recipe.ingredients.filter((ing) => items[ing.id]?.source === 'npc').length * 0.02;
  return recipe.exp / cost;
}

function aggregateMaterials(target, ingredients, times = 1) {
  ingredients.forEach((ing) => {
    target[ing.id] = (target[ing.id] || 0) + ing.qty * times;
  });
}

function simulateLeveling(professionId, mode, startLevel, targetLevel) {
  let level = Number(startLevel);
  const goal = Number(targetLevel);
  const steps = [];
  const totalMaterials = {};
  let totalCost = 0;
  let totalCrafts = 0;

  while (level < goal) {
    const expNeeded = expTable.find((row) => row.level === level)?.nextExp || 1000;
    const unlocked = recipes.filter((r) => r.profession === professionId && r.level <= level);
    if (!unlocked.length) break;
    const best = [...unlocked].sort((a, b) => rankRecipe(b, mode) - rankRecipe(a, mode))[0];
    const crafts = Math.ceil(expNeeded / best.exp);
    const costEach = recipeCost(best, mode);
    const stepCost = Math.round(costEach * crafts);
    aggregateMaterials(totalMaterials, best.ingredients, crafts);
    totalCost += stepCost;
    totalCrafts += crafts;
    steps.push({ from: level, to: level + 1, recipe: best, crafts, costEach: Math.round(costEach), stepCost });
    level += 1;
  }

  return { steps, totalMaterials, totalCost, totalCrafts };
}

function materialRanking() {
  const stats = {};
  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((ing) => {
      if (!stats[ing.id]) stats[ing.id] = { itemId: ing.id, totalQty: 0, recipes: new Set(), professions: new Set(), highLevelUse: 0 };
      stats[ing.id].totalQty += ing.qty;
      stats[ing.id].recipes.add(recipe.id);
      stats[ing.id].professions.add(recipe.profession);
      stats[ing.id].highLevelUse += ing.qty * recipe.level;
    });
  });
  return Object.values(stats)
    .map((row) => {
      const item = items[row.itemId];
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

function App() {
  const [profession, setProfession] = useState('smithing');
  const [mode, setMode] = useState('cheapest');
  const [startLevel, setStartLevel] = useState(1);
  const [targetLevel, setTargetLevel] = useState(10);
  const sim = useMemo(() => simulateLeveling(profession, mode, startLevel, targetLevel), [profession, mode, startLevel, targetLevel]);
  const rankedMaterials = useMemo(() => materialRanking(), []);
  const selectedProfession = professions.find((p) => p.id === profession);

  return (
    <main className="app-shell">
      <section className="hero card">
        <div>
          <p className="eyebrow"><Sparkles size={16} /> MSCW Crafting Lab</p>
          <h1>Profession Leveling Optimizer</h1>
          <p className="hero-copy">Prototype simulator for comparing cheap, fast, farm-friendly, and balanced crafting routes. Current data is sample-structured and ready to replace with real MSCW recipe data.</p>
        </div>
        <div className="hero-stats">
          <div><strong>{professions.length}</strong><span>Professions</span></div>
          <div><strong>{recipes.length}</strong><span>Recipes</span></div>
          <div><strong>{Object.keys(items).length}</strong><span>Materials</span></div>
        </div>
      </section>

      <section className="layout">
        <aside className="controls card">
          <h2><Hammer size={20} /> Simulator Settings</h2>
          <label>Profession</label>
          <select value={profession} onChange={(e) => setProfession(e.target.value)}>
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
            <strong>{selectedProfession.name}</strong>
            <p>{selectedProfession.description}</p>
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
            <div className="steps">
              {sim.steps.map((step) => (
                <div className="step" key={`${step.from}-${step.recipe.id}`}>
                  <div className="step-level">Lv. {step.from} → {step.to}</div>
                  <div className="step-main">
                    <strong>{step.recipe.name} × {step.crafts}</strong>
                    <p>{formatMeso(step.stepCost)} total · {step.recipe.exp} EXP each · {formatMeso(step.costEach)} each</p>
                    <div className="ingredients">
                      {step.recipe.ingredients.map((ing) => <Pill key={ing.id}>{items[ing.id].name} × {ing.qty * step.crafts}</Pill>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="two-col">
            <div className="card">
              <h2><Search size={20} /> Total Shopping / Farming List</h2>
              <table>
                <thead><tr><th>Material</th><th>Qty</th><th>Source</th><th>Rarity</th></tr></thead>
                <tbody>
                  {Object.entries(sim.totalMaterials).sort((a, b) => b[1] - a[1]).map(([id, qty]) => (
                    <tr key={id}><td>{items[id].name}</td><td>{qty}</td><td>{items[id].source.replace('_', ' ')}</td><td>{items[id].rarity}</td></tr>
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
              {recipes.filter((r) => r.profession === profession).map((r) => (
                <div className="recipe-card" key={r.id}>
                  <strong>{r.name}</strong>
                  <p>Lv. {r.level}+ · {r.exp} EXP · base fee {formatMeso(r.meso)}</p>
                  <div className="ingredients">{r.ingredients.map((ing) => <Pill key={ing.id}>{items[ing.id].name} × {ing.qty}</Pill>)}</div>
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
