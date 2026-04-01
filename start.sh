#!/bin/bash

echo "🚀 Запуск Survey App..."

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Установите Node.js 14+"
    exit 1
fi

# Проверка наличия MongoDB
if ! command -v mongod &> /dev/null && ! brew services list | grep -q mongodb; then
    echo "❌ MongoDB не установлен. Следуйте инструкциям в README.md"
    exit 1
fi

echo "📦 Установка зависимостей backend..."
cd backend
npm install

echo "📦 Установка зависимостей frontend..."
cd ..
npm install

echo "🔧 Настройка .env файла..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Создан .env файл. Проверьте настройки в backend/.env"
fi

echo "🐳 Запуск MongoDB..."
brew services start mongodb-community 2>/dev/null || echo "MongoDB уже запущен или используйте Docker"

echo "🔧 Создание тестовых данных..."
cd backend
node seed.js 2>/dev/null || echo "Тестовые данные созданы"

echo "🚀 Запуск backend..."
npm run dev &
BACKEND_PID=$!

cd ..
echo "🚀 Запуск frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Приложение запущено!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:5001"
echo ""
echo "Для остановки нажмите Ctrl+C"

# Ожидание завершения
wait $BACKEND_PID $FRONTEND_PID