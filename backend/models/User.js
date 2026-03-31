import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    avatar: {
      type: String,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
)

// Хешируем пароль перед сохранением
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Добавляем метод для сравнения паролей
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model('User', userSchema)
export default User
