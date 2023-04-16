import express, { Request, Response } from 'express'
import { z } from 'zod'
import authenticateRequest from '../middleware/authenticateRequest'
import { Transactions, TransactionsObjType } from '../models/Transactions'
import verifyRequestSchema from '../middleware/verifyRequestSchema'



// Schemas for request body validation
const TransactionSchema = z.object({
  name: z.string().nonempty(),
  amount: z.number(),
  currency: z.string().nonempty(),
  date: z.string().nonempty(),
  category: z.string().nonempty(),
})
type TransactionType = z.infer<typeof TransactionSchema>


// /api/expenses route
const router = express.Router()

// Get all transactions
router.get('/', authenticateRequest, async (req: Request, res: Response) => {
  const transactionsObj = await Transactions.findOne<TransactionsObjType>({ sub: res.locals.user })
  if (!transactionsObj) return res.status(404).json({ error: 'User does not exist' })
  res.json(transactionsObj.transactions)
})

// Add a new transaction
router.post('/', [authenticateRequest, verifyRequestSchema(TransactionSchema)], async (req: Request, res: Response) => {
  const user = res.locals.user
  const transaction = req.body as TransactionType
  const transactionList = await Transactions.findOneAndUpdate(
    { sub: user },
    { $push: { transactions: transaction } },
    { new: true }
  )
  if (!transactionList) return res.status(404).json({ error: 'User does not exist' })

  res.json(transactionList.transactions)
})

// Update a transaction
router.put('/:id', [authenticateRequest, verifyRequestSchema(TransactionSchema)], async (req: Request, res: Response) => {
  const user = res.locals.user
  const id = req.params.id
  const { name, amount, currency, date, category } = req.body as TransactionType
  const updatedTransactionObj = await Transactions.findOneAndUpdate({ sub: user, 'transactions._id': id }, {
    $set: {
      'transactions.$.name': name,
      'transactions.$.amount': amount,
      'transactions.$.currency': currency,
      'transactions.$.date': date,
      'transactions.$.category': category
    }
  }, { new: true })

  if (!updatedTransactionObj) return res.status(404).json({ error: 'Transaction does not exist with given ID' })

  res.json(updatedTransactionObj.transactions)
})

// Delete a transaction
router.delete('/:id', authenticateRequest, async (req: Request, res: Response) => {
  const user = res.locals.user
  const id = req.params.id
  const newTransactionList = await Transactions.findOneAndUpdate(
    { sub: user },
    { $pull: { transactions: { _id: id } } },
    { new: true }
  )
  if (!newTransactionList) return res.status(404).json({ error: 'User does not exist' })
  res.json(newTransactionList.transactions)
})

export default router