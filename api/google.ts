import axios from "axios"
import { z } from "zod"
import { EnvSchemaType } from "../index"

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
} = process.env as EnvSchemaType

const url = "https://oauth2.googleapis.com/token"

export const getIdToken = async (code: string): Promise<string | null> => {
  const Response = z.object({
    id_token: z.string(),
    access_token: z.string(),
    refresh_token: z.string(),
    expires_in: z.number(),
    scope: z.string(),
    token_type: z.literal("Bearer"),
  })
  type Response = z.infer<typeof Response>


  try {
    const response = await axios.post(url, {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    })
    const result = Response.safeParse(response.data)
    console.log(result)
    if (result.success === false) {
      console.log(result.error)
      return null
    }
    return result.data.id_token
  } catch (error) {
    console.log(error)
    return null
  }
}

