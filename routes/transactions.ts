import express, { Request, Response } from 'express'
import mongoose from 'mongoose'
import { z } from 'zod'
import authenticateRequest from '../middleware/authenticateRequest'
import { User, TransactionType } from '../models/User'
import verifyRequestSchema from '../middleware/verifyRequestSchema'

// /api/transactions route
const router = express.Router()

// Schema for request validation
const TransactionSchema = z.object({
  name: z.string().nonempty(),
  amount: z.number().positive(),
  type: z.union([z.literal('expense'), z.literal('income')]),
  currency: z.string().nonempty(),
  date: z.string().datetime(),
  category: z.string().nonempty(),
})

// Get all transactions
router.get('/', authenticateRequest, async (req: Request, res: Response) => {
  const user = await User.findOne({ sub: res.locals.user })
  if (!user) return res.sendStatus(500)
  const sortedTransactions = user.transactions.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
  res.json(sortedTransactions)
})

// Add a new transaction
router.post('/', [authenticateRequest, verifyRequestSchema(TransactionSchema)], async (req: Request, res: Response) => {
  const sub = res.locals.user
  const transaction = req.body as TransactionType
  const _id = new mongoose.Types.ObjectId()
  const user = await User.findOneAndUpdate(
    { sub },
    { $push: { transactions: { ...transaction, _id } } },
    { new: true }
  )
  if (!user) return res.sendStatus(500)
  const newTransaction = user.transactions[user.transactions.length - 1]
  res.status(201).json(newTransaction)
})

// Update a transaction
router.put('/:id', [authenticateRequest, verifyRequestSchema(TransactionSchema)], async (req: Request, res: Response) => {
  const transactionID = req.params.id
  const sub = res.locals.user
  const { name, amount, currency, type, date, category } = req.body as TransactionType
  const user = await User.findOneAndUpdate({ sub, 'transactions._id': transactionID }, {
    $set: {
      'transactions.$.name': name,
      'transactions.$.amount': amount,
      'transactions.$.currency': currency,
      'transactions.$.type': type,
      'transactions.$.date': date,
      'transactions.$.category': category,
    }
  }, { new: true })

  if (!user) return res.status(404).json({ error: 'Transaction not found' })

  const updatedTransaction = user.transactions.find(transaction => transaction._id == transactionID)
  res.json(updatedTransaction)
})

// Delete a transaction
router.delete('/:id', authenticateRequest, async (req: Request, res: Response) => {
  const sub = res.locals.user
  const id = req.params.id
  const user = await User.findOneAndUpdate(
    { sub, 'transactions._id': id },
    { $pull: { transactions: { _id: id } } },
    { new: true }
  )
  if (!user) return res.status(404).json({ error: 'Transaction not found' })
  res.json({ message: 'Transaction successfully deleted' })
})

export default router