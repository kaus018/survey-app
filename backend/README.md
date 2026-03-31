# Survey App Backend

Серверная часть приложения для создания и прохождения опросов.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd backend
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env` в корне backend папки:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/survey-app
JWT_SECRET=your_super_secret_jwt_key_change_in_production
```

### 3. Запуск MongoDB

Убедитесь, что MongoDB запущена на вашей машине:

```bash
# На Mac с Homebrew
brew services start mongodb-community

# Или запустить в Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

### 4. Запуск сервера

```bash
# Production
npm start

# Development (с автоперезагрузкой)
npm run dev
```

Сервер будет доступен по адресу: `http://localhost:5000`

## 📚 API Endpoints

### Аутентификация

**Регистрация**
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}

Ответ 201:
{
  "message": "✅ Пользователь успешно зарегистрирован",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Вход**
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}

Ответ 200:
{
  "message": "✅ Вы успешно вошли в систему",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Получить профиль**
```
GET /api/auth/profile
Authorization: Bearer <token>

Ответ 200:
{
  "message": "✅ Профиль получен",
  "user": {
    "id": "...",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

### Опросы

**Получить все опросы**
```
GET /api/surveys

Ответ 200:
{
  "message": "✅ Опросы получены",
  "surveys": [...],
  "count": 5
}
```

**Получить один опрос**
```
GET /api/surveys/:id

Ответ 200:
{
  "message": "✅ Опрос получен",
  "survey": {...}
}
```

**Создать опрос**
```
POST /api/surveys
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Мой первый опрос",
  "description": "Это описание опроса",
  "questions": [
    {
      "text": "Как ваше имя?",
      "type": "text",
      "required": true
    },
    {
      "text": "Выберите вариант",
      "type": "choice",
      "options": ["Вариант 1", "Вариант 2"],
      "required": true
    }
  ]
}

Ответ 201:
{
  "message": "✅ Опрос создан успешно",
  "survey": {...}
}
```

**Обновить опрос**
```
PUT /api/surveys/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Обновленное название",
  "description": "Новое описание",
  "questions": [...],
  "isActive": true
}

Ответ 200:
{
  "message": "✅ Опрос обновлён успешно",
  "survey": {...}
}
```

**Удалить опрос**
```
DELETE /api/surveys/:id
Authorization: Bearer <token>

Ответ 200:
{
  "message": "✅ Опрос удалён успешно"
}
```

**Ответить на опрос**
```
POST /api/surveys/:id/respond
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": {
    "question1": "ответ1",
    "question2": "ответ2"
  }
}

Ответ 200:
{
  "message": "✅ Спасибо за Ваш ответ!"
}
```

**Получить ответы на опрос**
```
GET /api/surveys/:id/responses
Authorization: Bearer <token>

Ответ 200:
{
  "message": "✅ Ответы получены",
  "responses": [...],
  "count": 3
}
```

## 🏗 Структура проекта

```
backend/
├── config/
│   └── db.js           # Подключение к MongoDB
├── models/
│   ├── User.js         # Модель пользователя
│   └── Survey.js       # Модель опроса
├── controllers/
│   ├── authController.js    # Логика аутентификации
│   └── surveyController.js  # Логика работы с опросами
├── routes/
│   ├── authRoutes.js   # Маршруты аутентификации
│   └── surveyRoutes.js # Маршруты опросов
├── middleware/
│   └── auth.js         # Middleware проверки токена
├── server.js           # Главный файл сервера
├── package.json        # Зависимости проекта
└── .env               # Переменные окружения
```

## 🔒 Безопасность

- Пароли хешируются с помощью bcrypt перед сохранением в БД
- JWT токены используются для аутентификации
- Защищённые маршруты требуют валидный токен в заголовке Authorization
- CORS настроен для работы с frontend приложением

## 📦 Использованные технологии

- **Express.js** - веб-фреймворк
- **MongoDB** - база данных
- **Mongoose** - ODM для работы с MongoDB
- **JWT** - аутентификация
- **bcrypt** - хеширование паролей
- **CORS** - кросс-доменные запросы
- **dotenv** - переменные окружения

## 🐛 Решение проблем

### MongoDB не подключается
- Убедитесь, что MongoDB запущена
- Проверьте значение `MONGODB_URI` в `.env`

### Токен истек
- Токен действует 7 дней
- Требуется повторная авторизация для получения нового токена

### CORS ошибки
- Проверьте, что frontend запущен на том же порту, что и в CORS конфигурации

---

**Good luck! 🎉**
