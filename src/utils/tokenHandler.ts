import jwt from 'jsonwebtoken'
import { Response } from 'express'

export const createToken = (userId: string, tokenVersion: number) =>
  jwt.sign({ userId, tokenVersion }, process.env.COOKIE_SECRET!, {
    expiresIn: '15d',
  })

export const sendToken = (res: Response, token: string) =>
  res.cookie(process.env.COOKIE_NAME!, token, { httpOnly: true })

export const verifyToken = (token: string) =>
  jwt.verify(token, process.env.COOKIE_SECRET!)
