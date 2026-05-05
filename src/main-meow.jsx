import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertTriangle,
  Box,
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
  Swords,
  WandSparkles,
  Wrench
} from 'lucide-react';
import './meow.css';

const CRAFTING_DATA_URL = 'https://ohmi69.github.io/osms_datamine_dashboard/data/current/crafting.json';
const OVERVIEW_DATA_URL = 'https://ohmi69.github.io/osms_datamine_dashboard/data/current/overview.json';
const EXPECTED_RECIPES = 342;

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
                {
                  output_id: 4011000,
                  result_item_name: 'Bronze Ingot',
                  result_count: 1,
                  req_level: 1,
                  craft_exp: 3,
                  meso_cost: 100,
                  ingredients: [{ item_name: 'Bronze Ore', count: 5 }],
                  id: 'fallback-1'
                },
                {
                  output_id: 4011001,
                  result_item_name: 'Iron Ingot',
                  result_count: 1,
                  req_level: 1,
                  craft_exp: 3,
                  meso_cost: 100,
                  ingredients: [{ item_name: 'Iron Ore', count: 5 }],
                  id: 'fallback-2'
                }
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

function materialRanking(flatRecipes) {
  const stats = new Map();
  flatRecipes.forEach((recipe) => {
    (recipe.ingredients || []).forEach((ingredient) => {
      const key = ingredient.item_name;
      if (!stats.has(key)) {
        stats.set(key, {
          name: key,
          totalQty: 0,
          recipeIds: new Set(),
          disciplines: new Set(),
          levelWeight: 0
        });
      }
      const row = stats.get(key);
      row.totalQty += Number(ingredient.count || 0);
      row.recipeIds.add(recipe.id ?? `${recipe.discipline}-${recipe.result_item_name}`);
      row.disciplines.add(recipe.discipline);
      row.levelWeight += Number(ingredient.count || 0) * Number(recipe.level || 1);
    });
  });

  return [...stats.values()]
    .map((row) => ({
      ...row,
      recipeCount: row.recipeIds.size,
      disciplineCount: row.disciplines.size,
      score: Math.round(row.totalQty * 1.6 + row.recipeIds.size * 7 + row.disciplines.size * 18 + row.levelWeight * 0.45)
    }))
    .sort((a, b) => b.score - a.score);
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
          <button
            key={discipline.discipline}
            className={`tab ${meta.accent} ${isActive ? 'active' : ''}`}
            onClick={() => onChange(discipline.discipline)}
          >
            <span>{meta.icon}</span> {discipline.discipline} <span>{countRecipesInDiscipline(discipline)}</span>
          </button>
        );
      })}
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
      {open && (
        <div className="recipe-card-grid">
          {recipes.map((recipe) => <RecipeCard recipe={recipe} key={makeRecipeKey(recipe)} />)}
        </div>
      )}
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
      {open && (
        <div className="level-stack">
          {section.levels.map((level) => <LevelBlock key={`${section.type}-${level.level}`} level={level.level} recipes={level.recipes} defaultOpen={level.level <= 3} />)}
        </div>
      )}
    </section>
  );
}

function CraftingBrowser({ data, flatRecipes, activeDiscipline, search }) {
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
      {grouped.length === 0 ? (
        <div className="empty-state">No recipes match this search/filter.</div>
      ) : (
        grouped.map((section) => <OutputSection key={section.type} section={section} />)
      )}
    </section>
  );
}

function OptimizerPanel({ flatRecipes, activeDiscipline }) {
  const discipline = activeDiscipline || flatRecipes[0]?.discipline;
  const cheapPath = useMemo(() => recommendCheapPath(flatRecipes, discipline).slice(0, 10), [flatRecipes, discipline]);
  const topMaterials = useMemo(() => materialRanking(activeDiscipline ? flatRecipes.filter((r) => r.discipline === activeDiscipline) : flatRecipes).slice(0, 10), [flatRecipes, activeDiscipline]);

  return (
    <aside className="optimizer-panel">
      <section className="side-card">
        <h3><Route size={17} /> Low-cost route draft</h3>
        <p className="side-note">Best recipe per profession level by meso/EXP. This is a route draft, not final economy advice.</p>
        <div className="route-list">
          {cheapPath.map((recipe) => (
            <div className="route-row" key={`route-${makeRecipeKey(recipe)}`}>
              <span>Lv.{recipe.level}</span>
              <strong>{recipe.result_item_name}</strong>
              <em>{formatMeso(recipe.meso_cost)} / {formatCount(recipe.craft_exp)} EXP</em>
            </div>
          ))}
        </div>
      </section>

      <section className="side-card">
        <h3><PackageSearch size={17} /> Material bottlenecks</h3>
        <div className="material-list">
          {topMaterials.map((row, index) => (
            <div className="material-row" key={row.name}>
              <span>{index + 1}</span>
              <strong>{row.name}</strong>
              <em>{row.recipeCount} recipes · score {row.score}</em>
            </div>
          ))}
        </div>
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
      <span>Expected {expectedCount}</span>
      <span>Loaded {loadedCount}</span>
      <span>Raw {rawCount}</span>
      <span>{source}</span>
      {error && <span className="audit-error">Fallback: {error}</span>}
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

  return (
    <main className="meow-app">
      <section className="top-hero">
        <div>
          <p className="eyebrow"><Sparkles size={15} /> MSCW Crafting Optimizer</p>
          <h1>Crafting Browser + Leveling Simulator</h1>
          <p className="hero-copy">Organized like a crafting database: profession tabs, material/equipment sections, level groups, compact recipe cards, and optimization side panels.</p>
        </div>
        <div className="hero-actions">
          <div><Hammer size={18} /><strong>{disciplines.length}</strong><span>Professions</span></div>
          <div><Wrench size={18} /><strong>{loadedCount}</strong><span>Recipes</span></div>
          <div><Coins size={18} /><strong>{materialRanking(flatRecipes).length}</strong><span>Materials</span></div>
        </div>
      </section>

      <DataAudit loading={loading} loadedCount={loadedCount} expectedCount={expectedCount} rawCount={rawCount} source={source} error={error} />

      <section className="toolbar-panel">
        <ProfessionTabs disciplines={disciplines} active={activeDiscipline} onChange={setActiveDiscipline} allCount={loadedCount} />
        <div className="search-box">
          <Search size={17} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search result, ingredient, or item ID..." />
        </div>
      </section>

      <section className="main-grid">
        <CraftingBrowser data={rawData} flatRecipes={flatRecipes} activeDiscipline={activeDiscipline} search={search} />
        <OptimizerPanel flatRecipes={flatRecipes} activeDiscipline={activeDiscipline} />
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
