import { Response } from 'express'

import { AppRequest } from '../types'
import { UserModel, User } from '../entities/User'
import { createToken, sendToken } from '../utils/tokenHandler'

const { FRONTEND_URI } = process.env

export const FBAuthenticate = async (req: AppRequest, res: Response) => {
  if (!req.userProfile) return

  const { id, emails, displayName, provider } = req.userProfile

  try {
    // Query user from the database
    const user = await UserModel.findOne({ facebookId: id })
    let token: string

    if (!user) {
      // New user --> create new user on our database
      const newUser = await UserModel.create<
        Pick<User, 'username' | 'email' | 'facebookId' | 'password'>
      >({
        username: displayName,
        email: (emails && emails[0].value) || provider,
        facebookId: id,
        password: provider,
      })

      await newUser.save()

      // Create token
      token = createToken(newUser.id, newUser.tokenVersion)

      // Send token to the frontend
      sendToken(res, token)

      // Redirect user to the frontend --> dashboard
      res.redirect(`${FRONTEND_URI}/dashboard`)
    } else {
      // Old user
      // Create token
      token = createToken(user.id, user.tokenVersion)

      // Send token to the frontend
      sendToken(res, token)

      // Redirect user to the frontend --> dashboard
      res.redirect(`${FRONTEND_URI}/dashboard`)
    }
  } catch (error) {
    res.redirect(FRONTEND_URI!)
  }
}

export const GoogleAuthenticate = async (req: AppRequest, res: Response) => {
  if (!req.userProfile) return

  const { id, emails, displayName, provider } = req.userProfile

  try {
    // Query user from the database
    const user = await UserModel.findOne({ googleId: id })
    let token: string

    if (!user) {
      // New user --> create new user on our database
      const newUser = await UserModel.create<
        Pick<User, 'username' | 'email' | 'googleId' | 'password'>
      >({
        username: displayName,
        email: (emails && emails[0].value) || provider,
        googleId: id,
        password: provider,
      })

      await newUser.save()

      // Create token
      token = createToken(newUser.id, newUser.tokenVersion)

      // Send token to the frontend
      sendToken(res, token)

      // Redirect user to the frontend --> dashboard
      res.redirect(`${FRONTEND_URI}/dashboard`)
    } else {
      // Old user
      // Create token
      token = createToken(user.id, user.tokenVersion)

      // Send token to the frontend
      sendToken(res, token)

      // Redirect user to the frontend --> dashboard
      res.redirect(`${FRONTEND_URI}/dashboard`)
    }
  } catch (error) {
    res.redirect(FRONTEND_URI!)
  }
}
