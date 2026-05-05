import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './fantasy.css';

const CRAFTING_DATA_URL = 'https://ohmi69.github.io/osms_datamine_dashboard/data/current/crafting.json';
const OVERVIEW_DATA_URL = 'https://ohmi69.github.io/osms_datamine_dashboard/data/current/overview.json';
const EXPECTED_RECIPES = 342;

const PROFESSIONS = ['Smithing', 'Weaponcrafting', 'Tailoring', 'Woodcrafting', 'Leatherworking', 'Arcforge'];
const PROF_META = {
  Smithing: { short: 'Smithing', icon: '🏆' },
  Weaponcrafting: { short: 'Weapon', icon: '⚔️' },
  Tailoring: { short: 'Tailor', icon: '🧵' },
  Woodcrafting: { short: 'Wood', icon: '🪵' },
  Leatherworking: { short: 'Leather', icon: '🛡️' },
  Arcforge: { short: 'Arcforge', icon: '💎' }
};

const MASTERY_TABLE = [
  { level: 1, expToNext: 50, reqCharLevel: '?' },
  { level: 2, expToNext: 115, reqCharLevel: 10 },
  { level: 3, expToNext: 200, reqCharLevel: 15 },
  { level: 4, expToNext: 308, reqCharLevel: 20 },
  { level: 5, expToNext: 450, reqCharLevel: 25 },
  { level: 6, expToNext: 635, reqCharLevel: 30 },
  { level: 7, expToNext: 882, reqCharLevel: 35 },
  { level: 8, expToNext: 1190, reqCharLevel: 40 },
  { level: 9, expToNext: 1587, reqCharLevel: 45 }
];

const FALLBACK_DATA = { disciplines: [] };

function flattenRecipes(data) {
  return (data.disciplines || []).flatMap((discipline) =>
    (discipline.output_types || []).flatMap((outputType) =>
      (outputType.levels || []).flatMap((level) =>
        (level.recipes || []).map((recipe) => ({
          ...recipe,
          discipline: discipline.discipline,
          outputType: outputType.output_type,
          level: Number(recipe.req_level ?? level.level ?? 1),
          searchText: [recipe.result_item_name, ...(recipe.ingredients || []).map((ingredient) => ingredient.item_name)].join(' ').toLowerCase()
        }))
      )
    )
  );
}

function countRecipes(data) {
  return (data.disciplines || []).reduce((total, discipline) => total + (discipline.output_types || []).reduce((typeTotal, outputType) => typeTotal + (outputType.levels || []).reduce((levelTotal, level) => levelTotal + (level.recipes || []).length, 0), 0), 0);
}

function countByProfession(data, profession) {
  const discipline = (data.disciplines || []).find((row) => row.discipline === profession);
  if (!discipline) return 0;
  return countRecipes({ disciplines: [discipline] });
}

function buildMatrixRows(recipes, filter) {
  const map = new Map();
  const scoped = filter === 'all' ? recipes : recipes.filter((recipe) => recipe.discipline === filter);

  scoped.forEach((recipe) => {
    (recipe.ingredients || []).forEach((ingredient) => {
      const name = ingredient.item_name;
      if (!map.has(name)) {
        map.set(name, {
          name,
          totalQty: 0,
          byProfession: {},
          recipeIds: new Set(),
          examples: new Set(),
          levels: new Set()
        });
      }
      const row = map.get(name);
      const qty = Number(ingredient.count || 0);
      row.totalQty += qty;
      row.recipeIds.add(`${recipe.discipline}-${recipe.id}-${recipe.result_item_name}`);
      row.examples.add(recipe.result_item_name);
      row.levels.add(recipe.level || 1);
      if (!row.byProfession[recipe.discipline]) row.byProfession[recipe.discipline] = { qty: 0, recipes: new Set() };
      row.byProfession[recipe.discipline].qty += qty;
      row.byProfession[recipe.discipline].recipes.add(`${recipe.id}-${recipe.result_item_name}`);
    });
  });

  let rows = [...map.values()].map((row) => {
    const professionCount = Object.keys(row.byProfession).length;
    const recipeCount = row.recipeIds.size;
    const levelSpread = row.levels.size;
    const rawScore = row.totalQty * 1.3 + recipeCount * 8 + professionCount * 26 + levelSpread * 5;
    return { ...row, professionCount, recipeCount, levelSpread, rawScore, examples: [...row.examples].slice(0, 3) };
  });

  const maxScore = Math.max(1, ...rows.map((row) => row.rawScore));
  rows = rows.map((row) => ({ ...row, score: Math.round((row.rawScore / maxScore) * 100) }));

  return rows.sort((a, b) => b.totalQty - a.totalQty || b.recipeCount - a.recipeCount).slice(0, 26);
}

function getCellClass(cell) {
  if (!cell) return 'empty';
  const recipeCount = cell.recipes.size;
  if (recipeCount >= 10) return 'high';
  if (recipeCount >= 3) return 'medium';
  return 'single';
}

function materialIcon(name) {
  const lower = name.toLowerCase();
  if (lower.includes('screw')) return '🔩';
  if (lower.includes('thread')) return '🧵';
  if (lower.includes('leather') || lower.includes('skin')) return '🛡️';
  if (lower.includes('wood')) return '🪵';
  if (lower.includes('ingot')) return '▰';
  if (lower.includes('crystal') || lower.includes('garnet') || lower.includes('sapphire') || lower.includes('topaz')) return '💎';
  if (lower.includes('shell')) return '🐚';
  if (lower.includes('tail')) return '🟣';
  if (lower.includes('wing')) return '🪽';
  return '◇';
}

function materialTone(name) {
  const lower = name.toLowerCase();
  if (lower.includes('crystal') || lower.includes('tail')) return 'purple';
  if (lower.includes('garnet') || lower.includes('topaz') || lower.includes('skin')) return 'gold';
  if (lower.includes('ingot')) return 'green';
  return 'blue';
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function makeArrowPlan(recipes) {
  const arrow = recipes.find((recipe) => recipe.discipline === 'Woodcrafting' && Number(recipe.meso_cost || 0) === 0 && Number(recipe.craft_exp || 0) > 0 && recipe.result_item_name?.toLowerCase().includes('arrow for bow')) ||
    recipes.find((recipe) => recipe.discipline === 'Woodcrafting' && Number(recipe.meso_cost || 0) === 0 && Number(recipe.craft_exp || 0) > 0);
  if (!arrow) return null;
  const expEach = Number(arrow.craft_exp || 0);
  const stages = MASTERY_TABLE.map((row) => {
    const crafts = Math.ceil(row.expToNext / expEach);
    return { ...row, crafts, gained: crafts * expEach, overflow: crafts * expEach - row.expToNext };
  });
  const totalCrafts = stages.reduce((sum, row) => sum + row.crafts, 0);
  const mats = (arrow.ingredients || []).map((ingredient) => ({ name: ingredient.item_name, qty: Number(ingredient.count || 0) * totalCrafts }));
  return { recipe: arrow, stages, totalCrafts, mats, expEach };
}

function ProfessionTabs({ data, active, setActive }) {
  return (
    <div className="fx-tabs">
      <button className={active === 'all' ? 'active' : ''} onClick={() => setActive('all')}>All <span>{countRecipes(data)}</span></button>
      {PROFESSIONS.map((profession) => (
        <button key={profession} className={active === profession ? 'active' : ''} onClick={() => setActive(profession)}>
          <b>{PROF_META[profession].icon}</b>{profession}<span>{countByProfession(data, profession)}</span>
        </button>
      ))}
    </div>
  );
}

function MatrixCell({ cell }) {
  if (!cell) return <span className="matrix-chip empty">—</span>;
  return <span className={`matrix-chip ${getCellClass(cell)}`}>{formatNumber(cell.qty)} / {cell.recipes.size}</span>;
}

function MatrixView({ rows, activeFilter, setActiveFilter }) {
  const visibleRows = useMemo(() => {
    if (activeFilter === 'shared') return rows.filter((row) => row.professionCount >= 2);
    if (activeFilter === 'intermediate') return rows.filter((row) => /ingot|processed|screw|cloth|leather|wood/i.test(row.name));
    if (activeFilter === 'raw') return rows.filter((row) => !/ingot|processed|screw/i.test(row.name));
    return rows;
  }, [rows, activeFilter]);

  const highest = visibleRows[0];
  return (
    <section className="matrix-shell">
      <aside className="craft-rail">
        {['🧱', '⚒️', '⚔️', '🧵', '🪵', '🛡️', '💎', '🔮', '✨', '⚙️'].map((icon, index) => <span key={index}>{icon}</span>)}
      </aside>
      <div className="matrix-card">
        <header className="matrix-hero">
          <div>
            <h2>Cross-Profession Material Matrix</h2>
            <p>Shows which materials are shared across the six professions.</p>
          </div>
          <div className="matrix-filters">
            {[
              ['all', 'All'],
              ['shared', 'Shared Only'],
              ['intermediate', 'Craftable Intermediates'],
              ['raw', 'Raw Mats']
            ].map(([key, label]) => <button key={key} className={activeFilter === key ? 'active' : ''} onClick={() => setActiveFilter(key)}>{label}</button>)}
          </div>
        </header>

        <div className="matrix-table-wrap">
          <table className="fantasy-matrix">
            <thead>
              <tr>
                <th className="material-col">◇ Material</th>
                <th>Total</th>
                {PROFESSIONS.map((profession) => <th key={profession}><span className="head-icon">{PROF_META[profession].icon}</span>{PROF_META[profession].short}</th>)}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.name} className={row.name === highest?.name ? 'top-row' : ''}>
                  <td className="material-name">
                    <span className="mat-icon">{materialIcon(row.name)}</span>
                    <div>
                      <strong>{row.name}</strong>
                      <div className={`usage-bar ${materialTone(row.name)}`}><i style={{ width: `${Math.max(18, row.score)}%` }} /></div>
                    </div>
                  </td>
                  <td className="total-cell">{formatNumber(row.totalQty)}</td>
                  {PROFESSIONS.map((profession) => <td key={profession}><MatrixCell cell={row.byProfession[profession]} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="matrix-legend">
          <div className="legend-how"><strong>How to read</strong><span className="sample-chip">120 / 4</span><em>quantity needed / number of recipes</em></div>
          <div><i className="lg high" />High overlap<br /><small>Used in many recipes</small></div>
          <div><i className="lg medium" />Medium overlap<br /><small>Used in several recipes</small></div>
          <div><i className="lg single" />Single profession<br /><small>Narrow use case</small></div>
          <div className="legend-stat"><b>{visibleRows.length}</b><span>Materials shown</span></div>
          <div className="legend-stat"><b>{formatNumber(highest?.totalQty || 0)}</b><span>Top total qty</span></div>
        </footer>
      </div>
    </section>
  );
}

function MaterialsRank({ rows }) {
  return (
    <section className="rank-panel">
      <h3>Material Bottleneck Ranking</h3>
      <div className="rank-grid">
        {rows.slice(0, 18).map((row, index) => (
          <article key={row.name}>
            <span>{index + 1}</span>
            <strong>{materialIcon(row.name)} {row.name}</strong>
            <em>{row.recipeCount} recipes · {row.professionCount} professions</em>
            <div className="score-track"><i style={{ width: `${row.score}%` }} /></div>
            <b>{row.score}/100</b>
          </article>
        ))}
      </div>
    </section>
  );
}

function Planner({ recipes }) {
  const plan = makeArrowPlan(recipes);
  return (
    <section className="planner-fx">
      <h2>No-Meso Woodcrafting Planner</h2>
      {!plan ? <p>No zero-meso Woodcrafting recipe found.</p> : <>
        <div className="plan-cards">
          <div><span>Recipe</span><strong>{plan.recipe.result_item_name}</strong></div>
          <div><span>EXP each</span><strong>{plan.expEach}</strong></div>
          <div><span>Total crafts to Lv.10</span><strong>{formatNumber(plan.totalCrafts)}</strong></div>
          {plan.mats.map((mat) => <div key={mat.name}><span>{mat.name}</span><strong>×{formatNumber(mat.qty)}</strong></div>)}
        </div>
        <table className="plan-table"><thead><tr><th>Stage</th><th>Need</th><th>Crafts</th><th>Overflow</th><th>Char Lv.</th></tr></thead><tbody>{plan.stages.map((stage) => <tr key={stage.level}><td>Lv.{stage.level} → {stage.level + 1}</td><td>{stage.expToNext}</td><td>{stage.crafts}</td><td>{stage.overflow}</td><td>{stage.reqCharLevel}</td></tr>)}</tbody></table>
      </>}
    </section>
  );
}

function RecipesBrowser({ recipes, activeProfession, search }) {
  const visible = recipes.filter((recipe) => (activeProfession === 'all' || recipe.discipline === activeProfession) && (!search || recipe.searchText.includes(search.toLowerCase()) || String(recipe.output_id || '').includes(search)));
  return (
    <section className="recipe-browser-fx">
      <h2>{activeProfession === 'all' ? 'All Recipes' : activeProfession} Recipe Browser</h2>
      <div className="recipe-fx-grid">
        {visible.slice(0, 120).map((recipe) => <article key={`${recipe.discipline}-${recipe.id}-${recipe.result_item_name}`}><strong>{recipe.result_item_name}</strong><span>{recipe.discipline} · Lv.{recipe.level} · +{recipe.craft_exp} EXP</span><em>{formatNumber(recipe.meso_cost)} meso</em><p>{(recipe.ingredients || []).map((ing) => `${ing.item_name} ×${ing.count}`).join(' · ')}</p></article>)}
      </div>
    </section>
  );
}

function App() {
  const [data, setData] = useState(FALLBACK_DATA);
  const [expected, setExpected] = useState(EXPECTED_RECIPES);
  const [loading, setLoading] = useState(true);
  const [activeProfession, setActiveProfession] = useState('all');
  const [view, setView] = useState('matrix');
  const [matrixFilter, setMatrixFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    Promise.all([fetch(CRAFTING_DATA_URL), fetch(OVERVIEW_DATA_URL)])
      .then(async ([craftingRes, overviewRes]) => {
        const [crafting, overview] = await Promise.all([craftingRes.json(), overviewRes.json()]);
        if (!mounted) return;
        setData(crafting);
        setExpected(Number(overview?.stats?.recipes || EXPECTED_RECIPES));
      })
      .catch(() => setData(FALLBACK_DATA))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const recipes = useMemo(() => flattenRecipes(data), [data]);
  const matrixRows = useMemo(() => buildMatrixRows(recipes, activeProfession), [recipes, activeProfession]);
  const shownRows = useMemo(() => search ? matrixRows.filter((row) => row.name.toLowerCase().includes(search.toLowerCase()) || row.examples.some((example) => example.toLowerCase().includes(search.toLowerCase()))) : matrixRows, [matrixRows, search]);
  const loaded = recipes.length;

  return (
    <main className="fantasy-app">
      <section className="fx-header">
        <div>
          <p>MSCW Crafting Optimizer</p>
          <h1>Crafting Intelligence Dashboard</h1>
          <span>{loading ? 'Loading current data...' : `${loaded}/${expected} recipes loaded`}</span>
        </div>
        <nav>
          <button className={view === 'matrix' ? 'active' : ''} onClick={() => setView('matrix')}>Matrix</button>
          <button className={view === 'materials' ? 'active' : ''} onClick={() => setView('materials')}>Materials</button>
          <button className={view === 'planner' ? 'active' : ''} onClick={() => setView('planner')}>No-Meso Planner</button>
          <button className={view === 'recipes' ? 'active' : ''} onClick={() => setView('recipes')}>Recipes</button>
        </nav>
      </section>

      <section className="fx-toolbar">
        <ProfessionTabs data={data} active={activeProfession} setActive={setActiveProfession} />
        <label className="fx-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search materials, recipes, or item ID..." /></label>
      </section>

      {view === 'matrix' && <MatrixView rows={shownRows} activeFilter={matrixFilter} setActiveFilter={setMatrixFilter} />}
      {view === 'materials' && <MaterialsRank rows={shownRows} />}
      {view === 'planner' && <Planner recipes={recipes} />}
      {view === 'recipes' && <RecipesBrowser recipes={recipes} activeProfession={activeProfession} search={search} />}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
