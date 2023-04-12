import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import { z } from 'zod'
import mongoose from 'mongoose'

const EnvSchema = z.object({
  PORT: z.string().nonempty(),
  MONGODB_URI: z.string().nonempty()
})

const env = EnvSchema.parse(process.env)

const app = express()
const router = express.Router()

app.use(cors())
app.use(express.json())

app.use('/api/', (req, res) => {
  res.json("hello")
})

mongoose.connect(env.MONGODB_URI)
console.log('⚡️[Server] MongoDB connected')

app.listen(env.PORT, () => console.log('⚡️[Server] Server is listening on port', env.PORT))