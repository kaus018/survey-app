// Seed script for test data
// Run: node seed.js

import mongoose from 'mongoose'
import User from './models/User.js'
import Survey from './models/Survey.js'
import Response from './models/Response.js'
import dotenv from 'dotenv'

dotenv.config()

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    await User.deleteMany({})
    await Survey.deleteMany({})
    await Response.deleteMany({})
    console.log('Database cleared')

    const user1 = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123'
    })

    const user2 = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'test123'
    })

    console.log('Created 2 test users')
    console.log('   admin / admin123')
    console.log('   testuser / test123')

    // Создаём тестовые опросы
    const survey1 = await Survey.create({
      title: 'Опрос студентов AITU',
      description: 'Оцените качество обучения в AITU',
      img: 'https://via.placeholder.com/300x200?text=Опрос+AITU',
      author: user1._id,
      questions: [
        {
          _id: new mongoose.Types.ObjectId(),
          text: 'Нравится ли вам обучение в AITU?',
          type: 'choice',
          options: ['Очень нравится', 'Нормально', 'Не нравится'],
          required: true
        },
        {
          _id: new mongoose.Types.ObjectId(),
          text: 'Довольны ли вы расписанием?',
          type: 'choice',
          options: ['Да', 'Нет'],
          required: true
        },
        {
          _id: new mongoose.Types.ObjectId(),
          text: 'Оцените преподавателей (1-5)',
          type: 'rating',
          required: true
        }
      ],
      isActive: true
    })

    const survey2 = await Survey.create({
      title: 'Опрос качества услуг',
      description: 'Помогите нам улучшить наши услуги',
      img: 'https://via.placeholder.com/300x200?text=Качество+услуг',
      author: user2._id,
      questions: [
        {
          _id: new mongoose.Types.ObjectId(),
          text: 'Какова была ваша общая удовлетворённость?',
          type: 'choice',
          options: ['Отлично', 'Хорошо', 'Удовлетворительно', 'Плохо'],
          required: true
        },
        {
          _id: new mongoose.Types.ObjectId(),
          text: 'Ваши пожелания и предложения',
          type: 'text',
          required: false
        }
      ],
      isActive: true
    })

    const survey3 = await Survey.create({
      title: 'Опрос о спортзале',
      description: 'Оцените качество оборудования и услуг спортзала',
      img: 'https://via.placeholder.com/300x200?text=Спортзал',
      author: user1._id,
      questions: [
        {
          _id: new mongoose.Types.ObjectId(),
          text: 'Довольны ли вы оборудованием?',
          type: 'choice',
          options: ['Да', 'Средне', 'Нет'],
          required: true
        },
        {
          _id: new mongoose.Types.ObjectId(),
          text: 'Оцените работу тренеров (1-5)',
          type: 'rating',
          required: true
        }
      ],
      isActive: true
    })

    console.log('Created 3 test surveys')

    // Create response documents
    await Response.create({
      survey: survey1._id,
      user: user2._id,
      answers: {
        [survey1.questions[0]._id]: 'Очень нравится',
        [survey1.questions[1]._id]: 'Да',
        [survey1.questions[2]._id]: 5
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0'
    })

    await Response.create({
      survey: survey2._id,
      user: user1._id,
      answers: {
        [survey2.questions[0]._id]: 'Отлично',
        [survey2.questions[1]._id]: 'Отличное приложение!'
      },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0'
    })

    await Response.create({
      survey: survey3._id,
      user: user2._id,
      answers: {
        [survey3.questions[0]._id]: 'Да',
        [survey3.questions[1]._id]: 5
      },
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0'
    })

    console.log('Created 3 test responses')

    console.log('\nDatabase successfully populated with test data!\n')
    console.log('Test users:')
    console.log('   1. admin (email: admin@example.com, password: admin123)')
    console.log('   2. testuser (email: test@example.com, password: test123)')
    console.log('\nCreated surveys:')
    console.log('   1. AITU Student Survey (author: admin)')
    console.log('   2. Service Quality Survey (author: testuser)')
    console.log('   3. Gym Survey (author: admin)')
    console.log('\nVoting statistics:')
    console.log('   - user2 voted on survey 1')
    console.log('   - user1 voted on survey 2')
    console.log('   - user2 voted on survey 3')

    process.exit(0)
  } catch (error) {
    console.error('Error seeding database:', error.message)
    process.exit(1)
  }
}

seedDatabase()
