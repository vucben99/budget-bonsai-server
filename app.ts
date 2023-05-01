import express from 'express'
import cors from 'cors'
import login from './routes/login'
import transactions from './routes/transactions'
import categories from './routes/categories'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
  console.log(`body: ${JSON.stringify(req.body)}}`)
  next()
})

// Routes
app.use('/api/login', login)
app.use('/api/transactions', transactions)
app.use('/api/categories', categories)

export default app