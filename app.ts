import express from 'express'
import cors from 'cors'
import login from './routes/login'
import transactions from './routes/transactions'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/login', login)
app.use('/api/transactions', transactions)

export default app