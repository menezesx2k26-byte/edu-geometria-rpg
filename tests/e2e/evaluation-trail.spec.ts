import { expect, test, type Page } from '@playwright/test';
import { getEvaluationSteps } from '../../app/content/evaluationTrail';
const key = 'geometria-rpg-progress-v2';
async function stored(page: Page) { return page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? '{}'), key); }
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

test(`complete IFSP campaign with persistence, mastery and transfer`, async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const width = (testInfo.project.use.viewport as { width: number }).width;
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/#map');
  await page.getByRole('link', { name: /1ª Avaliação.*Treino da avaliação/ }).click();
  await expect(page.getByRole('heading', { name: 'Fundamentos sob pressão', exact: true })).toBeVisible();
  expect((await stored(page)).questions).toEqual({});
  const seen: string[] = [];
  for (let node = 0; node < 6; node += 1) {
    await expect(page.getByRole('button', { name: 'Começar prática' })).toBeVisible();
    await noOverflow(page);
    if (width === 360) await page.screenshot({ path: testInfo.outputPath(`node-${node}-content.png`), fullPage: true });
    await page.getByRole('button', { name: 'Começar prática' }).click();
    for (let variant = 0; variant < 2; variant += 1) {
      for (const step of getEvaluationSteps(node, variant)) {
        await expect(page.getByTestId('evaluation-workbench')).toHaveAttribute('data-challenge-id', step.id);
        expect(seen).not.toContain(step.id);
        seen.push(step.id);
        if (step.kind === 'number') await page.getByRole('textbox', { name: 'Resposta em metros' }).fill(step.answer[0]!);
        else for (const answer of step.answer) await page.getByRole('button', { name: answer, exact: true }).click();
        if (node === 0 && variant === 0 && step.id.endsWith(':0')) {
          const before = await stored(page);
          await page.reload();
          await expect(page.getByRole('button', { name: step.answer[0]!, exact: true })).toHaveAttribute('aria-pressed', 'true');
          expect((await stored(page)).evaluationSession.sessionId).toBe(before.evaluationSession.sessionId);
        }
        await page.getByRole('button', { name: step.kind === 'construction' ? 'Realizar construção' : 'Validar resposta', exact: true }).click();
        await expect(page.getByText('Passo validado', { exact: true })).toBeVisible();
        await noOverflow(page);
        if (node === 1 && variant === 0 && step.effect === 'altitude' && width === 360)
          await page.screenshot({ path: testInfo.outputPath('median-altitude-constructed.png'), fullPage: true });
        if (node === 4 && variant === 0 && step.effect === 'height') await expect(page.getByRole('status')).toContainText('=4 m');
        if (node === 0 && variant === 0 && step.id.endsWith(':0')) {
          const before = await stored(page);
          await page.reload();
          await expect(page.getByText('Passo validado', { exact: true })).toBeVisible();
          expect((await stored(page)).evaluationSession.attempts).toHaveLength(before.evaluationSession.attempts.length);
          expect((await stored(page)).evaluationSession.recentlySeenChallengeIds).toEqual(before.evaluationSession.recentlySeenChallengeIds);
        }
        await page.getByRole('button', { name: 'Próxima', exact: true }).click();
      }
    }
    await expect(page.getByRole('heading', { name: /^Checkpoint:/ })).toBeVisible();
    await expect(page.getByText('Seção concluída 100% · Domínio 100%', { exact: true })).toBeVisible();
    if (node === 5) {
      await page.getByText('Ver a prova construída na transferência', { exact: true }).click();
      await expect(page.getByText('Perímetro=2RS=RS+RT, pois RS=RT', { exact: false }).first()).toBeVisible();
    }
    if (width === 360) await page.screenshot({ path: testInfo.outputPath(`node-${node}-checkpoint.png`), fullPage: true });
    await page.getByRole('button', { name: node === 5 ? 'Concluir trilha' : 'Próxima habilidade', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'Trilha concluída', exact: true })).toBeVisible();
  await expect(page.getByTestId('mastery-metric')).toHaveText('100%');
  const result = await stored(page);
  expect(result.evaluationSession.completedNodeIds).toHaveLength(6);
  expect(result.evaluationSession.attempts).toHaveLength(seen.length);
  expect(result.evaluationSession.attempts.every((attempt: { hintsUsed: number }) => attempt.hintsUsed === 0)).toBe(true);
  expect(Object.values(result.mastery).some((mastery: unknown) => Number(mastery) > 0)).toBe(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Trilha concluída', exact: true })).toBeVisible();
  expect((await stored(page)).evaluationSession.attempts).toHaveLength(seen.length);
  expect(errors).toEqual([]);
});

test('V/F requires a reason, hints persist before submission, opening grants no evidence', async ({ page }) => {
  await page.goto('/#avaliacao-ifsp');
  await page.getByRole('button', { name: 'Começar prática' }).click();
  await page.getByRole('button', { name: 'Verdadeiro', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Validar resposta', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Pedir uma dica', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: getEvaluationSteps(0, 0)[0]!.answer[1]!, exact: true }).click();
  await page.getByRole('button', { name: 'Validar resposta' }).click();
  const state = await stored(page);
  expect(state.evaluationSession.attempts.at(-1).hintsUsed).toBe(1);
  expect(state.evaluationSession.attempts.at(-1).independence).toBeLessThan(1);
  expect(state.evaluationSession.attempts.at(-1).response).toHaveLength(2);
});
