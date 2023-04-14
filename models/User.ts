import mongoose from 'mongoose'

const ExpenseSchema = new mongoose.Schema({
  name: String,
  price: Number,
  date: { type: Date, required: true, default: new Date() }
})

const CategorySchema = new mongoose.Schema({
  name: String,
  month: [{
    name: String,
    limit: Number,
    expenses: [ExpenseSchema]
  }]
})

const UserSchema = new mongoose.Schema({
  sub: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  last_login: { type: Date, required: true },
  first_name: String,
  last_name: String,
  categories: [CategorySchema]
})

export const User = mongoose.model('User', UserSchema)