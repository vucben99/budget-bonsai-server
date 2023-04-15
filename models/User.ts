import mongoose, { InferSchemaType } from 'mongoose'

// const DefaultCategories = [
//   { name: "Food", months: [] },
//   { name: "Transport", months: [] },
//   { name: "Entertainment", months: [] },
//   { name: "Clothes", months: [] },
//   { name: "Health", months: [] },
//   { name: "Education", months: [] },
//   { name: "Housing", months: [] },
//   { name: "Bills", months: [] },
//   { name: "Gifts", months: [] },
//   { name: "Income", months: [] },
//   { name: "Other", months: [] },
// ]

const UserSchema = new mongoose.Schema({
  sub: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, default: "" },
  last_login: { type: Date, required: true },
})
type UserType = InferSchemaType<typeof UserSchema>


export const User = mongoose.model<UserType>('User', UserSchema)