import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('memory castle exposes six rooms, figure, grimoire and progressive hints', async ({ page }) => {
  await page.goto('/avaliacao-ifsp');

  for (const room of [
    'Salão dos Retratos Mutáveis',
    'Escadaria das Diagonais',
    'Ponte das Quatro Torres',
    'Sala Precisa das Cevianas',
    'Aula de Poções da Rampa',
    'Câmara do Paralelogramo Isósceles',
  ]) {
    await expect(page.getByText(room, { exact: true })).toBeVisible();
  }

  await expect(page.getByText('Salão dos Retratos Mutáveis', { exact: true }).first()).toHaveAttribute('aria-current', 'step');
  await expect(page.getByRole('img', { name: /figura geométrica/i })).toBeVisible();
  await expect(page.getByText('DADO', { exact: true })).toBeVisible();
  await expect(page.getByText('PROPRIEDADE', { exact: true })).toBeVisible();
  await expect(page.getByText('CONCLUSÃO', { exact: true })).toBeVisible();

  const look = page.getByRole('button', { name: /^Olhar/ });
  const tool = page.getByRole('button', { name: /^Ferramenta/ });
  const connection = page.getByRole('button', { name: /^Conexão/ });

  await expect(look).toBeEnabled();
  await expect(tool).toBeDisabled();
  await expect(connection).toBeDisabled();

  await look.click();
  await expect(look).toHaveAttribute('aria-expanded', 'true');
  await expect(tool).toBeEnabled();

  await tool.click();
  await expect(tool).toHaveAttribute('aria-expanded', 'true');
  await expect(connection).toBeEnabled();

  await connection.click();
  await expect(connection).toHaveAttribute('aria-expanded', 'true');
});

test('evaluation castle route has no serious or critical axe violations', async ({ page }) => {
  await page.goto('/avaliacao-ifsp');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
});
