import { NextFunction, Request, Response } from "express"
import { z } from "zod"

const verifyRequestSchema = <Schema extends z.ZodTypeAny>(schema: Schema) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body)
  if (result.success === false) {
    return res.status(400).json({ error: result.error })
  }
  next()
}

export default verifyRequestSchema