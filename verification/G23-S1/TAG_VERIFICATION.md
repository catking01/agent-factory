# G23-S1 Tag Verification

## Tag

| Field | Value |
|---|---|
| Tag | `v0.1.0-rc.1` |
| Remote ref | `16275158c35591b854d62a1179a78ef461cbd77f` |
| Points to | `627540d` (G22: Release Candidate Stabilization) |
| Annotated | Yes — includes release description and non-claims |

## Release artifacts

| File | Exists |
|---|---|
| `RELEASE_NOTES_v0.1.0.md` | ✅ |
| `DEPLOYMENT_CHECKLIST.md` | ✅ |
| `STATIC_BUILD_MANIFEST.txt` | ✅ (3 files: index.html, CSS, JS) |

## Verification

| Check | Result |
|---|---|
| `npm run test` | PASS (40 files, 253 tests, 12 skipped) |
| `npx vite build --base=/agent-factory/` | PASS (636 modules) |
| Tag exists remotely | ✅ |
| Tag annotated correctly | ✅ |

## Deploy command

```bash
npx vite build --base=/agent-factory/
# Deploy dist/ to GitHub Pages or any static host
```
