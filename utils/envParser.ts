import { z } from 'zod'

export const EnvSchema = z.object({
  PORT: z.string().nonempty(),
  MONGODB_URI: z.string().nonempty(),
  GOOGLE_CLIENT_ID: z.string().nonempty(),
  GOOGLE_CLIENT_SECRET: z.string().nonempty(),
  JWT_SECRET: z.string().nonempty(),
  REDIRECT_URI: z.string().nonempty(),
})
export type EnvSchemaType = z.infer<typeof EnvSchema>

export const env = EnvSchema.parse(process.env)