import jwt from 'jsonwebtoken'
import { Response } from 'express'

export const createToken = (userId: string, tokenVersion: number) =>
    jwt.sign({ userId, tokenVersion }, process.env.COOKIE_SECRET!, {
        expiresIn: '15d',
    })

export const sendToken = (res: Response, token: string) =>
    res.cookie(process.env.COOKIE_NAME!, token, {
        httpOnly: true,
        domain: process.env.FRONTEND_URI,
        // secure: true,
        // sameSite: 'none',
    })

export const verifyToken = (token: string) =>
    jwt.verify(token, process.env.COOKIE_SECRET!)
