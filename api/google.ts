import axios from "axios"
import { z } from "zod"
import { EnvSchemaType } from "../utils/envParser"
import { safeParse } from "../utils/safeParse"

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
} = process.env as EnvSchemaType

const url = "https://oauth2.googleapis.com/token"

const IDTokenResponseSchema = z.object({
  id_token: z.string(),
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
  scope: z.string(),
  token_type: z.literal("Bearer"),
})

export async function getIdToken(code: string): Promise<string | null> {
  try {
    const response = await axios.post(url, {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    })

    const result = safeParse(IDTokenResponseSchema, response.data)
    if (!result) return null
    return result.id_token

  } catch (error) {
    console.log(error)
    return null
  }
}

