import express from 'express'
import {
  getAllSurveys,
  getSurveyById,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  respondToSurvey,
  getSurveyResponses,
  getUserResponses,
  getSurveyStatistics
} from '../controllers/surveyController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/', getAllSurveys)

// Private routes (must come before :id routes to avoid route conflicts)
router.get('/user/responses', protect, getUserResponses)

// Public routes with ID
router.get('/:id', getSurveyById)

// Private routes with ID
router.post('/', protect, createSurvey)
router.put('/:id', protect, updateSurvey)
router.delete('/:id', protect, deleteSurvey)
router.post('/:id/respond', protect, respondToSurvey)
router.get('/:id/responses', protect, getSurveyResponses)
router.get('/:id/statistics', protect, getSurveyStatistics)

export default router
