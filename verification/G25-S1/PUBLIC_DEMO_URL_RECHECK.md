# G25-S1 Public Demo URL Recheck

## Date: 2026-06-16

## Repository

```
Remote: https://github.com/catking01/agent-foundry.git
Owner:  catking01
Repo:   agent-foundry
```

## Canonical Public Demo URL

```
https://catking01.github.io/agent-foundry/
```

## Build Configuration

```
npx vite build --base=/agent-foundry/
```

The `--base` path matches the repository name. GitHub Pages serves from `https://catking01.github.io/agent-foundry/`.

## Verification

- [x] Git remote confirms `catking01/agent-foundry`
- [x] Build uses `--base=/agent-foundry/`
- [x] `index.html` references assets at `/agent-foundry/assets/...`
- [x] No conflicting URL (`agent-factory` was the old repo name, renamed to `agent-foundry`)

## Note on Historical URL

The repo was originally `agent-factory` and was renamed to `agent-foundry`. Some older verification documents may reference `agent-factory`. The current canonical name is `agent-foundry`.
