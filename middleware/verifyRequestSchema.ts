import { safeParse } from "../utils/safeParse"
import { NextFunction, Request, Response } from "express"
import { z } from "zod"

const verifyRequestSchema = <Schema extends z.ZodTypeAny>(schema: Schema) => (req: Request, res: Response, next: NextFunction) => {
  const result = safeParse(schema, req.body)
  if (!result) return res.sendStatus(400)
  next()
}

export default verifyRequestSchema