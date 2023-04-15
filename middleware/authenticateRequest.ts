import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UserObject } from '../routes/login'

function authenticateRequest(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.sendStatus(401)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as (UserObject | undefined)
    res.locals.user = decoded?.sub
  } catch (error) {
    console.error(error)
    return res.status(401).json({ error: 'Invalid token' })
  }
  next()
}

export default authenticateRequest