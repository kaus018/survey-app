import Survey from '../models/Survey.js'
import Response from '../models/Response.js'

export const getAllSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find()
      .populate('author', 'username email')
      .populate('responses.user', 'username email')

    res.status(200).json({
      message: 'Surveys retrieved',
      surveys,
      count: surveys.length
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const getSurveyById = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id)
      .populate('author', 'username email')
      .populate('responses.user', 'username email')

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' })
    }

    res.status(200).json({
      message: 'Survey retrieved',
      survey
    })
  } catch (error) {
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
      title,
      description,
      questions: questions || [],
      author: req.userId
    })

    await survey.save()
    await survey.populate('author', 'username email')

    res.status(201).json({
      message: 'Survey created successfully',
      survey
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error creating survey' })
  }
}

export const updateSurvey = async (req, res) => {
  try {
    let survey = await Survey.findById(req.params.id)

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' })
    }

    if (survey.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'You cannot edit this survey' })
    }

    const { title, description, questions, isActive } = req.body

    if (title) survey.title = title
    if (description) survey.description = description
    if (questions) survey.questions = questions
    if (typeof isActive !== 'undefined') survey.isActive = isActive

    await survey.save()
    await survey.populate('author', 'username email')

    res.status(200).json({
      message: 'Survey updated successfully',
      survey
    })
  } catch (error) {
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

    res.status(200).json({
      message: 'Survey deleted successfully'
    })
  } catch (error) {
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

    res.status(200).json({
      message: 'Thank you for your response!',
      response
    })
  } catch (error) {
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
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const getUserResponses = async (req, res) => {
  try {
    const responses = await Response.find({ user: req.userId })
      .populate('survey', 'title description')
      .sort({ submittedAt: -1 })

    res.status(200).json({
      message: 'User responses retrieved',
      responses,
      count: responses.length
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
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

    const statistics = {
      totalResponses: responses.length,
      responses,
      answerDistribution: {},
      respondents: responses.map(r => ({
        username: r.user.username,
        email: r.user.email,
        submittedAt: r.submittedAt
      }))
    }

    for (const response of responses) {
      for (const [questionId, answer] of Object.entries(response.answers)) {
        if (!statistics.answerDistribution[questionId]) {
          statistics.answerDistribution[questionId] = {}
        }
        const answerStr = String(answer)
        statistics.answerDistribution[questionId][answerStr] = 
          (statistics.answerDistribution[questionId][answerStr] || 0) + 1
      }
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
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}
