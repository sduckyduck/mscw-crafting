import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Coins,
  Database,
  Hammer,
  PackageSearch,
  Route,
  Search,
  Sparkles,
  Wrench
} from 'lucide-react';
import './meow.css';
import './planner.css';

const CRAFTING_DATA_URL = 'https://ohmi69.github.io/osms_datamine_dashboard/data/current/crafting.json';
const OVERVIEW_DATA_URL = 'https://ohmi69.github.io/osms_datamine_dashboard/data/current/overview.json';
const EXPECTED_RECIPES = 342;

const MASTERY_TABLE = [
  { level: 1, expToNext: 50, cumulative: 50, reqCharLevel: '?' },
  { level: 2, expToNext: 115, cumulative: 165, reqCharLevel: 10 },
  { level: 3, expToNext: 200, cumulative: 365, reqCharLevel: 15 },
  { level: 4, expToNext: 308, cumulative: 673, reqCharLevel: 20 },
  { level: 5, expToNext: 450, cumulative: 1123, reqCharLevel: 25 },
  { level: 6, expToNext: 635, cumulative: 1758, reqCharLevel: 30 },
  { level: 7, expToNext: 882, cumulative: 2640, reqCharLevel: 35, note: '872–882 observed range; calculator uses 882.' },
  { level: 8, expToNext: 1190, cumulative: 3830, reqCharLevel: 40 },
  { level: 9, expToNext: 1587, cumulative: 5417, reqCharLevel: 45 },
  { level: 10, expToNext: 2115, cumulative: 7532, reqCharLevel: 50 }
];

const DISCIPLINE_META = {
  Smithing: { icon: '⚒️', accent: 'orange' },
  Weaponcrafting: { icon: '⚔️', accent: 'blue' },
  Tailoring: { icon: '🧵', accent: 'cyan' },
  Woodcrafting: { icon: '🪵', accent: 'green' },
  Leatherworking: { icon: '🧤', accent: 'pink' },
  Arcforge: { icon: '✨', accent: 'gold' }
};

const FALLBACK_DATA = {
  disciplines: [
    {
      discipline: 'Smithing',
      skill_id: 92000000,
      output_types: [
        {
          output_type: 'Materials',
          count: 2,
          levels: [
            {
              level: 1,
              recipes: [
                { output_id: 4011000, result_item_name: 'Bronze Ingot', result_count: 1, req_level: 1, craft_exp: 3, meso_cost: 100, ingredients: [{ item_name: 'Bronze Ore', count: 5 }], id: 'fallback-1' },
                { output_id: 4011001, result_item_name: 'Iron Ingot', result_count: 1, req_level: 1, craft_exp: 3, meso_cost: 100, ingredients: [{ item_name: 'Iron Ore', count: 5 }], id: 'fallback-2' }
              ]
            }
          ]
        }
      ]
    }
  ]
};

function normalizeType(type) {
  const value = String(type || 'Other');
  if (value.toLowerCase() === 'material') return 'Materials';
  if (value.toLowerCase() === 'equipment') return 'Equipment';
  return value;
}

function countRecipesInDiscipline(discipline) {
  return (discipline.output_types || []).reduce(
    (sum, outputType) => sum + (outputType.levels || []).reduce((levelSum, level) => levelSum + (level.recipes || []).length, 0),
    0
  );
}

function countAllRecipes(data) {
  return (data.disciplines || []).reduce((sum, discipline) => sum + countRecipesInDiscipline(discipline), 0);
}

function flattenRecipes(data) {
  return (data.disciplines || []).flatMap((discipline) =>
    (discipline.output_types || []).flatMap((outputType) =>
      (outputType.levels || []).flatMap((level) =>
        (level.recipes || []).map((recipe) => ({
          ...recipe,
          discipline: discipline.discipline,
          output_type: normalizeType(outputType.output_type),
          level: Number(recipe.req_level ?? level.level ?? 1),
          searchText: [recipe.result_item_name, ...(recipe.ingredients || []).map((ing) => ing.item_name)].join(' ').toLowerCase()
        }))
      )
    )
  );
}

function groupByOutputTypeAndLevel(recipes) {
  const grouped = new Map();
  recipes.forEach((recipe) => {
    const type = normalizeType(recipe.output_type);
    if (!grouped.has(type)) grouped.set(type, new Map());
    const levelMap = grouped.get(type);
    const level = Number(recipe.level || recipe.req_level || 1);
    if (!levelMap.has(level)) levelMap.set(level, []);
    levelMap.get(level).push(recipe);
  });

  return [...grouped.entries()].map(([type, levelMap]) => ({
    type,
    count: [...levelMap.values()].reduce((sum, rows) => sum + rows.length, 0),
    levels: [...levelMap.entries()]
      .map(([level, rows]) => ({ level, recipes: rows.sort((a, b) => String(a.result_item_name).localeCompare(String(b.result_item_name))) }))
      .sort((a, b) => a.level - b.level)
  }));
}

function buildMaterialStats(flatRecipes, disciplineFilter = null) {
  const scopedRecipes = disciplineFilter ? flatRecipes.filter((recipe) => recipe.discipline === disciplineFilter) : flatRecipes;
  const stats = new Map();

  scopedRecipes.forEach((recipe) => {
    (recipe.ingredients || []).forEach((ingredient) => {
      const key = ingredient.item_name;
      if (!stats.has(key)) {
        stats.set(key, {
          name: key,
          totalQty: 0,
          recipeIds: new Set(),
          disciplines: new Map(),
          levels: new Set(),
          examples: []
        });
      }
      const row = stats.get(key);
      const count = Number(ingredient.count || 0);
      row.totalQty += count;
      row.recipeIds.add(recipe.id ?? `${recipe.discipline}-${recipe.result_item_name}-${recipe.output_id}`);
      row.levels.add(Number(recipe.level || 1));
      row.disciplines.set(recipe.discipline, (row.disciplines.get(recipe.discipline) || 0) + count);
      if (row.examples.length < 4) row.examples.push(recipe.result_item_name);
    });
  });

  const rawRows = [...stats.values()].map((row) => {
    const recipeCount = row.recipeIds.size;
    const disciplineCount = row.disciplines.size;
    const levelSpread = row.levels.size;
    const rawScore = row.totalQty * 1.6 + recipeCount * 8 + disciplineCount * 20 + levelSpread * 5;
    return {
      ...row,
      recipeCount,
      disciplineCount,
      levelSpread,
      rawScore,
      minLevel: Math.min(...row.levels),
      maxLevel: Math.max(...row.levels)
    };
  });

  const maxScore = Math.max(1, ...rawRows.map((row) => row.rawScore));
  return rawRows
    .map((row) => ({ ...row, score: Math.round((row.rawScore / maxScore) * 100) }))
    .sort((a, b) => b.score - a.score || b.totalQty - a.totalQty || b.recipeCount - a.recipeCount);
}

function buildDisciplineMaterialMatrix(flatRecipes) {
  const materialMap = new Map();
  const disciplines = [...new Set(flatRecipes.map((recipe) => recipe.discipline))];

  flatRecipes.forEach((recipe) => {
    (recipe.ingredients || []).forEach((ingredient) => {
      if (!materialMap.has(ingredient.item_name)) {
        materialMap.set(ingredient.item_name, { name: ingredient.item_name, totalQty: 0, byDiscipline: {} });
      }
      const row = materialMap.get(ingredient.item_name);
      const count = Number(ingredient.count || 0);
      row.totalQty += count;
      if (!row.byDiscipline[recipe.discipline]) row.byDiscipline[recipe.discipline] = { qty: 0, recipes: new Set() };
      row.byDiscipline[recipe.discipline].qty += count;
      row.byDiscipline[recipe.discipline].recipes.add(recipe.id ?? `${recipe.discipline}-${recipe.result_item_name}`);
    });
  });

  return [...materialMap.values()]
    .map((row) => ({
      ...row,
      usedIn: disciplines.filter((discipline) => row.byDiscipline[discipline]),
      disciplines
    }))
    .sort((a, b) => b.totalQty - a.totalQty);
}

function recommendCheapPath(flatRecipes, disciplineName) {
  const rows = flatRecipes
    .filter((recipe) => recipe.discipline === disciplineName && Number(recipe.craft_exp || 0) > 0)
    .map((recipe) => ({
      ...recipe,
      costPerExp: Number(recipe.meso_cost || 0) / Math.max(1, Number(recipe.craft_exp || 1)),
      ingredientBurden: (recipe.ingredients || []).reduce((sum, ing) => sum + Number(ing.count || 0), 0)
    }))
    .sort((a, b) => a.level - b.level || a.costPerExp - b.costPerExp || a.ingredientBurden - b.ingredientBurden);

  const byLevel = new Map();
  rows.forEach((recipe) => {
    if (!byLevel.has(recipe.level)) byLevel.set(recipe.level, recipe);
    const current = byLevel.get(recipe.level);
    if (recipe.costPerExp < current.costPerExp) byLevel.set(recipe.level, recipe);
  });

  return [...byLevel.values()].sort((a, b) => a.level - b.level);
}

function getZeroMesoRecipes(flatRecipes, disciplineName) {
  return flatRecipes
    .filter((recipe) => recipe.discipline === disciplineName && Number(recipe.meso_cost || 0) === 0 && Number(recipe.craft_exp || 0) > 0)
    .sort((a, b) => {
      const aBow = String(a.result_item_name).toLowerCase().includes('arrow for bow') ? -1 : 0;
      const bBow = String(b.result_item_name).toLowerCase().includes('arrow for bow') ? -1 : 0;
      return aBow - bBow || a.level - b.level || String(a.result_item_name).localeCompare(String(b.result_item_name));
    });
}

function simulateSingleRecipeMastery(recipe, includeLv10Fill = false) {
  if (!recipe) return null;
  const recipeExp = Number(recipe.craft_exp || 0);
  if (recipeExp <= 0) return null;

  const levelRows = MASTERY_TABLE.filter((row) => includeLv10Fill ? row.level <= 10 : row.level <= 9).map((row) => {
    const crafts = Math.ceil(row.expToNext / recipeExp);
    const gained = crafts * recipeExp;
    const overflow = gained - row.expToNext;
    return { ...row, crafts, gained, overflow };
  });

  const totalCrafts = levelRows.reduce((sum, row) => sum + row.crafts, 0);
  const totalMasteryNeeded = levelRows.reduce((sum, row) => sum + row.expToNext, 0);
  const materials = new Map();
  (recipe.ingredients || []).forEach((ingredient) => {
    materials.set(ingredient.item_name, Number(ingredient.count || 0) * totalCrafts);
  });

  return {
    recipe,
    recipeExp,
    levelRows,
    totalCrafts,
    totalMasteryNeeded,
    totalOverflow: levelRows.reduce((sum, row) => sum + row.overflow, 0),
    materials: [...materials.entries()].map(([name, qty]) => ({ name, qty }))
  };
}

function formatMeso(value) {
  const number = Number(value || 0);
  return number > 0 ? `${number.toLocaleString()} meso` : '—';
}

function formatCount(count) {
  return Number(count || 0).toLocaleString();
}

function makeRecipeKey(recipe) {
  return `${recipe.discipline}-${recipe.output_id || recipe.result_item_name}-${recipe.id}`;
}

function ProfessionTabs({ disciplines, active, onChange, allCount }) {
  return (
    <div className="profession-tabs">
      <button className={!active ? 'tab active all' : 'tab all'} onClick={() => onChange(null)}>
        ALL <span>{allCount}</span>
      </button>
      {disciplines.map((discipline) => {
        const meta = DISCIPLINE_META[discipline.discipline] || { icon: '🔨', accent: 'orange' };
        const isActive = active === discipline.discipline;
        return (
          <button key={discipline.discipline} className={`tab ${meta.accent} ${isActive ? 'active' : ''}`} onClick={() => onChange(discipline.discipline)}>
            <span>{meta.icon}</span> {discipline.discipline} <span>{countRecipesInDiscipline(discipline)}</span>
          </button>
        );
      })}
    </div>
  );
}

function ViewTabs({ view, onChange }) {
  return (
    <div className="view-tabs">
      <button className={view === 'browser' ? 'active' : ''} onClick={() => onChange('browser')}><Hammer size={15} /> Recipes</button>
      <button className={view === 'planner' ? 'active' : ''} onClick={() => onChange('planner')}><Route size={15} /> No-Meso Planner</button>
      <button className={view === 'materials' ? 'active' : ''} onClick={() => onChange('materials')}><BarChart3 size={15} /> Materials</button>
    </div>
  );
}

function RecipeCard({ recipe }) {
  return (
    <article className="meow-recipe-card">
      <div className="recipe-card-top">
        <div>
          <div className="recipe-title-line">
            <span className="item-dot">◆</span>
            <strong>{recipe.result_item_name}</strong>
            {Number(recipe.result_count || 1) > 1 && <span className="qty-badge">×{recipe.result_count}</span>}
          </div>
          {recipe.output_id != null && <p className="item-id">ID {recipe.output_id}</p>}
        </div>
        <span className="exp-badge">+{formatCount(recipe.craft_exp)} EXP</span>
      </div>

      <div className="ingredient-list">
        {(recipe.ingredients || []).map((ingredient, index) => (
          <div className="ingredient-row" key={`${ingredient.item_name}-${index}`}>
            <span className="dash">-</span>
            <span className="ingredient-icon">◈</span>
            <span>{ingredient.item_name}</span>
            <span className="ingredient-qty">×{formatCount(ingredient.count)}</span>
          </div>
        ))}
      </div>

      <div className="recipe-cost-row">
        <span>Cost</span>
        <strong>{formatMeso(recipe.meso_cost)}</strong>
      </div>
    </article>
  );
}

function LevelBlock({ level, recipes, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="level-block">
      <button className="level-header" onClick={() => setOpen((value) => !value)}>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <strong>Level {level}</strong>
        <span>{recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}</span>
      </button>
      {open && <div className="recipe-card-grid">{recipes.map((recipe) => <RecipeCard recipe={recipe} key={makeRecipeKey(recipe)} />)}</div>}
    </section>
  );
}

function OutputSection({ section }) {
  const [open, setOpen] = useState(true);
  return (
    <section className="output-section">
      <button className="output-header" onClick={() => setOpen((value) => !value)}>
        <span>{section.type}</span>
        <em>{section.count} recipes</em>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {open && <div className="level-stack">{section.levels.map((level) => <LevelBlock key={`${section.type}-${level.level}`} level={level.level} recipes={level.recipes} defaultOpen={level.level <= 3} />)}</div>}
    </section>
  );
}

function CraftingBrowser({ flatRecipes, activeDiscipline, search }) {
  const visibleRecipes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return flatRecipes.filter((recipe) => {
      const matchesDiscipline = !activeDiscipline || recipe.discipline === activeDiscipline;
      const matchesSearch = !query || recipe.searchText.includes(query) || String(recipe.output_id || '').includes(query);
      return matchesDiscipline && matchesSearch;
    });
  }, [flatRecipes, activeDiscipline, search]);

  const grouped = useMemo(() => groupByOutputTypeAndLevel(visibleRecipes), [visibleRecipes]);
  const title = activeDiscipline || 'All Professions';
  const meta = DISCIPLINE_META[activeDiscipline] || { icon: '📚', accent: 'orange' };

  return (
    <section className="browser-panel">
      <header className="browser-title">
        <div>
          <h2><span>{meta.icon}</span>{title}</h2>
          <p>{visibleRecipes.length} visible recipes</p>
        </div>
        <span className="expand-hint">Grouped by output type → level → recipe</span>
      </header>
      {grouped.length === 0 ? <div className="empty-state">No recipes match this search/filter.</div> : grouped.map((section) => <OutputSection key={section.type} section={section} />)}
    </section>
  );
}

function MasteryTableCard() {
  return (
    <section className="planner-card">
      <h3><Database size={17} /> Crafting Mastery Table</h3>
      <div className="responsive-table">
        <table className="mastery-table">
          <thead><tr><th>Craft Lv.</th><th>EXP to next</th><th>Cumulative</th><th>Req. Char Lv.</th></tr></thead>
          <tbody>{MASTERY_TABLE.map((row) => <tr key={row.level}><td>Lv. {row.level}</td><td>{formatCount(row.expToNext)}</td><td>{formatCount(row.cumulative)}</td><td>{row.reqCharLevel}</td></tr>)}</tbody>
        </table>
      </div>
      <p className="planner-note">Calculator handles the char-level cap by rounding crafts level-by-level. Overflow at 100% is treated as wasted because the game does not retroactively apply it after the next character-level threshold.</p>
      <p className="planner-note">Lv. 7 uses 882 EXP because it aligns with the Lv. 8+ cumulative totals; observed value may display as 872–882 due to rounding.</p>
    </section>
  );
}

function NoMesoPlanner({ flatRecipes, activeDiscipline }) {
  const discipline = activeDiscipline || 'Woodcrafting';
  const zeroMesoRecipes = useMemo(() => getZeroMesoRecipes(flatRecipes, discipline), [flatRecipes, discipline]);
  const [selectedKey, setSelectedKey] = useState('');
  const [includeLv10Fill, setIncludeLv10Fill] = useState(false);

  useEffect(() => {
    const preferred = zeroMesoRecipes.find((recipe) => String(recipe.result_item_name).toLowerCase().includes('arrow for bow')) || zeroMesoRecipes[0];
    setSelectedKey(preferred ? makeRecipeKey(preferred) : '');
  }, [discipline, zeroMesoRecipes.length]);

  const selectedRecipe = zeroMesoRecipes.find((recipe) => makeRecipeKey(recipe) === selectedKey) || zeroMesoRecipes[0];
  const plan = useMemo(() => simulateSingleRecipeMastery(selectedRecipe, includeLv10Fill), [selectedRecipe, includeLv10Fill]);

  return (
    <section className="planner-layout">
      <div className="planner-main">
        <section className="planner-card hero-planner-card">
          <h2>Zero-Meso Leveling Planner</h2>
          <p>For Woodcrafting, this is where Arrow for Bow becomes useful: no meso fee, positive mastery gain, and predictable material demand.</p>
          <div className="planner-controls">
            <label>Zero-meso recipe</label>
            <select value={selectedKey} onChange={(event) => setSelectedKey(event.target.value)}>
              {zeroMesoRecipes.map((recipe) => <option key={makeRecipeKey(recipe)} value={makeRecipeKey(recipe)}>{recipe.result_item_name} · +{recipe.craft_exp} EXP · Lv.{recipe.level}</option>)}
            </select>
            <label className="checkbox-row"><input type="checkbox" checked={includeLv10Fill} onChange={(event) => setIncludeLv10Fill(event.target.checked)} /> Include Lv.10 bar fill to 7,532 total mastery</label>
          </div>
          {!plan ? <div className="empty-state">No zero-meso recipe with positive EXP found for {discipline}.</div> : (
            <div className="planner-summary-grid">
              <div><span>Recipe</span><strong>{plan.recipe.result_item_name}</strong></div>
              <div><span>EXP each</span><strong>{formatCount(plan.recipeExp)}</strong></div>
              <div><span>Total crafts</span><strong>{formatCount(plan.totalCrafts)}</strong></div>
              <div><span>Mastery target</span><strong>{formatCount(plan.totalMasteryNeeded)}</strong></div>
            </div>
          )}
        </section>

        {plan && (
          <section className="planner-card">
            <h3><Route size={17} /> Level-by-Level Craft Count</h3>
            <div className="responsive-table">
              <table className="planner-table">
                <thead><tr><th>Stage</th><th>Need</th><th>Crafts</th><th>Gained</th><th>Overflow</th><th>Char Lv.</th></tr></thead>
                <tbody>{plan.levelRows.map((row) => <tr key={row.level}><td>Lv.{row.level} → {row.level + 1}</td><td>{formatCount(row.expToNext)}</td><td>{formatCount(row.crafts)}</td><td>{formatCount(row.gained)}</td><td>{formatCount(row.overflow)}</td><td>{row.reqCharLevel}</td></tr>)}</tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      <aside className="planner-side">
        <MasteryTableCard />
        {plan && (
          <section className="planner-card">
            <h3><PackageSearch size={17} /> Total Materials Needed</h3>
            <div className="material-list compact">
              {plan.materials.map((material) => <div className="material-row" key={material.name}><span>◇</span><strong>{material.name}</strong><em>×{formatCount(material.qty)}</em></div>)}
            </div>
            <p className="planner-note">For Arrow for Bow +3 EXP, reaching Lv.10 requires level-by-level rounding, so it is slightly higher than a simple cumulative EXP ÷ 3 calculation.</p>
          </section>
        )}
      </aside>
    </section>
  );
}

function MaterialsPage({ flatRecipes, activeDiscipline, setActiveDiscipline }) {
  const scopedMaterials = useMemo(() => buildMaterialStats(flatRecipes, activeDiscipline), [flatRecipes, activeDiscipline]);
  const matrixRows = useMemo(() => buildDisciplineMaterialMatrix(flatRecipes).slice(0, 30), [flatRecipes]);
  const title = activeDiscipline ? `${activeDiscipline} Materials` : 'All Crafting Materials';

  return (
    <section className="materials-layout">
      <section className="browser-panel material-panel">
        <header className="browser-title">
          <div>
            <h2><span>📦</span>{title}</h2>
            <p>Normalized bottleneck score: max material in current filter = 100.</p>
          </div>
          <button className="mini-reset" onClick={() => setActiveDiscipline(null)}>Show all professions</button>
        </header>
        <div className="responsive-table material-table-wrap">
          <table className="material-table">
            <thead><tr><th>Material</th><th>Score</th><th>Total Qty</th><th>Recipes</th><th>Prof.</th><th>Levels</th><th>Examples</th></tr></thead>
            <tbody>{scopedMaterials.map((row) => <tr key={row.name}><td><strong>{row.name}</strong></td><td><div className="score-cell"><span>{row.score}</span><div><i style={{ width: `${row.score}%` }} /></div></div></td><td>{formatCount(row.totalQty)}</td><td>{row.recipeCount}</td><td>{row.disciplineCount}</td><td>Lv.{row.minLevel}–{row.maxLevel}</td><td>{row.examples.join(', ')}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="browser-panel material-panel">
        <header className="browser-title">
          <div>
            <h2><span>🧭</span>Cross-Profession Material Matrix</h2>
            <p>Shows which materials are shared across the six professions.</p>
          </div>
        </header>
        <div className="responsive-table material-table-wrap">
          <table className="material-table matrix-table">
            <thead><tr><th>Material</th><th>Total</th><th>Smithing</th><th>Weapon</th><th>Tailor</th><th>Wood</th><th>Leather</th><th>Arcforge</th></tr></thead>
            <tbody>{matrixRows.map((row) => <tr key={row.name}><td><strong>{row.name}</strong></td><td>{formatCount(row.totalQty)}</td>{['Smithing', 'Weaponcrafting', 'Tailoring', 'Woodcrafting', 'Leatherworking', 'Arcforge'].map((discipline) => <td key={discipline} className={row.byDiscipline[discipline] ? 'matrix-hit' : ''}>{row.byDiscipline[discipline] ? `${formatCount(row.byDiscipline[discipline].qty)} / ${row.byDiscipline[discipline].recipes.size}` : '—'}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function OptimizerPanel({ flatRecipes, activeDiscipline }) {
  const discipline = activeDiscipline || flatRecipes[0]?.discipline;
  const cheapPath = useMemo(() => recommendCheapPath(flatRecipes, discipline).slice(0, 10), [flatRecipes, discipline]);
  const topMaterials = useMemo(() => buildMaterialStats(flatRecipes, activeDiscipline).slice(0, 10), [flatRecipes, activeDiscipline]);

  return (
    <aside className="optimizer-panel">
      <section className="side-card">
        <h3><Route size={17} /> Low-cost route draft</h3>
        <p className="side-note">Best recipe per profession level by meso/EXP. This is a route draft, not final economy advice.</p>
        <div className="route-list">{cheapPath.map((recipe) => <div className="route-row" key={`route-${makeRecipeKey(recipe)}`}><span>Lv.{recipe.level}</span><strong>{recipe.result_item_name}</strong><em>{formatMeso(recipe.meso_cost)} / {formatCount(recipe.craft_exp)} EXP</em></div>)}</div>
      </section>
      <section className="side-card">
        <h3><PackageSearch size={17} /> Material bottlenecks</h3>
        <div className="material-list">{topMaterials.map((row, index) => <div className="material-row" key={row.name}><span>{index + 1}</span><strong>{row.name}</strong><em>{row.recipeCount} recipes · score {row.score}/100</em></div>)}</div>
      </section>
    </aside>
  );
}

function DataAudit({ loading, loadedCount, expectedCount, rawCount, source, error }) {
  const matched = loadedCount === expectedCount && rawCount === expectedCount;
  return (
    <div className="audit-strip">
      <div className={`status-pill ${matched ? 'ok' : 'warn'}`}>
        {loading ? <Database size={16} /> : matched ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
        {loading ? 'Loading current data...' : matched ? '342 recipe count matched' : 'Recipe count needs review'}
      </div>
      <span>Expected {expectedCount}</span><span>Loaded {loadedCount}</span><span>Raw {rawCount}</span><span>{source}</span>{error && <span className="audit-error">Fallback: {error}</span>}
    </div>
  );
}

function App() {
  const [rawData, setRawData] = useState(FALLBACK_DATA);
  const [expectedCount, setExpectedCount] = useState(EXPECTED_RECIPES);
  const [source, setSource] = useState('fallback sample');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDiscipline, setActiveDiscipline] = useState('Smithing');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('browser');

  useEffect(() => {
    let active = true;
    Promise.all([fetch(CRAFTING_DATA_URL), fetch(OVERVIEW_DATA_URL)])
      .then(async ([craftingResponse, overviewResponse]) => {
        if (!craftingResponse.ok) throw new Error(`crafting.json ${craftingResponse.status}`);
        if (!overviewResponse.ok) throw new Error(`overview.json ${overviewResponse.status}`);
        const [crafting, overview] = await Promise.all([craftingResponse.json(), overviewResponse.json()]);
        if (!active) return;
        setRawData(crafting);
        setExpectedCount(Number(overview?.stats?.recipes || EXPECTED_RECIPES));
        setSource('ohmi69 dashboard current');
        setActiveDiscipline(crafting?.disciplines?.[0]?.discipline || 'Smithing');
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
        setRawData(FALLBACK_DATA);
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const flatRecipes = useMemo(() => flattenRecipes(rawData), [rawData]);
  const loadedCount = flatRecipes.length;
  const rawCount = useMemo(() => countAllRecipes(rawData), [rawData]);
  const disciplines = rawData.disciplines || [];
  const allMaterialCount = useMemo(() => buildMaterialStats(flatRecipes).length, [flatRecipes]);

  return (
    <main className="meow-app">
      <section className="top-hero">
        <div>
          <p className="eyebrow"><Sparkles size={15} /> MSCW Crafting Optimizer</p>
          <h1>Crafting Browser + Leveling Simulator</h1>
          <p className="hero-copy">Organized like a crafting database: profession tabs, material/equipment sections, level groups, no-meso leveling planner, and material bottleneck analytics.</p>
        </div>
        <div className="hero-actions"><div><Hammer size={18} /><strong>{disciplines.length}</strong><span>Professions</span></div><div><Wrench size={18} /><strong>{loadedCount}</strong><span>Recipes</span></div><div><Coins size={18} /><strong>{allMaterialCount}</strong><span>Materials</span></div></div>
      </section>

      <DataAudit loading={loading} loadedCount={loadedCount} expectedCount={expectedCount} rawCount={rawCount} source={source} error={error} />

      <section className="toolbar-panel">
        <ProfessionTabs disciplines={disciplines} active={activeDiscipline} onChange={setActiveDiscipline} allCount={loadedCount} />
        <div className="toolbar-bottom"><ViewTabs view={view} onChange={setView} /><div className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search result, ingredient, or item ID..." /></div></div>
      </section>

      {view === 'planner' ? <NoMesoPlanner flatRecipes={flatRecipes} activeDiscipline={activeDiscipline || 'Woodcrafting'} /> : view === 'materials' ? <MaterialsPage flatRecipes={flatRecipes} activeDiscipline={activeDiscipline} setActiveDiscipline={setActiveDiscipline} /> : <section className="main-grid"><CraftingBrowser flatRecipes={flatRecipes} activeDiscipline={activeDiscipline} search={search} /><OptimizerPanel flatRecipes={flatRecipes} activeDiscipline={activeDiscipline} /></section>}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
