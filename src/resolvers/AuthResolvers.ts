import { Resolver, Query, Mutation, Arg, Ctx } from 'type-graphql'
import bcrypt from 'bcryptjs'

import { User, UserModel } from '../entities/User'
import {
  validateUsername,
  validateEmail,
  validatePassword,
} from '../utils/validate'
import { createToken, sendToken } from '../utils/tokenHandler'
import { AppContext } from '../types'

@Resolver()
export class AuthResolvers {
  @Query(() => [User], { nullable: 'items' }) // [User]!
  async users(): Promise<User[] | null> {
    try {
      return UserModel.find()
    } catch (error) {
      throw error
    }
  }

  @Mutation(() => User)
  async signUp(
    @Arg('username') username: string,
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() { res }: AppContext
  ) {
    try {
      // Validate username
      if (!username) throw new Error('Username is required.')

      const isUsernameValid = validateUsername(username)

      if (!isUsernameValid)
        throw new Error('Username must be between 3 - 60 characters.')

      // Validate email
      if (!email) throw new Error('Email is required.')

      const isEmailValid = validateEmail(email)

      if (!isEmailValid) throw new Error('Email is invalid.')

      // Validate password
      if (!password) throw new Error('Password is required.')
      const isPasswordValid = validatePassword(password)

      if (!isPasswordValid)
        throw new Error('Password must be between 6 - 50 characters.')

      const hashedPassword = await bcrypt.hash(password, 10)

      const newUser = await UserModel.create({
        username,
        email,
        password: hashedPassword,
      })

      await newUser.save()

      // Create token
      const token = createToken(newUser.id, newUser.tokenVersion)

      // Send token to the frontend
      sendToken(res, token)

      return newUser
    } catch (error) {
      throw error
    }
  }
}
