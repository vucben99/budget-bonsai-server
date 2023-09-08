import express from 'express'
import cors from 'cors'
import login from './routes/login'
import transactions from './routes/transactions'
import categories from './routes/categories'

const app = express()

// Middleware
const corsOptions = {
   origin: '*', 
   credentials: true,
   optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())

// Routes
app.use('/api/login', login)
app.use('/api/transactions', transactions)
app.use('/api/categories', categories)

export default app
