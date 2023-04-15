import mongoose from 'mongoose'

const ExpenseSchema = new mongoose.Schema({
  sub: { type: String, required: true, unique: true },
  expenses: [
    {
      name: { type: String, required: true },
      amount: { type: Number, required: true },
      date: { type: Date, required: true },
      category: { type: String, required: true },
    }
  ]
})

export const Expense = mongoose.model('Expense', ExpenseSchema)