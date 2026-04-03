import Survey from '../models/Survey.js'
import Response from '../models/Response.js'

const surveyPopulateConfig = [
  { path: 'author', select: 'username email avatar' },
  { path: 'responses.user', select: 'username email avatar' },
  { path: 'comments.user', select: 'username email avatar' },
  { path: 'comments.replies.user', select: 'username email avatar' }
]

const formatPercent = (value, total) => {
  if (!total) return 0
  return Number(((value / total) * 100).toFixed(1))
}

const buildQuestionStatistics = (survey, responses) => {
  return survey.questions.map((question, index) => {
    const questionId = String(question._id || index)
    const questionAnswers = responses
      .map((response) => response.answers?.[questionId])
      .filter((answer) => typeof answer !== 'undefined' && answer !== null && answer !== '')

    const totalAnswers = questionAnswers.length

    if (question.type === 'rating') {
      const distribution = {}

      for (const answer of questionAnswers) {
        const answerKey = String(answer)
        distribution[answerKey] = (distribution[answerKey] || 0) + 1
      }

      const options = Object.entries(distribution)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([value, count]) => ({
          value,
          count,
          percent: formatPercent(count, totalAnswers)
        }))

      const average = totalAnswers
        ? Number((questionAnswers.reduce((sum, answer) => sum + Number(answer), 0) / totalAnswers).toFixed(2))
        : 0

      const topAnswer = options.reduce((best, option) => {
        if (!best || option.count > best.count) return option
        return best
      }, null)

      return {
        questionId,
        questionText: question.text,
        questionType: question.type,
        totalAnswers,
        average,
        topAnswer,
        options
      }
    }

    if (question.type === 'choice') {
      const distribution = {}

      for (const option of question.options || []) {
        distribution[option] = 0
      }

      for (const answer of questionAnswers) {
        const answerKey = String(answer)
        distribution[answerKey] = (distribution[answerKey] || 0) + 1
      }

      const options = Object.entries(distribution).map(([value, count]) => ({
        value,
        count,
        percent: formatPercent(count, totalAnswers)
      }))

      const topAnswer = options.reduce((best, option) => {
        if (!best || option.count > best.count) return option
        return best
      }, null)

      return {
        questionId,
        questionText: question.text,
        questionType: question.type,
        totalAnswers,
        topAnswer,
        options
      }
    }

    const normalizedAnswers = questionAnswers
      .map((answer) => String(answer).trim())
      .filter(Boolean)

    const distribution = {}

    for (const answer of normalizedAnswers) {
      distribution[answer] = (distribution[answer] || 0) + 1
    }

    const topResponses = Object.entries(distribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([value, count]) => ({
        value,
        count,
        percent: formatPercent(count, normalizedAnswers.length)
      }))

    return {
      questionId,
      questionText: question.text,
      questionType: question.type,
      totalAnswers,
      topAnswer: topResponses[0] || null,
      textAnswers: normalizedAnswers,
      topResponses
    }
  })
}

export const getAllSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find().populate(surveyPopulateConfig)

    res.status(200).json({
      message: 'Surveys retrieved',
      surveys,
      count: surveys.length
    })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

export const getSurveyById = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id)
      .populate(surveyPopulateConfig)

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' })
    }

    res.status(200).json({
      message: 'Survey retrieved',
      survey
    })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

export const createSurvey = async (req, res) => {
  try {
    const { title, description, questions } = req.body

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ message: 'Survey title is required and must be non-empty' })
    }

    if (title.trim().length > 200) {
      return res.status(400).json({ message: 'Survey title must be less than 200 characters' })
    }

    const survey = new Survey({
      title: title.trim(),
      description,
      questions: questions || [],
      author: req.userId
    })

    await survey.save()
    await survey.populate(surveyPopulateConfig)

    res.status(201).json({
      message: 'Survey created successfully',
      survey
    })
  } catch {
    res.status(500).json({ message: 'Server error creating survey' })
  }
}

export const updateSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id)

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' })
    }

    if (survey.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'You cannot edit this survey' })
    }

    const { title, description, questions, isActive } = req.body

    if (typeof title === 'string' && title.trim()) survey.title = title.trim()
    if (typeof description !== 'undefined') survey.description = description
    if (Array.isArray(questions)) survey.questions = questions
    if (typeof isActive !== 'undefined') survey.isActive = isActive

    await survey.save()
    await survey.populate(surveyPopulateConfig)

    res.status(200).json({
      message: 'Survey updated successfully',
      survey
    })
  } catch {
    res.status(500).json({ message: 'Server error updating survey' })
  }
}

export const deleteSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id)

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' })
    }

    if (survey.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'You cannot delete this survey' })
    }

    await Survey.findByIdAndDelete(req.params.id)
    await Response.deleteMany({ survey: req.params.id })

    res.status(200).json({
      message: 'Survey deleted successfully'
    })
  } catch {
    res.status(500).json({ message: 'Server error deleting survey' })
  }
}

export const respondToSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id)

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' })
    }

    if (!survey.isActive) {
      return res.status(400).json({ message: 'This survey is no longer active' })
    }

    const { answers } = req.body

    if (!answers) {
      return res.status(400).json({ message: 'Answers are required' })
    }

    const alreadyResponded = await Response.findOne({
      survey: req.params.id,
      user: req.userId
    })

    if (alreadyResponded) {
      return res.status(400).json({ message: 'You have already responded to this survey' })
    }

    const response = new Response({
      survey: req.params.id,
      user: req.userId,
      answers,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    })

    await response.save()
    await response.populate('user', 'username email')

    survey.responses.push({
      user: req.userId,
      answers,
      submittedAt: response.submittedAt
    })
    await survey.save()

    res.status(200).json({
      message: 'Thank you for your response!',
      response
    })
  } catch {
    res.status(500).json({ message: 'Server error sending response' })
  }
}

export const getSurveyResponses = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id)

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' })
    }

    if (survey.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'You cannot view responses for this survey' })
    }

    const responses = await Response.find({ survey: req.params.id })
      .populate('user', 'username email')
      .sort({ submittedAt: -1 })

    res.status(200).json({
      message: 'Responses retrieved',
      responses,
      count: responses.length
    })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

export const getUserResponses = async (req, res) => {
  try {
    const responses = await Response.find({ user: req.userId })
      .populate('survey', 'title description questions isActive author')
      .sort({ submittedAt: -1 })

    res.status(200).json({
      message: 'User responses retrieved',
      responses,
      count: responses.length
    })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

export const addSurveyComment = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id)

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' })
    }

    const text = String(req.body?.text || '').trim()

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' })
    }

    survey.comments.push({
      user: req.userId,
      text
    })

    await survey.save()
    await survey.populate(surveyPopulateConfig)

    res.status(201).json({
      message: 'Comment added successfully',
      comments: survey.comments
    })
  } catch {
    res.status(500).json({ message: 'Server error adding comment' })
  }
}

export const addSurveyCommentReply = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id)

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' })
    }

    const comment = survey.comments.id(req.params.commentId)

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    const text = String(req.body?.text || '').trim()

    if (!text) {
      return res.status(400).json({ message: 'Reply text is required' })
    }

    comment.replies.push({
      user: req.userId,
      text
    })

    await survey.save()
    await survey.populate(surveyPopulateConfig)

    res.status(201).json({
      message: 'Reply added successfully',
      comments: survey.comments
    })
  } catch {
    res.status(500).json({ message: 'Server error adding reply' })
  }
}

export const getSurveyStatistics = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id)

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' })
    }

    if (survey.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'You cannot view statistics for this survey' })
    }

    const responses = await Response.find({ survey: req.params.id })
      .populate('user', 'username email')

    const questionStats = buildQuestionStatistics(survey, responses)

    const statistics = {
      totalResponses: responses.length,
      responses,
      questionStats,
      respondents: responses.map((response) => ({
        username: response.user.username,
        email: response.user.email,
        submittedAt: response.submittedAt
      }))
    }

    res.status(200).json({
      message: 'Survey statistics retrieved',
      survey: {
        id: survey._id,
        title: survey.title,
        description: survey.description,
        totalQuestions: survey.questions.length
      },
      statistics
    })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}
