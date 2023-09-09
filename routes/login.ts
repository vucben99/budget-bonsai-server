import express from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { User } from '../models/User'
import verifyRequestSchema from '../middleware/verifyRequestSchema'
import { getIdToken } from '../api/google'
import { EnvSchemaType } from '../utils/envParser'
import { safeParse } from '../utils/safeParse'

// /api/login route
const router = express.Router()

const { JWT_SECRET } = process.env as EnvSchemaType

const AuthCodeRequestSchema = z.object({
  code: z.string().nonempty()
})
type AuthCodeRequest = z.infer<typeof AuthCodeRequestSchema>

export const UserObjectSchema = z.object({
  sub: z.string(),
  email: z.string().email(),
  given_name: z.string(),
  family_name: z.string().optional(),
  picture: z.string().url()
})
export type UserObject = z.infer<typeof UserObjectSchema>

router.post('/', verifyRequestSchema(AuthCodeRequestSchema), async (req, res) => {

  const reqData = req.body as AuthCodeRequest

  try {
    // Get id_token from Google
    const idToken = await getIdToken(reqData.code)
    console.log("id_token: ", idToken)
    if (!idToken) return res.send({
      error: "id_token error"
    }).status(401)

    // Decode and safeParse id_token
    const idTokenPayload: unknown = jwt.decode(idToken)
    const userObject = safeParse(UserObjectSchema, idTokenPayload)
    if (!userObject) return res.sendStatus(500)

    // Handle DB stuff
    const user = await User.findOne({ sub: userObject.sub })
    if (user) await User.updateOne({ sub: userObject.sub }, { $set: { last_login: new Date() } })
    else {
      await User.create({
        sub: userObject.sub,
        email: userObject.email,
        last_login: new Date(),
        transactions: [],
        categories: []
      })
    }

    // Sign and send sessionToken
    const sessionToken = jwt.sign({
      sub: userObject.sub,
      first_name: userObject.given_name,
      last_name: userObject.family_name || "",
      picture: userObject.picture
    }, JWT_SECRET, { expiresIn: "24h" })
    res.json({ sessionToken })

  } catch (err) {
    console.error(err)
    res.status(500)
  }
})

export default router