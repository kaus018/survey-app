#!/bin/bash

echo "🧪 Тестирование Survey App API"
echo "================================"

BASE_URL="http://localhost:5001"

# Тест 1: Проверка доступности API
echo "1. Проверка доступности API..."
if curl -s "$BASE_URL/" > /dev/null; then
    echo "✅ API доступен"
else
    echo "❌ API недоступен. Запустите backend: cd backend && npm run dev"
    exit 1
fi

# Тест 2: Регистрация пользователя
echo "2. Тестирование регистрации..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123456",
    "confirmPassword": "test123456"
  }')

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
    echo "✅ Регистрация успешна"
    TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
    echo "❌ Регистрация не удалась: $REGISTER_RESPONSE"
fi

# Тест 3: Вход в систему
echo "3. Тестирование входа..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo "✅ Вход успешен"
else
    echo "❌ Вход не удался: $LOGIN_RESPONSE"
fi

# Тест 4: Получение опросов
echo "4. Тестирование получения опросов..."
SURVEYS_RESPONSE=$(curl -s "$BASE_URL/api/surveys")

if echo "$SURVEYS_RESPONSE" | grep -q "surveys\|title"; then
    echo "✅ Получение опросов успешно"
else
    echo "❌ Получение опросов не удалось: $SURVEYS_RESPONSE"
fi

echo ""
echo "🎉 Тестирование завершено!"
echo "📱 Откройте http://localhost:5173 для использования приложения"