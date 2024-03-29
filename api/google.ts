import axios from "axios"
import { z } from "zod"
import { EnvSchemaType } from "../utils/envParser"
import { safeParse } from "../utils/safeParse"

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
} = process.env as EnvSchemaType

console.log("REDIRECT_URI FROM ENV: ", REDIRECT_URI)
console.log("GOOGLE_CLIENT_ID FROM ENV: ", GOOGLE_CLIENT_ID)
console.log("GOOGLE_CLIENT_SECRET FROM ENV: ", GOOGLE_CLIENT_SECRET)

const url = "https://oauth2.googleapis.com/token"

const IDTokenResponseSchema = z.object({
  id_token: z.string(),
  // access_token: z.string(),
  // refresh_token: z.string(),
  // expires_in: z.number(),
  // scope: z.string(),
  // token_type: z.literal("Bearer"),
})
type IDTokenResponseType = z.infer<typeof IDTokenResponseSchema>

export async function getIdToken(code: string): Promise<string | null> {
  let response

  const data = {
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
  }

  console.log("googlenek küldjük: ", data)

  try {
    response = await axios.post(url, data)
    console.log("GOOGLE RESPONSE: ", response)

    const result = safeParse(IDTokenResponseSchema, response.data)
    console.log("safeParse result: ", result)
    if (!result) return null
    return result.id_token


  } catch (error) {
    console.error(error)
    console.log("GOOGLE RESPONSE: ", response)
    console.log("catch ágba futott a getIdToken")
    return null
  }
}

