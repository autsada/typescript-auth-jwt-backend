import { randomBytes } from 'crypto'
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  ObjectType,
  Field,
} from 'type-graphql'
import bcrypt from 'bcryptjs'
import Sendgrid, { MailDataRequired } from '@sendgrid/mail'

import { User, UserModel } from '../entities/User'
import {
  validateUsername,
  validateEmail,
  validatePassword,
} from '../utils/validate'
import { createToken, sendToken } from '../utils/tokenHandler'
import { AppContext } from '../types'
import { isAuthenticated } from '../utils/authHandler'

Sendgrid.setApiKey(process.env.SENDGRID_API_KEY!)

@ObjectType()
export class ResponseMessage {
  @Field()
  message: string
}

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

  @Query(() => User, { nullable: true }) // [User]!
  async me(@Ctx() { req }: AppContext): Promise<User | null> {
    try {
      if (!req.userId) throw new Error('Please log in to proceed.')

      // Check if user is authenticated
      const user = await isAuthenticated(req.userId, req.tokenVersion)

      // if (!user) throw new Error('Not authenticated')

      return user
    } catch (error) {
      throw error
    }
  }

  @Mutation(() => User, { nullable: true })
  async signup(
    @Arg('username') username: string,
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() { res }: AppContext
  ): Promise<User | null> {
    try {
      if (!username) throw new Error('Username is required.')
      if (!email) throw new Error('Email is required.')
      if (!password) throw new Error('Password is required.')

      // Check if email exist in the database
      const user = await UserModel.findOne({ email })

      if (user) throw new Error('Email already in use, please sign in instead.')

      // Validate username
      const isUsernameValid = validateUsername(username)

      if (!isUsernameValid)
        throw new Error('Username must be between 3 - 60 characters.')

      // Validate email
      const isEmailValid = validateEmail(email)

      if (!isEmailValid) throw new Error('Email is invalid.')

      // Validate password
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

  @Mutation(() => User, { nullable: true })
  async signin(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() { res }: AppContext
  ): Promise<User | null> {
    try {
      if (!email) throw new Error('Email is required.')
      if (!password) throw new Error('Password is required.')

      // Check if email exist in the database
      const user = await UserModel.findOne({ email })

      if (!user) throw new Error('Email not found.')

      // Check if the password is valid

      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) throw new Error('Email or password is invalid')

      // Create token
      const token = createToken(user.id, user.tokenVersion)

      // Send token to the frontend
      sendToken(res, token)

      return user
    } catch (error) {
      throw error
    }
  }

  @Mutation(() => ResponseMessage, { nullable: true })
  async signout(
    @Ctx() { req, res }: AppContext
  ): Promise<ResponseMessage | null> {
    try {
      // Check if email exist in the database
      const user = await UserModel.findById(req.userId)

      if (!user) return null

      // Bump up token version
      user.tokenVersion = user.tokenVersion + 1
      await user.save()

      // Clear cookie in the brower
      res.clearCookie(process.env.COOKIE_NAME!)

      return { message: 'Goodbye' }
    } catch (error) {
      throw error
    }
  }

  @Mutation(() => ResponseMessage, { nullable: true })
  async requestResetPassword(
    @Arg('email') email: string
  ): Promise<ResponseMessage | null> {
    try {
      if (!email) throw new Error('Email is required.')

      // Check if email exist in the database
      const user = await UserModel.findOne({ email })

      if (!user) throw new Error('Email not found.')

      const resetPasswordToken = randomBytes(16).toString('hex')
      const resetPasswordTokenExpiry = Date.now() + 1000 * 60 * 30

      // Update user in the database
      const updatedUser = await UserModel.findOneAndUpdate(
        { email },
        { resetPasswordToken, resetPasswordTokenExpiry },
        { new: true }
      )

      if (!updatedUser) throw new Error('Sorry, cannot proceed.')

      // Send email to user's email
      const message: MailDataRequired = {
        from: 'admin@test.com',
        to: email,
        subject: 'Reset password',
        html: `
          <div>
            <p>Please click below link to reset your password.</p>
            <a href='http://localhost:5000/?resetToken=${resetPasswordToken}' target='blank'>Click to reset password</a>
          </div>
        `,
      }

      const response = await Sendgrid.send(message)

      if (!response || response[0]?.statusCode !== 202)
        throw new Error('Sorry, cannot proceed.')

      return { message: 'Please check your email to reset password' }
    } catch (error) {
      throw error
    }
  }

  @Mutation(() => ResponseMessage, { nullable: true })
  async resetPassword(
    @Arg('password') password: string,
    @Arg('token') token: string
  ): Promise<ResponseMessage | null> {
    try {
      if (!password) throw new Error('Password is required.')
      if (!token) throw new Error('Sorry, cannot proceed.')

      // Check if email exist in the database
      const user = await UserModel.findOne({ resetPasswordToken: token })

      if (!user) throw new Error('Sorry, cannot proceed.')

      if (!user.resetPasswordTokenExpiry)
        throw new Error('Sorry, cannot proceed.')

      // Check if token is valid
      const isTokenValid = Date.now() <= user.resetPasswordTokenExpiry

      if (!isTokenValid) throw new Error('Sorry, cannot proceed.')

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Update user in the database
      const updatedUser = await UserModel.findOneAndUpdate(
        { email: user.email },
        {
          password: hashedPassword,
          resetPasswordToken: undefined,
          resetPasswordTokenExpiry: undefined,
        },
        { new: true }
      )

      if (!updatedUser) throw new Error('Sorry, cannot proceed.')

      return { message: 'Successfully reset password.' }
    } catch (error) {
      throw error
    }
  }
}
