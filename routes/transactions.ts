import express, { Request, Response } from 'express'
import mongoose from 'mongoose'
import { z } from 'zod'
import { User, TransactionType } from '../models/User'
import authenticateRequest from '../middleware/authenticateRequest'
import verifyRequestSchema from '../middleware/verifyRequestSchema'

// /api/transactions route
const router = express.Router()

// Schema for request validation
const TransactionSchema = z.object({
  name: z.string().min(1).max(25),
  amount: z.number().positive().max(100000000000),
  type: z.union([z.literal('expense'), z.literal('income')]),
  currency: z.union([z.literal('HUF'), z.literal('EUR')]),
  date: z.string().datetime(),
  category: z.string().min(1).max(25),
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
  try {
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

    if (!user) return res.sendStatus(404)

    const updatedTransaction = user.transactions.find(transaction => transaction._id == transactionID)
    res.json(updatedTransaction)
  } catch (err) {
    console.log(err)
    res.sendStatus(404)
  }
})

// Delete a transaction
router.delete('/:id', authenticateRequest, async (req: Request, res: Response) => {
  const sub = res.locals.user
  const id = req.params.id
  try {
    const user = await User.findOneAndUpdate(
      { sub, 'transactions._id': id },
      { $pull: { transactions: { _id: id } } },
      { new: true }
    )
    if (!user) return res.sendStatus(404)
    res.sendStatus(200)
  } catch (err) {
    res.sendStatus(404)
    /* NOTE: If the format of the id is invalid in the URL, it will throw an error, so I should return 500.
    If the id format is correct but it is not found in DB, it will return 404.
    So it looks nicer and it's easier to handle to always return 404 to the client. */
  }
})

export default router