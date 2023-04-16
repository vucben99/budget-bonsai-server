import express from 'express'
import cors from 'cors'
import login from './routes/login'
import transactions from './routes/transactions'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/login', login)
app.use('/api/transactions', transactions)

export default app