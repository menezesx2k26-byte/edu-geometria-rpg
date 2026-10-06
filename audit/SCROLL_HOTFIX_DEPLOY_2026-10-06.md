# Scroll hotfix deployment handoff — 2026-10-06

## Target

- Live evaluation URL: `https://geometria-rpg.menezesx2k25.workers.dev/#avaliacao-ifsp`
- Production surface verified in a public-browser check: title `Geometria RPG · Academia Euclidiana`, heading `Treino da 1ª Avaliação — IFSP`.
- Do **not** confuse it with `geometria-rpg.menezesx2k26.workers.dev`, which is a different deployment and currently opens the newer map app.

## Fix

- PR: #21
- Merged commit: `a972ce5c5f3963b70d5120e4323342bd84730006`
- Root cause: `EvaluationTrainingPage` focused the heading on challenge/phase changes; submitting an answer changed phase and browser focus scrolled the page upward.
- Fix: `heading.current?.focus({ preventScroll: true })`
- Regression coverage added in `tests/e2e/evaluation-trail.spec.ts`.

## Validation

GitHub-hosted validation against the exact deployment commit completed:

- `npm ci`: success
- `npm run test:unit`: 25/25 passing
- `npm run build`: success

The production upload itself has **not** completed.

## Deployment blockers observed

1. The Cloudflare credential currently stored in the geometry repository fails `wrangler whoami` with Cloudflare code `9109 Invalid access token`, including after safe whitespace/prefix normalization.
2. Treating that secret as a legacy Global API Key also failed; it is not a usable legacy key.
3. The currently connected Cloudflare MCP account exposes the `menezesx2k26.workers.dev` namespace, not the live `menezesx2k25.workers.dev` namespace. A Worker named `geometria-rpg` exists there, but it is a different deployment and must not be overwritten.
4. A trusted-desktop fallback run is queued in GitHub Actions and targets the exact commit above. It requires the self-hosted desktop runner and its existing Wrangler login to become available.

## Next safe action

Authenticate/connect the Cloudflare account that owns the `menezesx2k25.workers.dev` namespace **or** restore the trusted desktop runner, then deploy commit `a972ce5c5f3963b70d5120e4323342bd84730006`.

After upload, verify:

1. live HTTP 200;
2. the live bundle changed;
3. `#avaliacao-ifsp` still opens the IFSP evaluation campaign;
4. answering a question does not change the user's scroll position unexpectedly.

Do not claim production is fixed until all four checks pass.
