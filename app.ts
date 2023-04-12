import express from 'express'
import cors from 'cors'

const app = express()
const router = express.Router()

app.use(cors())
app.use(express.json())

app.use('/api/', router)

export default app