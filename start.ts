import dotenv from 'dotenv'
dotenv.config()
import { env } from './utils/envParser'

import mongoose from 'mongoose'
import app from "./app"

async function connect() {
  await mongoose.connect(env.MONGODB_URI)
  console.log('⚡️[Server] MongoDB connected')

  app.listen(env.PORT, () => console.log('⚡️[Server] Server is listening on port', env.PORT))
}

connect()