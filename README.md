# Survey App - Полное приложение для опросов

Это полностью функциональное веб-приложение для создания и прохождения опросов с использованием современных технологий.

📖 **[Подробный гайд для начинающих](GUIDE.md)** - начните отсюда, если вы новичок!

🌍 **[Как выложить сайт по ссылке](HOSTING.md)** - инструкция по хостингу для преподавателя

## 🎯 Что это такое?

Survey App - это платформа для:
- 📋 Создания пользовательских опросов
- ✏️ Ответов на опросы других пользователей
- 📊 Просмотра статистики опросов
- 👤 Управления профилем пользователя

## 🏗️ Архитектура проекта

### Frontend (React + Vite)
- **Технологии**: React 19, React Router 7, Axios
- **Структура**: Компоненты, Pages, Context API для управления состоянием

### Backend (Node.js + Express)
- **Технологии**: Express.js, MongoDB, Mongoose, JWT, bcrypt
- **Архитектура**: MVC-подход (Models, Controllers, Routes)
- **Аутентификация**: JWT токены

## 🚀 Быстрый старт

### Вариант 1: Автоматический запуск (рекомендуется для новичков)
```bash
./start.sh
```
Этот скрипт автоматически:
- Проверит наличие Node.js и MongoDB
- Установит все зависимости
- Создаст `.env` файл
- Запустит MongoDB
- Создаст тестовые данные
- Запустит backend и frontend одновременно

### Вариант 2: Ручной запуск (для понимания процесса)

Следуйте пошаговым инструкциям ниже, чтобы понять, как работает каждый компонент.

#### Шаг 1: Подготовка окружения
```bash
# 1. Установите MongoDB (если еще не установлена)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# 2. Проверьте установку
node --version  # Должен быть 14+
npm --version   # Должен быть установлен
mongosh         # Должна открыться оболочка MongoDB (Ctrl+C для выхода)
```

#### Шаг 2: Настройка Backend

### Предварительные требования
- Node.js 14+ 
- MongoDB (локально или Docker)
- npm/yarn

### Шаг 1: Установка MongoDB

**Option A - Homebrew (Mac)**:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Option B - Docker**:
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

**Проверка**:
```bash
mongosh  # Должна открыться интерактивная оболочка
```

### Шаг 2: Настройка Backend

1. **Перейдите в папку backend**:
   ```bash
   cd backend
   ```

2. **Установите зависимости**:
   ```bash
   npm install
   ```

3. **Создайте файл .env** (скопируйте из .env.example):
   ```bash
   cp .env.example .env
   ```
   
   Отредактируйте `.env` файл:
   ```env
   MONGO_URI=mongodb://localhost:27017/
   JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
   PORT=5001
   NODE_ENV=development
   ```

4. **Создайте тестовые данные** (опционально):
   ```bash
   node seed.js
   ```

5. **Запустите backend**:
   ```bash
   npm run dev  # Для разработки (с nodemon)
   # или
   npm start    # Для продакшена
   ```

✅ Backend запустится на **http://localhost:5001**

### Шаг 3: Запуск Frontend

В **отдельном терминале** (не закрывая backend):

1. **Вернитесь в корневую папку проекта**:
   ```bash
   cd ..  # Из папки backend
   ```

2. **Установите зависимости**:
   ```bash
   npm install
   ```

3. **Запустите frontend**:
   ```bash
   npm run dev
   ```

✅ Frontend запустится на **http://localhost:5173**

### Проверка работы
После запуска выполните тестирование API:
```bash
./test-api.sh
```

Этот скрипт проверит:
- Доступность backend
- Регистрацию пользователя
- Вход в систему
- Получение списка опросов

## 👤 Тестовые аккаунты

Если вы запустили `node seed.js`:

| Username | Email | Пароль |
|----------|-------|--------|
| admin | admin@example.com | admin123 |
| testuser | test@example.com | test123 |

## 📚 API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/profile` - Получить профиль (требует авторизация)

### Опросы
- `GET /api/surveys` - Получить все опросы
- `GET /api/surveys/:id` - Получить один опрос
- `POST /api/surveys` - Создать опрос (требует авторизация)
- `PUT /api/surveys/:id` - Обновить опрос (требует авторизация)
- `DELETE /api/surveys/:id` - Удалить опрос (требует авторизация)
- `POST /api/surveys/:id/respond` - Ответить на опрос (требует авторизация)
- `GET /api/surveys/:id/responses` - Получить все ответы (требует авторизация)
## 📖 Обучение: Основные команды разработчика

### Работа с терминалом
```bash
pwd          # Показать текущую директорию
ls           # Показать содержимое папки
cd папка     # Перейти в папку
cd ..        # Вернуться на уровень выше
```

### Работа с Node.js проектами
```bash
npm install          # Установить зависимости из package.json
npm start            # Запустить проект (production режим)
npm run dev          # Запустить в режиме разработки
npm run build        # Собрать проект для продакшена
```

### Работа с MongoDB
```bash
brew services start mongodb-community    # Запустить MongoDB
brew services stop mongodb-community     # Остановить MongoDB
mongosh                                 # Открыть оболочку MongoDB
```

### Проверка работы сервисов
```bash
curl http://localhost:5001/     # Проверить backend
curl http://localhost:5173/     # Проверить frontend
ps aux | grep node              # Показать запущенные Node.js процессы
```

### Остановка процессов
```bash
# В терминале с запущенным процессом нажмите:
Ctrl + C

# Или найдите и убейте процесс:
kill PID_НОМЕР
```
## �️ Troubleshooting (Решение проблем)

### Проблема: "Cannot find module 'multer'"
**Решение**: Установите недостающую зависимость
```bash
cd backend
npm install multer
```

### Проблема: "MongoDB connection error"
**Решение**: 
1. Проверьте, запущен ли MongoDB:
   ```bash
   brew services list | grep mongodb
   ```
2. Если не запущен:
   ```bash
   brew services start mongodb-community
   ```
3. Проверьте `.env` файл - переменная `MONGO_URI` должна быть `mongodb://localhost:27017/`

### Проблема: "Port 5000 already in use"
**Решение**: Измените порт в `.env` файле:
```env
PORT=5001
```
И обновите API URL в frontend файлах на `http://localhost:5001/api`

### Проблема: "Network Error" при регистрации/входе
**Решение**:
1. Убедитесь, что backend запущен
2. Проверьте URL в `src/context/AuthContext.jsx` - должен быть `http://localhost:5001/api`
3. Проверьте CORS настройки в backend

### Проблема: "CSRF token missing" при регистрации/входе
**Решение**: 
1. Убедитесь, что frontend получает CSRF токен при инициализации
2. Проверьте, что `AuthContext.jsx` делает предварительный GET запрос для получения токена
3. Если проблема persists, попробуйте перезагрузить страницу - токен должен инициализироваться автоматически

### Проблема: Frontend не загружается
**Решение**:
1. Убедитесь, что установлены зависимости: `npm install`
2. Проверьте, что порт 5173 свободен
3. Попробуйте `npm run dev -- --port 5174`

### Проверка работы:
```bash
# Backend
curl http://localhost:5001/

# Frontend  
curl http://localhost:5173/
```
## 📁 Структура проекта

```
minicursovaya-main/
├── backend/                    # Серверная часть
│   ├── config/
│   │   └── db.js              # Подключение к MongoDB
│   ├── controllers/
│   │   └── authController.js  # Логика аутентификации
│   ├── middleware/
│   │   ├── auth.js            # Проверка JWT токенов
│   │   ├── csrf.js            # Защита CSRF
│   │   ├── security.js        # Безопасность
│   │   └── validation.js      # Валидация данных
│   ├── models/
│   │   ├── User.js            # Модель пользователя
│   │   ├── Survey.js          # Модель опроса
│   │   └── Response.js        # Модель ответа
│   ├── routes/
│   │   ├── authRoutes.js      # Маршруты аутентификации
│   │   └── surveyRoutes.js    # Маршруты опросов
│   ├── uploads/               # Загруженные файлы
│   ├── .env                   # Переменные окружения
│   ├── package.json           # Зависимости backend
│   └── server.js              # Главный файл сервера
├── src/                       # Клиентская часть
│   ├── components/            # Переиспользуемые компоненты
│   ├── context/
│   │   └── AuthContext.jsx    # Контекст аутентификации
│   ├── layouts/               # Макеты страниц
│   ├── pages/                 # Страницы приложения
│   ├── styles/                # Стили
│   └── utils/                 # Утилиты
├── public/                    # Статические файлы
├── package.json               # Зависимости frontend
├── vite.config.js             # Конфигурация Vite
└── README.md                  # Этот файл
```

## 🔄 Как работает приложение

1. **Frontend** (React) отправляет запросы к **Backend** (Express)
2. **Backend** взаимодействует с **MongoDB** для хранения данных
3. **JWT токены** используются для аутентификации пользователей
4. **CSRF защита** предотвращает атаки подделки запросов
5. **Rate limiting** ограничивает количество запросов
## �🔑 Функциональность

### ✅ Реализовано

**Аутентификация**
- ✓ Регистрация новых пользователей
- ✓ Вход в систему
- ✓ JWT токены (7 дней)
- ✓ Хеширование паролей (bcrypt)
- ✓ Защита маршрутов

**Опросы - CRUD операции**
- ✓ Создание опросов
- ✓ Получение списка всех опросов
- ✓ Получение деталей одного опроса
- ✓ Обновление опросов (только автором)
- ✓ Удаление опросов (только автором)

**Участие в опросах**
- ✓ Прохождение опросов
- ✓ Сохранение ответов
- ✓ Просмотр результатов

**Профиль пользователя**
- ✓ Просмотр информации профиля
- ✓ Просмотр статистики (количество пройденных опросов)
- ✓ Список пройденных опросов

## 🗂️ Структура файлов

```
my-survey-app/
├── backend/                    # Node.js + Express сервер
│   ├── config/
│   │   └── db.js              # MongoDB подключение
│   ├── models/
│   │   ├── User.js            # Модель пользователя
│   │   └── Survey.js          # Модель опроса
│   ├── controllers/
│   │   ├── authController.js  # Логика аутентификации
│   │   └── surveyController.js # Логика опросов
│   ├── routes/
│   │   ├── authRoutes.js      # API маршруты аутентификации
│   │   └── surveyRoutes.js    # API маршруты опросов
│   ├── middleware/
│   │   └── auth.js            # Проверка JWT токена
│   ├── server.js              # Главный файл сервера
│   ├── seed.js                # Создание тестовых данных
│   ├── package.json
│   ├── .env                   # Переменные окружения
│   └── README.md              # Документация backend
│
└── src/                        # React приложение
    ├── context/
    │   └── AuthContext.jsx    # Управление состоянием аутентификации
    ├── pages/
    │   ├── Home.jsx
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   ├── Profile.jsx
    │   ├── SurveyList.jsx
    │   ├── SurveyDetails.jsx
    │   └── About.jsx
    ├── components/
    │   ├── PrivateRoute.jsx   # Защита маршрутов
    │   └── SurveyCard.jsx     # Компонент карточки опроса
    ├── layouts/
    │   ├── Header.jsx         # Навигация
    │   └── Footer.jsx
    ├── styles/
    │   └── main.css
    ├── App.jsx
    └── main.jsx
```

## 🔒 Безопасность

- ✓ Пароли хешируются с bcrypt
- ✓ JWT токены для аутентификации
- ✓ CORS кросс-доменная политика
- ✓ Защита маршрутов от неавторизованного доступа
- ✓ Разовое использование токена per request

## ☁️ Деплой

Пример: Vercel (Frontend) + Render / Railway (Backend)

- Frontend: `https://your-frontend-app.vercel.app`
- Backend: `https://your-backend-app.onrender.com`

В `.env` (backend):
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/surveydb
JWT_SECRET=your_jwt_secret
```

В `.env` (frontend):
```env
VITE_API_URL=https://your-backend-app.onrender.com/api
```

> После деплоя проверьте CORS, что frontend и backend указаны в `server.js` и `vite.config.js`.

## 🐛 Решение проблем

### MongoDB не подключается
```bash
# Проверить статус MongoDB
brew services list

# Перезагрузить MongoDB
brew services restart mongodb-community
```

### CORS ошибки
Убедитесь что:
- Backend запущен на `http://localhost:5000`
- Frontend запущен на `http://localhost:5173`
- В `server.js` указаны правильные origins

### Ошибка "port already in use"
```bash
# Найти процесс на порту 5000
lsof -i :5000

# Убить процесс
kill -9 <PID>

# Или использовать другой порт в .env
PORT=5001
```

### Токен истекает
- Токен действует 7 дней
- Требуется повторная авторизация для нового токена

## 📖 Дополнительные команды

**Backend**
```bash
npm start      # Production
npm run dev    # Development с nodemon
```

**Frontend**
```bash
npm run build  # Собрать для production
npm run preview # Посмотреть production версию
npm run lint   # Проверить код
```

## 📝 Лицензия

MIT License

---

**Готово к защите! 🎉**

Успешной защиты проекта! Если что-то не работает - проверьте логи в консоли!
