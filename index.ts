import dotenv from 'dotenv'
dotenv.config()
import { env } from './utils/envParser'

import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

const app = express()
const router = express.Router()

app.use(cors())
app.use(express.json())

app.use('/api/', router)

async function connect() {
  await mongoose.connect(env.MONGODB_URI)
  console.log('⚡️[Server] MongoDB connected')

  app.listen(env.PORT, () => console.log('⚡️[Server] Server is listening on port', env.PORT))
}

connect()