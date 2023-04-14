import express from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { User } from '../models/User'
import { EnvSchemaType } from '../utils/envParser'
import { verifyRequest } from '../middleware/verifyRequest'
import { getIdToken } from '../api/google'
import { safeParse } from '../utils/safeParse'

const router = express.Router()

const { JWT_SECRET } = process.env as EnvSchemaType

const AuthCodeRequestSchema = z.object({
  code: z.string().nonempty()
})
type AuthCodeRequest = z.infer<typeof AuthCodeRequestSchema>

const UserObjectSchema = z.object({
  sub: z.string(),
  email: z.string().email(),
})
type UserObject = z.infer<typeof UserObjectSchema>

router.post('/', verifyRequest(AuthCodeRequestSchema), async (req, res) => {

  const reqData = req.body as AuthCodeRequest

  try {
    // Get id_token from Google
    const idToken = await getIdToken(reqData.code)
    if (!idToken) return res.sendStatus(401)

    // Decode and parse id_token
    const idTokenPayload: unknown = jwt.decode(idToken)
    const userObject = safeParse(UserObjectSchema, idTokenPayload)
    console.log("Parsed ID_TOKEN:", userObject)
    if (!userObject) return res.sendStatus(500)

    // Handle db stuff
    const user = await User.findOne({ sub: userObject.sub })
    if (user) await User.updateOne({ sub: userObject.sub }, { $set: { last_login: new Date() } })
    else await User.create({ sub: userObject.sub, email: userObject.email, last_login: new Date() })

    // Sign JWT
    const sessionToken = jwt.sign({ sub: userObject.sub }, JWT_SECRET, { expiresIn: "1h" })
    res.json({ sessionToken })

  } catch (error) {
    console.error(error)
    res.status(500)
  }
})

export default router