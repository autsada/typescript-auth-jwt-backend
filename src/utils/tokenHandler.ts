import jwt from 'jsonwebtoken'
import { Response } from 'express'

export const createToken = (userId: string, tokenVersion: number) =>
  jwt.sign({ userId, tokenVersion }, 'Aaboltib', { expiresIn: '15d' })

export const sendToken = (res: Response, token: string) =>
  res.cookie('jwt', token, { httpOnly: true })
