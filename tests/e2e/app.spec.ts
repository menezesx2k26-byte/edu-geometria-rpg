import { test, expect } from "@playwright/test";
const key = "geometria-rpg-progress-v2";
async function enter(page: import("@playwright/test").Page, area: string) {
  await page.locator('[data-progress-ready="true"]').waitFor();
  await page.getByRole("button", { name: area, exact: true }).click();
  await expect(page.locator(".bottom-nav button.is-active")).toHaveText(area);
}
async function answer(page: import("@playwright/test").Page) {
  await page
    .locator('[data-testid="training-question"] .options button')
    .first()
    .click();
  await expect(page.getByRole("status")).toBeVisible();
}
test("training queue survives reload, reentry and respects history across sessions", async ({
  page,
}) => {
  await page.goto("/");
  await enter(page, "Treino");
  const ids: string[] = [];
  let initial = "";
  for (let i = 0; i < 10; i++) {
    const card = page.getByTestId("training-question");
    await expect(card).toBeVisible();
    const id = (await card.getAttribute("data-question-id"))!;
    expect(ids).not.toContain(id);
    ids.push(id);
    if (i === 2) {
      initial = (await page.evaluate((k) => localStorage.getItem(k), key))!;
      await page.reload();
      await expect(page.getByTestId("training-question")).toHaveAttribute(
        "data-question-id",
        id,
      );
      await enter(page, "Mapa");
      await enter(page, "Treino");
      await expect(page.getByTestId("training-question")).toHaveAttribute(
        "data-question-id",
        id,
      );
    }
    await answer(page);
    if (i === 3) {
      await page.reload();
      await expect(card.locator(".options button").first()).toBeDisabled();
    }
    await page.getByTestId("training-next").click();
  }
  expect(initial).toBeTruthy();
  await expect(page.getByTestId("training-complete")).toBeVisible();
  await page.getByRole("button", { name: "Iniciar nova sessão" }).click();
  const stored = await page.evaluate(
    (k) => JSON.parse(localStorage.getItem(k)!),
    key,
  );
  const previousUnseen = stored.trainingSession.queue.filter(
    (e: { questionId: string }) => !ids.includes(e.questionId),
  );
  expect(previousUnseen.length).toBeGreaterThan(0);
  // Wrong answers may legitimately outrank novelty. Unseen items must still enter the next queue.
  await page.reload();
  await expect(page.getByTestId("training-question")).toBeVisible();
});
test("lesson study is separate from mathematical mastery and unlocks reading", async ({
  page,
}) => {
  await page.goto("/");
  await enter(page, "Aula");
  await page.getByRole("button", { name: "Marcar como estudada" }).click();
  const p = await page.evaluate(
    (k) => JSON.parse(localStorage.getItem(k)!),
    key,
  );
  expect(p.mastery.fundamentals ?? 0).toBe(0);
  expect(p.studiedSkills).toContain("fundamentals");
  await expect(
    page.getByRole("button", { name: "Segmentos e ângulos", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Seção estudada" }),
  ).toBeVisible();
});
test("migration retains v1 byte-for-byte and resumes legacy mastery", async ({
  page,
}) => {
  const legacy = JSON.stringify({
    mastery: { fundamentals: 45 },
    studiedSections: ["fundamentals"],
    questions: { "q-drawing": { attempts: 2, correct: 1 } },
    proofAttempts: {},
    lastSection: "fundamentals",
    updatedAt: "2026-01-01",
  });
  await page.addInitScript(
    ({ legacy }) => {
      if (!localStorage.getItem("geometria-rpg-progress-v1"))
        localStorage.setItem("geometria-rpg-progress-v1", legacy);
    },
    { legacy },
  );
  await page.goto("/");
  await enter(page, "Treino");
  const p = await page.evaluate(
    (k) => JSON.parse(localStorage.getItem(k)!),
    key,
  );
  expect(p.mastery.fundamentals).toBe(45);
  expect(p.questions["q-drawing"].attempts).toBe(2);
  expect(
    await page.evaluate(() =>
      localStorage.getItem("geometria-rpg-progress-v1"),
    ),
  ).toBe(legacy);
});
test("all six areas, browser navigation, touch controls and layout", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  for (const area of [
    "Mapa",
    "Aula",
    "Treino",
    "Provas",
    "Exercícios",
    "Revisão",
  ]) {
    await enter(page, area);
    await expect(page.locator("main h1").first()).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    expect(overflow, area).toBe(false);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      animations: "disabled",
      path: `audit/evidence/${info.project.name}-${area}.png`,
      fullPage: true,
    });
    const nav = await page.locator(".bottom-nav").boundingBox();
    expect(nav).toBeTruthy();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const buttons = page.locator("main button:visible");
    for (let i = 0; i < (await buttons.count()); i++) {
      const box = await buttons.nth(i).boundingBox();
      if (
        box &&
        box.y >= 0 &&
        box.y + box.height < info.project.use.viewport!.height
      ) {
        expect(box.height, area).toBeGreaterThanOrEqual(40);
      }
    }
  }
  await page.goBack();
  await expect(page).toHaveURL(/#exercises/);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Exercícios da lousa", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("proof accepts swapped independent hypotheses and does not reward repeated verify", async ({
  page,
}) => {
  await page.goto("/#proofs");
  await page.locator('[data-progress-ready="true"]').waitFor();
  await page.getByRole("button", { name: "Treinar prova" }).click();
  for (const id of ["opv-2", "opv-1", "opv-3"]) {
    for (let i = 0; i < 3; i++) {
      const row = page.locator(`[data-step-id="${id}"]`);
      const up = row.getByRole("button", { name: /para cima/ });
      if (await up.isEnabled()) await up.click();
    }
  }
  // Set a valid dependency order using visible moves (not injected application state).
  const desired = ["opv-2", "opv-1", "opv-3", "opv-4"];
  for (let target = 0; target < desired.length; target++) {
    let order = await page
      .locator("[data-step-id]")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-step-id")));
    while (order.indexOf(desired[target]) > target) {
      await page
        .locator(`[data-step-id="${desired[target]}"]`)
        .getByRole("button", { name: /para cima/ })
        .click();
      order = await page
        .locator("[data-step-id]")
        .evaluateAll((nodes) =>
          nodes.map((n) => n.getAttribute("data-step-id")),
        );
    }
  }
  await page.getByRole("button", { name: "Verificar prova" }).click();
  await expect(page.getByRole("status")).toContainText("cadeia é válida");
  await expect(
    page.getByRole("button", { name: "Verificar prova" }),
  ).toBeDisabled();
  const p = await page.evaluate(
    (k) => JSON.parse(localStorage.getItem(k)!),
    key,
  );
  expect(p.proofAttempts["vertical-angles-proof"].attempts).toBe(1);
});
test("malformed storage remains recoverable and produces a visible message", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("corruption-fixture")) {
      localStorage.setItem("geometria-rpg-progress-v2", "{broken");
      localStorage.setItem("corruption-fixture", "1");
    }
  });
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("preservado");
  const backup = await page.evaluate(() =>
    Object.keys(localStorage)
      .filter((k) => k.startsWith("geometria-rpg-progress-v2-backup"))
      .map((k) => localStorage.getItem(k)),
  );
  expect(backup).toContain("{broken");
  await enter(page, "Treino");
  await expect(page.getByTestId("training-question")).toBeVisible();
});

test("unknown newer schema is preserved even when training starts", async ({
  page,
}) => {
  const future = JSON.stringify({
    schemaVersion: 99,
    mastery: { fundamentals: 90 },
  });
  await page.addInitScript(
    (future) => localStorage.setItem("geometria-rpg-progress-v2", future),
    future,
  );
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("versão mais recente");
  await enter(page, "Treino");
  expect(
    await page.evaluate(() =>
      localStorage.getItem("geometria-rpg-progress-v2"),
    ),
  ).toBe(future);
});
test("every exercise step remains answerable and all proof selectors render", async ({
  page,
}) => {
  await page.goto("/");
  await enter(page, "Exercícios");
  for (const title of ["O encontro das duas lâminas", "O selo do vértice F"]) {
    await page.getByRole("button", { name: new RegExp(title) }).click();
    const total = title.includes("lâminas") ? 6 : 5;
    for (let i = 0; i < total; i++) {
      await page.locator(".quest-step .option").first().click();
      await expect(page.locator(".quest-step .feedback")).toBeVisible();
      await page.locator(".quest-step .button--primary").click();
    }
    await expect(page.locator(".quest-complete")).toBeVisible();
    await page.getByRole("button", { name: "Resolver novamente" }).click();
    await expect(page.locator(".quest-step")).toBeVisible();
  }
  await enter(page, "Provas");
  const selectors = page.locator(".proof-selector button");
  for (let i = 0; i < (await selectors.count()); i++) {
    await selectors.nth(i).click();
    await page.getByRole("button", { name: "Mostrar tudo" }).click();
    await expect(page.locator(".proof-path li").first()).toBeVisible();
  }
});

test("closing and reopening the page retains answer and queue", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await enter(page, "Treino");
  const id = await page
    .getByTestId("training-question")
    .getAttribute("data-question-id");
  await answer(page);
  await page.close();
  const reopened = await context.newPage();
  await reopened.goto("/#training");
  await expect(reopened.getByTestId("training-question")).toHaveAttribute(
    "data-question-id",
    id!,
  );
  await expect(
    reopened.locator('[data-testid="training-question"] .option').first(),
  ).toBeDisabled();
  await reopened.getByTestId("training-next").click();
  await expect(reopened.getByTestId("training-question")).not.toHaveAttribute(
    "data-question-id",
    id!,
  );
});

test("invalid saved queue is backed up while compatible mastery is recovered", async ({
  page,
}) => {
  await page.goto("/");
  await enter(page, "Treino");
  const corrupt = await page.evaluate((key) => {
    const p = JSON.parse(localStorage.getItem(key)!);
    p.mastery.fundamentals = 37;
    p.trainingSession.index = p.trainingSession.queue.length;
    p.trainingSession.completed = false;
    const raw = JSON.stringify(p);
    localStorage.setItem(key, raw);
    return raw;
  }, key);
  await page.reload();
  await expect(page.getByRole("alert")).toContainText("preservado");
  await expect(page.getByTestId("training-question")).toBeVisible();
  const p = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    key,
  );
  expect(p.mastery.fundamentals).toBe(37);
  expect(p.trainingSession.index).toBe(0);
  const backups = await page.evaluate(() =>
    Object.keys(localStorage)
      .filter((k) => k.startsWith("geometria-rpg-progress-v2-backup"))
      .map((k) => localStorage.getItem(k)),
  );
  expect(backups).toContain(corrupt);
});

test("all thirteen skills and shared lesson checkpoints unlock without granting mastery", async ({
  page,
}) => {
  await page.goto("/");
  await enter(page, "Aula");
  const chapters = [
    "Fundamentos",
    "Segmentos e ângulos",
    "Triângulos",
    "Congruência",
    "LAL",
    "Isósceles",
    "ALA",
    "2 ângulos ⇒ isósceles",
    "LLL",
    "Cevianas",
    "Três cevianas",
    "Resultado especial",
    "Ângulo externo",
  ];
  for (const chapter of chapters) {
    await page
      .locator(".chapter-tabs")
      .getByRole("button", { name: chapter, exact: true })
      .click();
    await page
      .getByRole("button", { name: "Marcar como estudada", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Seção estudada", exact: true }),
    ).toBeVisible();
  }
  const p = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    key,
  );
  expect(p.studiedSkills.length).toBe(13);
  expect(Object.values(p.mastery).every((value) => value === 0)).toBe(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Ângulo externo", exact: true }),
  ).toBeVisible();
});
