import mongoose, {InferSchemaType} from 'mongoose'

const Expense = new mongoose.Schema({
  name: { type: String, required: true, default: "Unknown", maxlength: 30 },
  amount: { type: Number, required: true },
  date: { type: Date, required: true, default: Date.now() },
})
type ExpenseType = InferSchemaType<typeof Expense>

const MonthlyData = new mongoose.Schema({
  month: { type: String, required: true },
  expenses: { type: [Expense], default: [] },
})
type MonthlyDataType = InferSchemaType<typeof MonthlyData>

const Category = new mongoose.Schema({
  name: { type: String, required: true },
  months: { type: [MonthlyData], default: [] }
})
type CategoryType = InferSchemaType<typeof Category>

const DefaultCategories = [
  { name: "Food", months: [] },
  { name: "Transport", months: [] },
  { name: "Entertainment", months: [] },
  { name: "Clothes", months: [] },
  { name: "Health", months: [] },
  { name: "Education", months: [] },
  { name: "Housing", months: [] },
  { name: "Bills", months: [] },
  { name: "Gifts", months: [] },
  { name: "Income", months: [] },
  { name: "Other", months: [] },
]

const UserSchema = new mongoose.Schema({
  sub: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  last_login: { type: Date, required: true },
  categories: { type: [Category], default: DefaultCategories },
})
type UserType = InferSchemaType<typeof UserSchema>


export const User = mongoose.model<UserType>('User', UserSchema)