import { expect, test } from '@playwright/test';

test.describe('experiência pública', () => {
  test('landing desktop mantém a composição principal', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'Cenário exclusivo do viewport desktop.');
    await page.goto('/');
    await expect(page).toHaveTitle(/OAB Legacy/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('main')).toHaveScreenshot('landing-desktop.png', { fullPage: true });
  });

  test('skip link permite pular diretamente para o conteúdo', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.locator('a[href="#conteudo"]');
    await expect(skipLink).toHaveCount(1);
    await skipLink.focus();
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toHaveText(/Pular para o conteúdo/i);
    await skipLink.click();
    await expect(page.locator('#conteudo')).toBeInViewport();
  });

  test('landing mobile abre e fecha o menu acessível', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-mobile', 'Cenário exclusivo do viewport mobile.');
    await page.goto('/');
    const menuButton = page.getByRole('button', { name: 'Abrir menu' });
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    await expect(page.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mobile-nav-panel')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#mobile-nav-panel')).toHaveCount(0);
    await expect(page.locator('main')).toHaveScreenshot('landing-mobile.png', { fullPage: true });
  });

  test('login exibe o formulário essencial', async ({ page }) => {
    await page.goto('/entrar');
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
    await expect(page).toHaveScreenshot('login.png', { fullPage: true });
  });
});
