import express, { Request, Response } from 'express'
import axios from 'axios'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { User } from '../models/User'
import verifyToken from '../middleware/verifyToken'
import { EnvSchemaType } from '../utils/envParser'

const router = express.Router()

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  JWT_SECRET
} = process.env as EnvSchemaType


// ! Parseolni Zoddal a requestet
router.post('/login', async (req, res) => {
  const googleResponse = await axios.post('https://oauth2.googleapis.com/token', { // ! trycatch
    code: req.body.code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: 'http://localhost:5173/finishlogin',
    grant_type: 'authorization_code'
  })

  console.log(googleResponse.data)

  const userData: any = jwt.decode(googleResponse.data.id_token)
  console.log(userData)

  const foundUser = await User.findOne({ sub: userData?.sub })
  if (!foundUser) await User.create({ sub: userData?.sub, email: userData?.email, last_login: new Date() })
  else await User.findOneAndUpdate({ sub: userData?.sub }, { last_login: new Date() })


  const user = await User.findOne({ sub: userData?.sub })
  const ownJwtPayload: JwtPayload = { id: user?._id }
  const sessionToken = jwt.sign(ownJwtPayload, JWT_SECRET, { expiresIn: '24h' })

  res.status(200).json({ sessionToken })
})

router.get('/public', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Public content' })
})

router.get('/private', verifyToken, (req: Request, res: Response) => {
  res.status(200).json({ message: 'Private content' })
})

export default router