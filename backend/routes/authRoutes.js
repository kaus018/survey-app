import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { register, login, getProfile, uploadAvatar } from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'
import { 
  validateRegister, 
  validateLogin, 
  handleValidationErrors 
} from '../middleware/validation.js'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsDir = path.resolve(__dirname, '../uploads')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

// Public routes - get CSRF token
router.get('/token', (req, res) => {
  res.json({ message: 'CSRF token sent in X-CSRF-Token header' })
})

// Public routes with validation
router.post('/register', validateRegister, handleValidationErrors, register)
router.post('/login', validateLogin, handleValidationErrors, login)

// Private routes
router.get('/profile', protect, getProfile)
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar)

export default router
