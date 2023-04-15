import express from 'express'
import authenticateRequest from '../middleware/authenticateRequest'
import { User } from '../models/User'
import { Expense } from '../models/Expense'

// /api/user route
const router = express.Router()

// Get all expenses of user
router.get('/expenses', authenticateRequest, async (req, res) => {
  const expenses = await Expense.findOne({ sub: res.locals.user})
  if (!expenses) return res.status(404).json({ error: 'User does not exist' })
  res.json(expenses.expenses)
})

router.get('/expenses/:month', authenticateRequest, async (req, res) => {
  const user = res.locals.user
})

export default router