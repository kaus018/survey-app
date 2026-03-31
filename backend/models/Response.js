import mongoose from 'mongoose'

const responseSchema = new mongoose.Schema(
  {
    survey: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Survey',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answers: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  },
  { timestamps: true }
)

// Compound index to ensure one response per user per survey
responseSchema.index({ survey: 1, user: 1 }, { unique: true })

const Response = mongoose.model('Response', responseSchema)
export default Response
