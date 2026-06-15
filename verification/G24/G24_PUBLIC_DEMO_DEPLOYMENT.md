# G24 Public Demo Deployment

## Build

```bash
npx vite build --base=/agent-factory/
```

Output: `dist/` (588KB total, 3 files)

| File | Size |
|---|---|
| `index.html` | 0.62 KB |
| `assets/index-*.css` | 5.84 KB |
| `assets/index-*.js` | 586.69 KB (174KB gzipped) |

## Deploy to GitHub Pages

```bash
# Option A: gh-pages branch
git checkout --orphan gh-pages
cp -r dist/* .
git add -A
git commit -m "Deploy v0.1.0-rc.1"
git push origin gh-pages

# Option B: GitHub Actions or repo Settings → Pages → main branch /docs
```

## Post-deploy smoke test

1. Load the deployed URL
2. Confirm tutorial checklist appears (first run)
3. Confirm Agent HUD visible (bottom-right)
4. Navigate to Orders tab → accept an order
5. Advance a few ticks → agents start working
6. Confirm first order delivers within ~15 ticks
7. Navigate to Debugger tab → confirm it loads
8. Check browser console — no errors, no Ollama calls

## Boundaries

- No Ollama required for demo
- No backend required — static files only
- All agents are deterministic simulations
