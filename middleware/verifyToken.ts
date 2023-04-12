import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(403)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
    console.log(decoded)
    next()
  } catch (error) {
    console.log(error)
    res.status(401)
  }
}

export default verifyToken