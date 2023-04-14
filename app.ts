import express from 'express'
import cors from 'cors'
import login from './routes/login'
import user from './routes/user'

const app = express()

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  console.log("------REQUEST METADATA------")
  console.log(`${req.method} ${req.path}`)
  console.log(`Body: ${JSON.stringify(req.body)}`)
  console.log("------END OF REQUEST METADATA------")
  next()
})

app.use('/api/login', login)
app.use('/api/user', user)

export default app