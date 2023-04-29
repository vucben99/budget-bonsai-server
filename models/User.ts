import mongoose, { InferSchemaType } from 'mongoose'

const Transaction = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  currency: { type: String, required: true },
  date: { type: Date, required: true },
  category: { type: String, required: true },
  _id: mongoose.Types.ObjectId
})
export type TransactionType = InferSchemaType<typeof Transaction>

const UserSchema = new mongoose.Schema({
  sub: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, default: "" },
  last_login: { type: Date, required: true },
  transactions: [Transaction]
})
type UserType = InferSchemaType<typeof UserSchema>

export const User = mongoose.model<UserType>('User', UserSchema)