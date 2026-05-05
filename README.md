# MSCW Crafting Optimizer

A Vite + React prototype for a MapleStory Classic World crafting simulator.

Live site: https://sduckyduck.github.io/mscw-crafting/

## What this prototype does

- Browse all current crafting recipes by profession, output type, and level.
- Use a no-meso leveling planner for recipes such as Woodcrafting arrows.
- View material bottleneck rankings normalized to 100.
- Compare material use across all six professions.
- Search by result, ingredient, or item ID.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

The repo is configured for GitHub Pages through `.github/workflows/deploy.yml`.

## Recommended next steps

1. Add a recursive dependency-chain analyzer.
2. Add craft-vs-buy toggles for intermediate materials.
3. Add item icons from the datamine/item image source.
4. Add manual market prices saved to `localStorage`.
5. Add export-to-PNG for leveling route and shopping list.
