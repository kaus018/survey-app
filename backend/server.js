import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import mongoSanitize from 'mongodb-sanitize'
import rateLimit from 'express-rate-limit'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import surveyRoutes from './routes/surveyRoutes.js'
import { generateCSRFToken, verifyCSRFToken } from './middleware/csrf.js'
import { securityLogger, logSuspiciousInput } from './middleware/security.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsDir = path.resolve(__dirname, 'uploads')
const frontendDistDir = path.resolve(__dirname, '../dist')
const frontendAssetsDir = path.join(frontendDistDir, 'assets')
const frontendImagesDir = path.join(frontendDistDir, 'images')

dotenv.config({ path: path.resolve(__dirname, '.env') })
connectDB()

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const app = express()
const hasFrontendBuild = fs.existsSync(frontendDistDir)

// Security Middleware
// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  frameguard: { action: 'deny' },              // Prevent clickjacking
  xssFilter: true,                              // Enable XSS filtering
  noSniff: true,                                // Prevent MIME type sniffing
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))

// Security logging
app.use(securityLogger)
app.use(logSuspiciousInput())

// Rate Limiting - общая лимит
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // макс 100 запросов за окно
  message: 'Too many requests, please try again later'
})

// Rate Limiting - для аутентификации (более строгий)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // макс 5 попыток входа
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later'
})

app.use(generalLimiter) // Применяем к всем запросам

const isAllowedDevOrigin = (origin) => {
  if (!origin) return true

  const allowedDevOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175'
  ]

  if (allowedDevOrigins.includes(origin)) {
    return true
  }

  return /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
}

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

// CORS configuration with security best practices
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true)
    }

    if (allowedOrigins.length === 0) {
      return callback(null, true)
    }

    if (allowedOrigins.includes(origin) || isAllowedDevOrigin(origin)) {
      return callback(null, true)
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token'],
  maxAge: 86400 // 24 hours
}))

// Limit request body size
app.use(express.json({ limit: '10kb' }))

// Serve static files before API/security middleware touches asset requests.
app.use('/uploads', express.static(uploadsDir))

if (hasFrontendBuild) {
  if (fs.existsSync(frontendAssetsDir)) {
    app.use('/assets', express.static(frontendAssetsDir))
  }

  if (fs.existsSync(frontendImagesDir)) {
    app.use('/images', express.static(frontendImagesDir))
  }
}

// Sanitize request body from NoSQL injection
app.use(mongoSanitize())

// CSRF token generation - must be before routes that use it
app.use(generateCSRFToken)

// CSRF token verification for state-changing requests
app.use(verifyCSRFToken)

app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.path}`)
  next()
})

// Routes
app.use('/api/auth/login', authLimiter) // Rate limit for auth
app.use('/api/auth/register', authLimiter)
app.use('/api/auth', authRoutes)
app.use('/api/surveys', surveyRoutes)

if (hasFrontendBuild) {
  app.use(express.static(frontendDistDir))
}

app.get('/', (req, res) => {
  if (hasFrontendBuild) {
    return res.sendFile(path.join(frontendDistDir, 'index.html'))
  }

  res.json({
    message: 'Survey App API',
    version: '1.0.0'
  })
})

app.get(/^\/(?!api).*/, (req, res, next) => {
  if (!hasFrontendBuild) {
    return next()
  }

  // Let static file requests fall through to the static middleware / 404 handler.
  if (path.extname(req.path)) {
    return next()
  }

  res.sendFile(path.join(frontendDistDir, 'index.html'))
})

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.use((err, req, res, next) => {
  console.error('Error:', err.message)
  
  // Don't expose error details in production
  if (process.env.NODE_ENV === 'production') {
    res.status(err.status || 500).json({ message: 'Internal server error' })
  } else {
    res.status(err.status || 500).json({ 
      message: err.message,
      error: err
    })
  }
})

// Disable 'X-Powered-By' header
app.disable('x-powered-by')

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`API available at http://localhost:${PORT}`)
})

export default app
