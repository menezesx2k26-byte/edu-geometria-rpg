# Hogwarts Memory Castle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revestir a trilha `/avaliacao-ifsp` com um palácio mental em seis salas que torne as técnicas da 1ª Avaliação recuperáveis espacialmente, preservando o conteúdo matemático, o `recordAttempt`, a remediação por rodadas e o motor adaptativo existentes.

**Architecture:** Manter a rota e o motor global intactos. Extrair o conteúdo da avaliação para dados declarativos, extrair a máquina de rodadas para um engine puro testável e deixar `EvaluationTrainingPage` apenas orquestrar estado, `recordAttempt` e componentes visuais isolados em `src/components/evaluation`. A camada “castelo” deve poder ser removida sem alterar correção matemática, persistência ou evidência de domínio.

**Tech Stack:** React 19, TypeScript 5.9, Vite 8, Vitest 4, Playwright 1.62, `@axe-core/playwright`, CSS atual do projeto, SVG React sem assets externos.

**Spec:** `docs/superpowers/specs/2026-10-05-hogwarts-memory-castle-design.md`

## Global Constraints

- Implementar sobre a base funcional do PR #19 / branch `hotfix/avaliacao-ifsp-2026-10-05`; não recriar a trilha da avaliação.
- A rota pública continua sendo `/avaliacao-ifsp`.
- A ordem mental fixa é: **Retratos → Escadaria → Ponte → Sala Precisa → Poções → Câmara**.
- A ordem matemática fixa é: **definição/contraexemplo → diagonais do paralelogramo → desigualdade triangular → mediana/altura → semelhança → isósceles + paralelas**.
- Demonstrações exibem `DADO → PROPRIEDADE → CONCLUSÃO`; aparência de figura nunca conta como hipótese.
- Ajuda tem três níveis: `1=Olhar`, `2=Ferramenta`, `3=Conexão`; `hintsUsed` conta apenas níveis realmente abertos e `hintTier` registra o maior nível aberto.
- O erro não bloqueia a trilha; apenas erradas retornam ao final da rodada; máximo de 3 rodadas.
- Persistência da avaliação continua local e separada do `geometria-rpg:progress:v4`.
- `recordAttempt` continua recebendo os `skillIds`, `masteryDimensions`, `hintsUsed`, `hintTier` e `position: '/avaliacao-ifsp'`.
- Sem login, backend, dependência nova ou asset externo/licenciado.
- Mobile-first, teclado, `aria-pressed`, touch targets existentes e zero overflow horizontal em 360/390/412 px.
- Nenhum conteúdo novo fora das seis famílias da avaliação entra neste plano.

## Review Focus

- **Sessão persistida corrompida, incompleta ou de versão anterior:** deve cair para uma sessão limpa sem crash nem fila inválida. Testar em Task 2.
- **IDs de questões removidos/renomeados depois de uma atualização:** restauração deve rejeitar filas com IDs desconhecidos e reiniciar com os seis IDs canônicos. Testar em Task 2.
- **Dicas abertas parcialmente:** `hintsUsed` deve ser 0/1/2/3 conforme uso real e `hintTier` deve ser omitido quando zero; nunca registrar dica por estar em “modo treino”. Testar em Task 4.
- **SVG/labels em telas estreitas:** figura, rótulos e mapa do castelo não podem produzir overflow ou esconder notação geométrica. Testar em Task 5.
- **Uso somente por teclado:** alternativas, V/F, âncoras da figura e níveis de pista precisam ser alcançáveis e operáveis sem mouse, com estado selecionado anunciado. Testar em Task 5.

---

## File Structure

### New files

- `src/data/evaluationCastle.ts` — tipos e conteúdo declarativo das seis salas, pistas, grimório e âncoras visuais.
- `src/data/evaluationCastle.test.ts` — integridade dos dados, ordem das salas, dependências do grimório e bindings de skills.
- `src/engine/evaluationSession.ts` — máquina pura de rodada/remediação/restauração.
- `src/engine/evaluationSession.test.ts` — ciclo de 1–3 rodadas, erros, reset lógico e persistência inválida.
- `src/components/evaluation/CastleRouteMap.tsx` — mapa linear das seis salas e estado atual/concluído/pendente.
- `src/components/evaluation/EvaluationCastleFigure.tsx` — SVG semântico por sala e seleção de âncoras matemáticas.
- `src/components/evaluation/ProofGrimoire.tsx` — renderização uniforme `DADO → PROPRIEDADE → CONCLUSÃO`.
- `src/components/evaluation/HintLadder.tsx` — abertura progressiva dos três níveis de pista.
- `tests/e2e/evaluation-castle.spec.ts` — fluxo real, acessibilidade, teclado, persistência, mobile e remediação.

### Modified files

- `src/pages/EvaluationTrainingPage.tsx` — substituir tipos/dados/máquina inline por imports, compor os quatro componentes e preservar o `recordAttempt`.
- `src/pages/evaluation-training.css` — estilos das salas, mapa, SVG, grimório e pistas; remover regras obsoletas da página antiga quando substituídas.
- `src/pages/TrainingPage.tsx` — atualizar somente a apresentação do card prioritário para “Castelo Mental da Avaliação”, mantendo o mesmo link `/avaliacao-ifsp`.

---

### Task 1: Extrair o conteúdo canônico das seis salas

**Files:**
- Create: `src/data/evaluationCastle.ts`
- Create: `src/data/evaluationCastle.test.ts`
- Modify: nenhum arquivo de runtime nesta tarefa

**Interfaces:**
- Consumes: `MasteryDimension` de `src/types/domain.ts`; IDs de skills já usados pelo PR #19.
- Produces:
  - `EvaluationRoomId`
  - `EvaluationFigureKind`
  - `EvaluationHint`
  - `EvaluationFigureAnchor`
  - `ProofGrimoireStep`
  - `EvaluationCastleQuestion`
  - `EVALUATION_CASTLE_QUESTIONS: EvaluationCastleQuestion[]`
  - `EVALUATION_ROOM_ORDER: EvaluationRoomId[]`
  - `validateEvaluationCastle(questions?: EvaluationCastleQuestion[]): string[]`

- [ ] **Step 1: Write the failing data-integrity tests in `src/data/evaluationCastle.test.ts`**

Assert all of the following:

```ts
expect(EVALUATION_CASTLE_QUESTIONS).toHaveLength(6);
expect(EVALUATION_CASTLE_QUESTIONS.map((q) => q.room.id)).toEqual([
  'portraits',
  'diagonal-staircase',
  'four-towers-bridge',
  'room-of-requirement',
  'potions-ramp',
  'isosceles-chamber',
]);
expect(validateEvaluationCastle()).toEqual([]);
```

Also assert:
- every question has exactly 3 hints with tiers `[1,2,3]`;
- every question has at least one figure anchor;
- every `skillId` exists in `skills` from `src/data/bootstrap.ts`;
- every grimório dependency points only to an earlier step;
- room 2 contains anchors for two angle relations and one opposite-side relation;
- room 5’s content stores `2+6=8` as the whole-ramp correction rather than accepting 6 as the corresponding whole side.

- [ ] **Step 2: Run the new test and verify it fails**

Run:

```bash
npm test -- src/data/evaluationCastle.test.ts
```

Expected: FAIL because `evaluationCastle.ts` does not exist.

- [ ] **Step 3: Implement the declarative contracts in `src/data/evaluationCastle.ts`**

Use these exact shapes:

```ts
export type EvaluationRoomId =
  | 'portraits'
  | 'diagonal-staircase'
  | 'four-towers-bridge'
  | 'room-of-requirement'
  | 'potions-ramp'
  | 'isosceles-chamber';

export type EvaluationFigureKind =
  | 'classification-gallery'
  | 'parallelogram-diagonals'
  | 'quadrilateral-diagonals'
  | 'cevian-construction'
  | 'ramp-similarity'
  | 'isosceles-parallelogram';

export interface EvaluationHint {
  tier: 1 | 2 | 3;
  label: 'Olhar' | 'Ferramenta' | 'Conexão';
  text: string;
}

export interface EvaluationFigureAnchor {
  id: string;
  label: string;
}

export interface ProofGrimoireStep {
  id: string;
  phase: 'given' | 'property' | 'conclusion';
  statement: string;
  dependsOn: string[];
}
```

Keep the existing PR #19 question IDs:
- `q1-vf`
- `q2-parallelogram`
- `q3-inequality`
- `q4-constructions`
- `q5-ramp`
- `q6-isosceles`

Add to each question:
- `room: { id, name, mnemonic }`
- `figure: { kind, anchors }`
- `hints: [tier1,tier2,tier3]`
- `grimoire: ProofGrimoireStep[]`

Preserve the current prompt/options/explanations/skill bindings from PR #19 unless the design requires only a wording clarification. Do not add new mathematical claims.

- [ ] **Step 4: Implement `validateEvaluationCastle()`**

It must return readable errors for:
- duplicate question IDs;
- duplicate room IDs;
- wrong room order;
- missing/duplicate hint tiers;
- missing anchors;
- unknown `skillIds`;
- grimório dependency on a missing or future step;
- missing `given`, `property`, or `conclusion` phase in a demonstrative question.

- [ ] **Step 5: Run the focused test**

Run:

```bash
npm test -- src/data/evaluationCastle.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/data/evaluationCastle.ts src/data/evaluationCastle.test.ts
git commit -m "feat: model IFSP evaluation castle content"
```

---

### Task 2: Extrair e endurecer a máquina de sessão

**Files:**
- Create: `src/engine/evaluationSession.ts`
- Create: `src/engine/evaluationSession.test.ts`
- Modify: nenhum arquivo React nesta tarefa

**Interfaces:**
- Consumes: lista canônica de question IDs passada pelo chamador.
- Produces:

```ts
export const EVALUATION_SESSION_STORAGE_KEY = 'geometria-rpg:avaliacao-ifsp:v2';
export const MAX_EVALUATION_ROUNDS = 3;

export interface EvaluationSessionState {
  queue: string[];
  index: number;
  round: number;
  missedThisRound: string[];
  attempts: Record<string, number>;
  done: boolean;
  unresolved: string[];
}

export function createEvaluationSession(questionIds: string[]): EvaluationSessionState;
export function restoreEvaluationSession(raw: string | null, questionIds: string[]): EvaluationSessionState;
export function markEvaluationResult(
  state: EvaluationSessionState,
  questionId: string,
  correct: boolean,
): EvaluationSessionState;
export function advanceEvaluationSession(state: EvaluationSessionState): EvaluationSessionState;
```

- [ ] **Step 1: Write the failing engine tests**

Cover these cases:

```ts
const ids = ['q1','q2','q3'];

expect(createEvaluationSession(ids)).toMatchObject({
  queue: ids,
  index: 0,
  round: 1,
  missedThisRound: [],
  done: false,
});

expect(markEvaluationResult(createEvaluationSession(ids), 'q1', false).missedThisRound)
  .toEqual(['q1']);
```

Also assert:
- marking the same wrong ID twice never duplicates `missedThisRound`;
- correct answers do not enter remediation;
- advancing before the end increments only `index`;
- end of round with misses sets `queue` to only missed IDs, increments `round`, clears `missedThisRound`, resets `index=0`;
- end of round with no misses sets `done=true`;
- third-round misses become `unresolved` and terminate;
- malformed JSON restores a fresh session;
- out-of-range `index`, round outside `1..3`, empty queue while not done, or unknown question IDs restores a fresh session;
- valid persisted state survives restoration unchanged.

- [ ] **Step 2: Run and verify failure**

Run:

```bash
npm test -- src/engine/evaluationSession.test.ts
```

Expected: FAIL because the engine does not exist.

- [ ] **Step 3: Implement the pure session engine**

No `window`, React or `localStorage` access inside the engine. `restoreEvaluationSession` receives the raw serialized value so it can be unit-tested deterministically.

Treat the `v1` storage key from PR #19 as legacy: the page may read it once as fallback, but all new writes use `EVALUATION_SESSION_STORAGE_KEY` v2. Do not mutate global progress storage.

- [ ] **Step 4: Run the focused test**

Run:

```bash
npm test -- src/engine/evaluationSession.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/evaluationSession.ts src/engine/evaluationSession.test.ts
git commit -m "refactor: isolate IFSP evaluation session engine"
```

---

### Task 3: Criar os componentes visuais do castelo sem acoplar matemática ao tema

**Files:**
- Create: `src/components/evaluation/CastleRouteMap.tsx`
- Create: `src/components/evaluation/EvaluationCastleFigure.tsx`
- Create: `src/components/evaluation/ProofGrimoire.tsx`
- Create: `src/components/evaluation/HintLadder.tsx`
- Create: `tests/e2e/evaluation-castle.spec.ts`
- Modify: `src/pages/evaluation-training.css`

**Interfaces:**
- Consumes: tipos de `src/data/evaluationCastle.ts`.
- Produces:

```ts
export function CastleRouteMap(props: {
  questions: EvaluationCastleQuestion[];
  activeQuestionId: string;
  completedQuestionIds: string[];
}): JSX.Element;

export function EvaluationCastleFigure(props: {
  kind: EvaluationFigureKind;
  anchors: EvaluationFigureAnchor[];
  selectedAnchorIds: string[];
  onToggleAnchor: (anchorId: string) => void;
}): JSX.Element;

export function ProofGrimoire(props: {
  steps: ProofGrimoireStep[];
}): JSX.Element;

export function HintLadder(props: {
  hints: EvaluationHint[];
  openedTier: 0 | 1 | 2 | 3;
  onOpenTier: (tier: 1 | 2 | 3) => void;
}): JSX.Element;
```

- [ ] **Step 1: Add the first failing Playwright scenario**

In `tests/e2e/evaluation-castle.spec.ts`, navigate to `/avaliacao-ifsp` and assert:
- six room labels are present in the route map;
- `Salão dos Retratos Mutáveis` is marked current on first load;
- the current question renders an SVG/figure with an accessible name;
- the grimório exposes the labels `DADO`, `PROPRIEDADE`, `CONCLUSÃO`;
- only `Olhar` is initially actionable; opening it reveals its text and enables `Ferramenta`, then `Conexão`.

Use roles/accessible names, not CSS selectors, for behavior assertions.

- [ ] **Step 2: Run that scenario and verify it fails**

Run:

```bash
npm run build
npm run test:e2e -- tests/e2e/evaluation-castle.spec.ts
```

Expected: FAIL because the castle components are not present.

- [ ] **Step 3: Implement `CastleRouteMap`**

Render an ordered list with all six rooms. Each item must expose one of:
- `aria-current="step"` for active;
- visible “concluída” state for rooms before the active room in the current first-pass order;
- neutral pending state for future rooms.

Do not make the map a second navigation system; it is a memory map, not a way to skip questions.

- [ ] **Step 4: Implement `ProofGrimoire`**

Render every step in order with its explicit phase label. Preserve mathematical notation as text; do not replace it with narrative wording.

If `steps` is empty for a classification/construction item, render the compact rule:
- `DADO`: o enunciado/definição;
- `PROPRIEDADE`: a ferramenta que decide;
- `CONCLUSÃO`: a classificação/construção correta.

- [ ] **Step 5: Implement `HintLadder`**

Rules:
- tier 1 always available;
- tier 2 enabled only after tier 1 is opened;
- tier 3 enabled only after tier 2 is opened;
- reopening a tier must not increment state again;
- buttons expose `aria-expanded`;
- component itself does not write progress or storage.

- [ ] **Step 6: Implement `EvaluationCastleFigure`**

Use inline SVG and semantic controls only; no external images.

Required figure kinds:
- `classification-gallery`: simple quadrilateral/triangle silhouettes with labels, never used as proof;
- `parallelogram-diagonals`: ABCD, diagonals AC/BD, intersection O, selectable relation anchors;
- `quadrilateral-diagonals`: ABCD with both diagonals and two alternative boundary paths;
- `cevian-construction`: △ABC with midpoint/perpendicular construction cues;
- `ramp-similarity`: small triangle nested along the same ramp, explicit labels 2, 6, 8, 1, h without giving the final proportion before feedback;
- `isosceles-parallelogram`: △ABC, P∈BC, parallels through P, D∈AC, E∈AB.

For `parallelogram-diagonals`, expose anchor buttons with `aria-pressed` for at least:
- `∠BAO ↔ ∠DCO`;
- `∠ABO ↔ ∠CDO`;
- `AB ↔ CD`.

The SVG highlight follows the selected anchor IDs; selecting anchors does not itself mark the question correct.

- [ ] **Step 7: Add the component styles**

In `src/pages/evaluation-training.css` add focused classes for:
- `.castle-route`
- `.castle-room-marker`
- `.evaluation-figure`
- `.evaluation-anchor-list`
- `.proof-grimoire`
- `.hint-ladder`

Keep geometric labels at readable sizes and use `vector-effect: non-scaling-stroke` on figure strokes. Avoid fixed widths wider than the page.

- [ ] **Step 8: Re-run the focused E2E**

Run:

```bash
npm run build
npm run test:e2e -- tests/e2e/evaluation-castle.spec.ts
```

Expected: the new “castle shell” scenario passes.

- [ ] **Step 9: Commit**

```bash
git add src/components/evaluation src/pages/evaluation-training.css tests/e2e/evaluation-castle.spec.ts
git commit -m "feat: add evaluation memory castle UI"
```

---

### Task 4: Refatorar a página da avaliação para usar dados, engine, figuras e pistas reais

**Files:**
- Modify: `src/pages/EvaluationTrainingPage.tsx`
- Modify: `src/pages/TrainingPage.tsx`
- Modify: `tests/e2e/evaluation-castle.spec.ts`

**Interfaces:**
- Consumes:
  - `EVALUATION_CASTLE_QUESTIONS`
  - `restoreEvaluationSession`, `markEvaluationResult`, `advanceEvaluationSession`
  - quatro componentes de `src/components/evaluation`
  - `useProgress().recordAttempt`
- Produces: a mesma rota `/avaliacao-ifsp` e o mesmo contrato externo do PR #19.

- [ ] **Step 1: Extend the E2E with a failing end-to-end learning-flow test**

Scenario:
1. open `/avaliacao-ifsp`;
2. answer Q1 correctly without hints;
3. advance to Q2;
4. assert current room is `Escadaria das Diagonais`;
5. toggle the angle-pair and opposite-side anchors;
6. open exactly tiers 1 and 2;
7. choose the correct Q2 answer;
8. inspect `geometria-rpg:progress:v4` and assert the last Q2 attempt has:
   - `encounterId === 'assessment-ifsp-2026'`;
   - `stepId === 'q2-parallelogram'`;
   - `hintsUsed === 2`;
   - `hintTier === 2`;
   - `position === '/avaliacao-ifsp'`.

Add a companion assertion for a no-hint question: Q1 must record `hintsUsed === 0` and no nonzero hint tier.

- [ ] **Step 2: Run and verify failure**

Run:

```bash
npm run build
npm run test:e2e -- tests/e2e/evaluation-castle.spec.ts
```

Expected: FAIL until the page uses the new state.

- [ ] **Step 3: Replace inline question types/data in `EvaluationTrainingPage.tsx`**

Delete the local `BaseQuestion`, `SingleQuestion`, `MultiQuestion`, `EvaluationQuestion` and `QUESTIONS` definitions.

Import them from `../data/evaluationCastle`.

Keep answer state local to the page.

- [ ] **Step 4: Replace inline session logic with `evaluationSession.ts`**

Initialize with:
- v2 key first;
- if absent, optionally read the PR #19 v1 key once;
- pass serialized content through `restoreEvaluationSession`;
- write only v2 thereafter.

Delete local `SessionState`, `initialSession`, `readSession`, and `MAX_ROUNDS`.

- [ ] **Step 5: Track castle-only UI state without contaminating the session engine**

Page-local state:
- `openedHintTier: 0 | 1 | 2 | 3`;
- `selectedAnchorIds: string[]`.

On room advance/reset:
- clear answers;
- clear feedback;
- reset `openedHintTier=0`;
- reset anchors to `[]`.

- [ ] **Step 6: Preserve `recordAttempt` semantics with real hint usage**

On submit call:

```ts
recordAttempt(
  'assessment-ifsp-2026',
  question.id,
  selectedIds,
  correct,
  [],
  {
    skillIds: question.skillIds,
    masteryDimensions: question.masteryDimensions,
    hintsUsed: openedHintTier,
    hintTier: openedHintTier > 0 ? openedHintTier : undefined,
    position: '/avaliacao-ifsp',
  },
);
```

Then update session through `markEvaluationResult`.

Do not record anchor selection as correctness or mastery evidence.

- [ ] **Step 7: Compose the room UI**

Order inside the active card:
1. room identity / mnemonic;
2. `CastleRouteMap`;
3. `EvaluationCastleFigure`;
4. prompt and response controls;
5. `ProofGrimoire`;
6. `HintLadder`;
7. feedback;
8. advance action.

For Q2, keep the figure above the answer choices so the student can inspect the relations without scrolling past the problem statement on common mobile heights.

- [ ] **Step 8: Update the Training page entry card only**

Change the priority card title/copy to communicate:
- “Castelo Mental da Avaliação”;
- six rooms = six families;
- same CTA route `/avaliacao-ifsp`.

Do not change filters, other training items, or navigation.

- [ ] **Step 9: Re-run unit + focused E2E**

Run:

```bash
npm test -- src/data/evaluationCastle.test.ts src/engine/evaluationSession.test.ts
npm run build
npm run test:e2e -- tests/e2e/evaluation-castle.spec.ts
```

Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add src/pages/EvaluationTrainingPage.tsx src/pages/TrainingPage.tsx tests/e2e/evaluation-castle.spec.ts
git commit -m "feat: integrate memory castle into IFSP evaluation"
```

---

### Task 5: Fechar remediação, persistência, teclado, axe e mobile

**Files:**
- Modify: `tests/e2e/evaluation-castle.spec.ts`
- Modify: `src/pages/evaluation-training.css` only if the tests expose an actual layout/accessibility defect

**Interfaces:**
- Consumes: finished route `/avaliacao-ifsp`.
- Produces: acceptance coverage for the design’s DoD.

- [ ] **Step 1: Add the failing remediation-cycle E2E**

Build a deterministic run:
- answer Q1 wrong;
- answer Q2–Q6 correctly;
- after Q6, assert round 2 contains only Q1;
- answer Q1 wrong in rounds 2 and 3;
- assert the session ends after round 3;
- assert unresolved section names only Q1;
- assert there is no fourth round and no loop.

- [ ] **Step 2: Add the failing persistence E2E**

- reach Q3 in round 1;
- reload;
- assert room, queue, round and progress indicator remain on Q3;
- corrupt `geometria-rpg:avaliacao-ifsp:v2` manually;
- reload;
- assert the page recovers at Q1 rather than crashing.

- [ ] **Step 3: Add keyboard-only E2E coverage**

Using `page.keyboard`:
- tab to a V/F choice and activate with Space/Enter;
- tab to an anchor button and toggle it;
- tab through Olhar → Ferramenta → Conexão respecting progressive enablement;
- submit and advance without pointer clicks.

Assert selected controls expose `aria-pressed="true"` or `aria-expanded="true"` as appropriate.

- [ ] **Step 4: Add axe coverage for `/avaliacao-ifsp`**

Run `AxeBuilder({ page }).withTags(['wcag2a','wcag2aa'])`.

Expected: no serious or critical violations.

Keep this in `evaluation-castle.spec.ts`; do not enlarge the global route loop unless useful during implementation.

- [ ] **Step 5: Add mobile layout checks**

For widths `360`, `390`, `412` at height `844`:
- navigate to Q2 or seed session storage to Q2;
- assert `document.documentElement.scrollWidth - clientWidth <= 1`;
- assert the SVG is fully inside the viewport width;
- assert anchor buttons and primary actions have a bounding-box height of at least 42 px;
- assert no room label is clipped from the route map.

- [ ] **Step 6: Run the focused acceptance suite**

Run:

```bash
npm run build
npm run test:e2e -- tests/e2e/evaluation-castle.spec.ts
```

Expected: PASS.

- [ ] **Step 7: Run the project regression gates**

Run:

```bash
npm run lint
npm test
npm run build
npm run test:e2e
```

Expected: all PASS. If Playwright infrastructure is unavailable, record the concrete infrastructure error and do not convert that into a pass.

- [ ] **Step 8: Commit**

```bash
git add tests/e2e/evaluation-castle.spec.ts src/pages/evaluation-training.css
git commit -m "test: verify IFSP evaluation castle end to end"
```

---

### Task 6: Revisão final e integração segura

**Files:**
- Modify: only files required by review findings
- Reference: `docs/superpowers/specs/2026-10-05-hogwarts-memory-castle-design.md`
- Reference: this plan

**Interfaces:**
- Consumes: completed implementation and all test evidence.
- Produces: branch ready for review/PR; no automatic merge.

- [ ] **Step 1: Verify spec coverage manually**

Check each acceptance criterion in the spec:
- single route;
- six stable locations;
- unique spatial anchor per room;
- DADO → PROPRIEDADE → CONCLUSÃO;
- no inference from appearance;
- narrative removable without changing math;
- no loop;
- evidence via `recordAttempt`;
- mobile + keyboard;
- mental sequence recoverable.

Record any gap as a code/test change before continuing.

- [ ] **Step 2: Run the full gate once more after any review fixes**

Run:

```bash
npm run qa
```

Expected: PASS.

- [ ] **Step 3: Inspect the diff against `hotfix/avaliacao-ifsp-2026-10-05`**

Confirm there are no unrelated changes to:
- adaptive engine;
- global progress schema;
- other campaigns/labs;
- auth/backend;
- deployment config.

- [ ] **Step 4: Commit review fixes if any**

```bash
git add <only reviewed files>
git commit -m "fix: close evaluation castle review findings"
```

Skip this commit if there are no changes.

- [ ] **Step 5: Prepare review handoff**

Report:
- final branch name;
- final HEAD;
- exact commands run and their results;
- whether browser/E2E executed successfully;
- remaining known limitations, if any;
- no claim of deploy/merge unless separately performed and verified.
