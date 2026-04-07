# Как выложить сайт по ссылке

Если коротко, хостинг это сервис, который запускает твой сайт в интернете и даёт ссылку, которую можно отправить преподавателю.

Для этого проекта самый простой вариант такой:

1. Backend выложить на `Render`.
2. Базу данных создать в `MongoDB Atlas`.
3. Frontend выложить на `Netlify`.

## 1. MongoDB Atlas

1. Зарегистрируйся на [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database).
2. Создай бесплатный кластер `M0`.
3. Создай пользователя базы данных.
4. В `Network Access` добавь `0.0.0.0/0`.
5. Скопируй строку подключения вида:

```env
mongodb+srv://USERNAME:PASSWORD@cluster-name.mongodb.net/survey-app?retryWrites=true&w=majority
```

Это значение потом вставишь как `MONGO_URI`.

## 2. Backend на Render

1. Зарегистрируйся на [Render](https://render.com/).
2. Нажми `New +` -> `Web Service`.
3. Подключи GitHub-репозиторий с этим проектом.
4. Заполни:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

5. Добавь переменные окружения:

```env
MONGO_URI=твоя_строка_из_Atlas
JWT_SECRET=любой_длинный_секретный_ключ_минимум_32_символа
NODE_ENV=production
PORT=10000
CORS_ORIGIN=https://твой-сайт.netlify.app
```

После запуска Render даст ссылку вида:

```text
https://your-backend-name.onrender.com
```

## 3. Frontend на Netlify

1. Зарегистрируйся на [Netlify](https://www.netlify.com/).
2. Нажми `Add new site` -> `Import an existing project`.
3. Подключи тот же GitHub-репозиторий.
4. Заполни:

```text
Base directory: (оставь пустым)
Build command: npm run build
Publish directory: dist
```

5. Добавь переменные окружения:

```env
VITE_BACKEND_URL=https://your-backend-name.onrender.com
VITE_API_URL=https://your-backend-name.onrender.com/api
```

После публикации Netlify даст ссылку вида:

```text
https://your-frontend-name.netlify.app
```

## 4. Важно после публикации

Когда у тебя появится ссылка фронтенда с Netlify:

1. Вернись в Render.
2. Открой переменную `CORS_ORIGIN`.
3. Укажи точную ссылку фронтенда, например:

```env
CORS_ORIGIN=https://your-frontend-name.netlify.app
```

И перезапусти backend.

## 5. Что уже подготовлено в проекте

В проекте уже можно задавать адреса через переменные:

- `VITE_BACKEND_URL`
- `VITE_API_URL`
- `CORS_ORIGIN`

То есть код больше не привязан к `localhost`, и его можно выкладывать на внешний хостинг.
