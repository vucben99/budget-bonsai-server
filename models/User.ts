import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  sub: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  last_login: { type: Date, required: true }
})

export const User = mongoose.model('User', UserSchema)