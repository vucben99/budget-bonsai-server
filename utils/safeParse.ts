import { z } from 'zod'

export const safeParse = <Schema extends z.ZodTypeAny>(schema: Schema, data: unknown): z.infer<Schema> | null => {
  const result = schema.safeParse(data)
  if (result.success === false) {
    console.error("SAFE PARSE CUSTOM FUNCTION ERROR: ", result.error)
    return null
  }
  return result.data
}