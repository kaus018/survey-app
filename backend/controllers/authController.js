import User from '../models/User.js'
import jwt from 'jsonwebtoken'

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  })
}

export const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body

    // Validate all fields present
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Validate username length
    if (username.trim().length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' })
    }

    // Validate email format
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    // Validate password length (now 8 for stronger security)
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' })
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] })
    if (userExists) {
      return res.status(400).json({ message: 'User with this email or username already exists' })
    }

    // Create new user (password will be hashed by the pre-save hook)
    const user = new User({ username, email, password })
    await user.save()

    const token = generateToken(user._id)

    res.status(201).json({
      message: 'User successfully registered',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error('[SECURITY] Registration error:', error.message)
    res.status(500).json({ message: 'Server error during registration' })
  }
}

export const login = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: 'Username/email and password are required' })
    }

    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    })

    if (!user) {
      // Don't reveal if user exists (security best practice)
      return res.status(401).json({ message: 'Invalid username/email or password' })
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      console.warn(`[SECURITY] Failed login attempt for user: ${username}`)
      return res.status(401).json({ message: 'Invalid username/email or password' })
    }

    const token = generateToken(user._id)

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error('[SECURITY] Login error:', error.message)
    res.status(500).json({ message: 'Server error during login' })
  }
}

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password')
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({
      message: 'Profile retrieved',
      user
    })
  } catch (error) {
    console.error('[SECURITY] Profile retrieval error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.avatar = `/uploads/${req.file.filename}`
    await user.save()

    res.status(200).json({
      message: 'Avatar uploaded successfully',
      avatar: user.avatar
    })
  } catch (error) {
    console.error('[SECURITY] Avatar upload error:', error.message)
    res.status(500).json({ message: 'Server error during avatar upload' })
  }
}
