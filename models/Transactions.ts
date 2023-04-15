import mongoose, { InferSchemaType } from 'mongoose'

const TransactionsSchema = new mongoose.Schema({
  sub: { type: String, required: true, unique: true },
  transactions: [
    {
      name: { type: String, required: true },
      amount: { type: Number, required: true },
      date: { type: Date, required: true },
      category: { type: String, required: true }
    }
  ]
})

export type TransactionsObjType = InferSchemaType<typeof TransactionsSchema>
export const Transactions = mongoose.model('Transaction', TransactionsSchema)