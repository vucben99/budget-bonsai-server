import express from 'express'
import cors from 'cors'

const app = express()
import login from './router/login'

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  console.dir(req.body)
  next()
})

app.use('/api/login', login)

export default app