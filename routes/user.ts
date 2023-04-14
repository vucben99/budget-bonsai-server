import express from 'express'
import authenticateRequest from '../middleware/authenticateRequest'
import { User } from '../models/User'

// /api/user route
const router = express.Router()

// Get all expenses of user
router.get('/expenses', authenticateRequest, async (req, res) => {
  const _user = res.locals.user
  const user = await User.findOne({ sub: _user.sub })
  if (!user) return res.sendStatus(404)
  const response = user.categories.map((category) => {
    return {
      category: category.name,
      months: category.months
    }
  })
  res.json(response)
})

router.get('/expenses/:month', authenticateRequest, async (req, res) => {
  const user = res.locals.user
})

export default router