# MSCW Crafting Optimizer

A Vite + React prototype for a MapleStory Classic World crafting simulator.

## What this prototype does

- Select a profession.
- Choose an optimization mode:
  - Cheapest Meso Path
  - Fastest EXP Path
  - Farm-Friendly / Low Meso
  - Balanced Path
- Simulate leveling from a start level to a target level.
- Generate a total shopping / farming list.
- Rank the most valuable crafting materials across all recipes.
- Explore recipes by profession.

## Current status

The app is a working prototype with structured sample data. Replace the sample recipe data in `src/main.jsx` with real MSCW recipe data once confirmed.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Recommended next steps

1. Move sample data out of `src/main.jsx` into separate files:
   - `src/data/items.js`
   - `src/data/recipes.js`
   - `src/data/professions.js`
   - `src/data/expTable.js`
2. Add real MSCW recipe data.
3. Add editable market prices saved to `localStorage`.
4. Add material source data: monster drops, NPC, crafted, unknown.
5. Add a material dependency graph.
6. Add export-to-PNG for leveling route and shopping list.

## Core scoring idea

The simulator estimates recipe value by combining:

- Material cost
- Direct meso fee
- Rarity penalty
- Source penalty
- Resale credit
- EXP gain

This lets the same data support multiple player goals: low meso, fast leveling, farm-only planning, or balanced progression.
