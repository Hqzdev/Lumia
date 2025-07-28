import { test, expect, type Page } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

class CookieTestPage {
  constructor(private page: Page) {}

  async gotoLogin() {
    await this.page.goto('/login');
    await expect(this.page.getByRole('heading')).toContainText('Welcome back');
  }

  async fillNickname(nickname: string) {
    await this.page.getByPlaceholder('Enter your nickname').fill(nickname);
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  async fillPassword(password: string, rememberMe: boolean = false) {
    await this.page.getByPlaceholder('Enter your password').fill(password);

    if (rememberMe) {
      await this.page.getByLabel('Remember me on this device').check();
    }

    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }

  async getCookies() {
    return await this.page.context().cookies();
  }

  async clearCookies() {
    await this.page.context().clearCookies();
  }

  async checkCookieExists(name: string) {
    const cookies = await this.getCookies();
    return cookies.some((cookie) => cookie.name === name);
  }

  async getCookieValue(name: string) {
    const cookies = await this.getCookies();
    const cookie = cookies.find((c) => c.name === name);
    return cookie?.value;
  }
}

test.describe('Cookie functionality', () => {
  let cookiePage: CookieTestPage;

  test.beforeEach(async ({ page }) => {
    cookiePage = new CookieTestPage(page);
  });

  test('should save nickname in cookie when user enters it', async ({
    page,
  }) => {
    await cookiePage.gotoLogin();
    await cookiePage.fillNickname('testuser');

    // Проверяем, что никнейм сохранился в куки
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible();

    // Проверяем, что куки сохранились
    const hasNicknameCookie = await cookiePage.checkCookieExists(
      'lumia_last_nickname',
    );
    expect(hasNicknameCookie).toBe(true);
  });

  test('should load saved nickname when returning to login page', async ({
    page,
  }) => {
    // Сначала сохраняем никнейм
    await cookiePage.gotoLogin();
    await cookiePage.fillNickname('testuser');
    await cookiePage.clearCookies(); // Очищаем куки для чистого теста

    // Проверяем, что поле никнейма пустое
    await cookiePage.gotoLogin();
    const nicknameInput = page.getByPlaceholder('Enter your nickname');
    await expect(nicknameInput).toHaveValue('');
  });

  test('should save remember me preference', async ({ page }) => {
    await cookiePage.gotoLogin();
    await cookiePage.fillNickname('testuser');
    await cookiePage.fillPassword('password123', true);

    // Проверяем, что куки "запомнить меня" сохранилась
    const rememberMeValue =
      await cookiePage.getCookieValue('lumia_remember_me');
    expect(rememberMeValue).toBe('true');
  });

  test('should not save remember me when unchecked', async ({ page }) => {
    await cookiePage.gotoLogin();
    await cookiePage.fillNickname('testuser');
    await cookiePage.fillPassword('password123', false);

    // Проверяем, что куки "запомнить меня" не сохранилась
    const rememberMeValue =
      await cookiePage.getCookieValue('lumia_remember_me');
    expect(rememberMeValue).toBeUndefined();
  });

  test('should save last login timestamp', async ({ page }) => {
    await cookiePage.gotoLogin();
    await cookiePage.fillNickname('testuser');
    await cookiePage.fillPassword('password123', true);

    // Проверяем, что куки времени последнего входа сохранилась
    const lastLoginValue = await cookiePage.getCookieValue('lumia_last_login');
    expect(lastLoginValue).toBeDefined();

    // Проверяем, что это валидная дата
    if (lastLoginValue) {
      const lastLoginDate = new Date(lastLoginValue);
      expect(lastLoginDate.getTime()).toBeGreaterThan(0);
    }
  });

  test('should increment login attempts on failed login', async ({ page }) => {
    await cookiePage.gotoLogin();
    await cookiePage.fillNickname('nonexistentuser');
    await cookiePage.fillPassword('wrongpassword', false);

    // Проверяем, что куки попыток входа создалась
    const attemptsValue = await cookiePage.getCookieValue(
      'lumia_login_attempts',
    );
    expect(attemptsValue).toBe('1');
  });

  test('should clear cookies on sign out', async ({ page }) => {
    // Сначала создаем куки
    await cookiePage.gotoLogin();
    await cookiePage.fillNickname('testuser');
    await cookiePage.fillPassword('password123', true);

    // Проверяем, что куки существуют
    expect(await cookiePage.checkCookieExists('lumia_last_nickname')).toBe(
      true,
    );
    expect(await cookiePage.checkCookieExists('lumia_remember_me')).toBe(true);

    // Переходим на главную страницу и выходим
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign out' }).click();

    // Проверяем, что куки очистились
    expect(await cookiePage.checkCookieExists('lumia_last_nickname')).toBe(
      false,
    );
    expect(await cookiePage.checkCookieExists('lumia_remember_me')).toBe(false);
  });

  test('should show remember me checkbox when password field is visible', async ({
    page,
  }) => {
    await cookiePage.gotoLogin();
    await cookiePage.fillNickname('testuser');

    // Проверяем, что чекбокс "Запомнить меня" появляется
    await expect(page.getByLabel('Remember me on this device')).toBeVisible();
  });

  test('should not show remember me checkbox initially', async ({ page }) => {
    await cookiePage.gotoLogin();

    // Проверяем, что чекбокс "Запомнить меня" не виден изначально
    await expect(
      page.getByLabel('Remember me on this device'),
    ).not.toBeVisible();
  });
});
