import mongoose from 'mongoose'

const surveySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    questions: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        text: String,
        type: {
          type: String,
          enum: ['text', 'choice', 'rating'],
          default: 'text'
        },
        options: [String],
        required: Boolean
      }
    ],
    responses: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        answers: mongoose.Schema.Types.Mixed,
        submittedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
)

const Survey = mongoose.model('Survey', surveySchema)
export default Survey
