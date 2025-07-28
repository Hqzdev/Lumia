#!/usr/bin/env node

/**
 * Скрипт для тестирования кросс-доменной аутентификации
 *
 * Использование:
 * node scripts/test-auth.js
 */

const https = require('node:https');
const http = require('node:http');

// Конфигурация
const config = {
  authDomain: 'auth.lumiaai.ru',
  chatDomain: 'chat.lumiaai.ru',
  testUser: {
    email: 'test@example.com',
    nickname: 'testuser',
    password: 'testpassword123',
  },
};

// Утилиты для HTTP запросов
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;

    const req = client.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
          });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// Тесты
async function testAuthFlow() {
  console.log('🧪 Тестирование кросс-доменной аутентификации\n');

  try {
    // 1. Тест регистрации
    console.log('1. Тестирование регистрации...');
    const registerResponse = await makeRequest(
      `https://${config.authDomain}/api/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config.testUser),
      },
    );

    if (registerResponse.status === 200) {
      console.log('✅ Регистрация успешна');
    } else {
      console.log('❌ Ошибка регистрации:', registerResponse.data);
    }

    // 2. Тест аутентификации
    console.log('\n2. Тестирование аутентификации...');
    const authResponse = await makeRequest(
      `https://${config.authDomain}/api/auth`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: config.testUser.nickname,
          password: config.testUser.password,
          rememberMe: false,
        }),
      },
    );

    if (authResponse.status === 200) {
      console.log('✅ Аутентификация успешна');
      console.log('   Пользователь:', authResponse.data.user.nickname);
      console.log('   Редирект:', authResponse.data.redirectUrl);
    } else {
      console.log('❌ Ошибка аутентификации:', authResponse.data);
    }

    // 3. Тест автоматического входа
    console.log('\n3. Тестирование автоматического входа...');
    const autoLoginResponse = await makeRequest(
      `https://${config.chatDomain}/api/auto-login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `lumia_auth_token=test_token; lumia_user_data=${JSON.stringify(config.testUser)}`,
        },
      },
    );

    if (autoLoginResponse.status === 200) {
      console.log('✅ Автоматический вход успешен');
    } else {
      console.log('❌ Ошибка автоматического входа:', autoLoginResponse.data);
    }

    // 4. Тест выхода
    console.log('\n4. Тестирование выхода...');
    const logoutResponse = await makeRequest(
      `https://${config.chatDomain}/api/logout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (logoutResponse.status === 200) {
      console.log('✅ Выход успешен');
    } else {
      console.log('❌ Ошибка выхода:', logoutResponse.data);
    }
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
  }
}

async function testMiddleware() {
  console.log('\n🔧 Тестирование middleware...\n');

  try {
    // Тест редиректа неаутентифицированного пользователя
    console.log('1. Тест редиректа на домен аутентификации...');
    const chatResponse = await makeRequest(`https://${config.chatDomain}/`);

    if (chatResponse.status === 302 || chatResponse.status === 307) {
      const location = chatResponse.headers.location;
      if (location?.includes(config.authDomain)) {
        console.log('✅ Редирект работает правильно');
        console.log('   Редирект на:', location);
      } else {
        console.log('❌ Неправильный редирект:', location);
      }
    } else {
      console.log('❌ Ожидался редирект, получен статус:', chatResponse.status);
    }
  } catch (error) {
    console.error('❌ Ошибка тестирования middleware:', error.message);
  }
}

// Запуск тестов
async function runTests() {
  console.log('🚀 Запуск тестов кросс-доменной аутентификации\n');

  await testAuthFlow();
  await testMiddleware();

  console.log('\n✨ Тестирование завершено');
}

// Запуск если скрипт вызван напрямую
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testAuthFlow,
  testMiddleware,
  runTests,
};
