# IFSP evaluation campaign

## Verified origin and scope

- Repository: menezesx2k26-byte/edu-geometria-rpg.
- Branch: feat/ifsp-evaluation-campaign, based on fix/production-debug-qa at 104319d8cbf5ab755f10b2a45c28fbf8ff5d0e88.
- Published original: f639114ba78eeff2719dc833cfdf3362e52e50e9. The live GeometryApp-Cg9L2DpI.js SHA-256 is 9e82a6af7830443e614fdf8d9af2a9fd7500081001bf83aedc3dac4a436d0bc9, identical to the prior production audit manifest.
- Also inspected edu-geometria-euclidiana and edu-geometria-tutor for course scope and conventions. Main and PR #19 use a different Vite application; this implementation preserves the published Vinext app and its existing v2 progress controller.
- All six question families supplied in the request are represented. The two original exam images are absent from the provided attachment and repositories; an image-by-image completeness comparison remains unverified.
- Trapezoid convention is explicit and selectable because the consulted course material is ambiguous. Isosceles uses the requested inclusive convention.

## Implementation

- One saved campaign at #avaliacao-ifsp, accessible from the map and training, with the same six navigation areas and existing navy/gold visual identity.
- Six lessons, 33 primary decisions/constructions/proof steps, 33 transfer steps; at most one further variant per block after error or requested help (99 steps maximum).
- Guided SVG median and altitude construction, including an obtuse transfer with the foot outside the side. Proofs require mathematical reasons and correspondence. Ramp generator validates exact integer inputs; the original ramp is 2+6=8 m and h=4 m. Boss proof ends in perimeter=AB+AC and transfers to renamed geometry with another interior point.
- Reading, practice and independent mastery are separate. Hints count only after an explicit request. Incorrect reasons fail the combined V/F response. Independent transfer is necessary for full mastery.
- Atomic v2 evidence/session updates, replay protection, persisted draft/feedback, bounded recent-ID cooldown, schema validation and original-data backup recovery. No new dependency or API.
- Existing training scheduler now prefers another eligible variant over an exact recently seen question.

## Verification ledger

- Unit: 25 passed (16 preserved engine checks and 9 campaign checks).
- Focused browser: full campaign and requested-hint persistence passed at 360x800, including 66 unique steps, six checkpoints, changed mastery and reload recovery.
- Accessibility: axe found zero violations in campaign content and feedback at widths 360, 390, 412 and 1366; no horizontal overflow.
- Lint, Vinext production build, generated Workers types and TypeScript: passed. Rendered HTML: 2 passed.
- Full browser regression: 52 passed in 5.9 minutes (13 checks at 360x800, 390x844, 412x915 and 1366x768), including all original areas, existing skill unlocks, proof validation, corrupt/legacy/future storage recovery and the entire new campaign at every width.
- Actual SVGs inspected at 360 px: median/altitude (including external foot), parallelogram, inequality, ramp and boss. Zero axe violations or horizontal overflow in six lesson states and both constructed-altitude states. Ramp remaining-length label moved clear of the inclined line after review; final build/lint/types and focused figure reinspection cover this label-only change.
- Browser uses installed Chromium 151 via PLAYWRIGHT_EXECUTABLE_PATH; no additional browser or dependency installed in this checkout.
- Evidence: evaluation-build.txt, evaluation-types.txt, evaluation-e2e.txt and evidence/evaluation-accessibility.json.

## Execution checkpoint

- Implementation and regression validated. Local preview uses port 3000; production deployment still blocked.
- Quota guard: EMERGENCY (primary account usage 94%, secondary 78%; threshold 85%). No heavy model fan-out or additional discovery. Remaining work is bounded verification, targeted corrections if required, commit, PR, attachment and verified report.
- Account-memory decision: no new stable cross-project user fact. Project state belongs here; no account-memory write required.
- User explicitly requested production publication. Retried native get_site with the manifest ID: project_not_found/404; list_sites returned zero accessible sites. Asked the user to reconnect Sites to the owning account. No replacement site created; deployment has not changed.

## Reuse and review decision

The published progress transaction, scheduler, hash navigation, SVG conventions and typography are retained. A small authored runner is necessary for this course-specific sequence of construction actions, ordered justifications and bounded transfer; a generic quiz dependency would not supply those mathematical contracts and would add a second persistence layer. No architecture replacement, paid API or subagent was used. Frontend review is approved for the verified textual brief; original exam-image completeness and production publication remain explicitly open.
