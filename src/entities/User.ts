import { getModelForClass, prop } from '@typegoose/typegoose'
import { ObjectType, Field, ID } from 'type-graphql'

import { RoleOptions } from '../types'

@ObjectType({ description: 'User Model' })
export class User {
  @Field(() => ID)
  id: string

  @Field()
  @prop({ required: true, trim: true })
  username: string

  @Field()
  @prop({ required: true, trim: true, unique: true, lowercase: true })
  email: string

  @prop({ required: true })
  password: string

  @prop({ default: 0 })
  tokenVersion: number

  @prop()
  resetPasswordToken?: string

  @prop()
  resetPasswordTokenExpiry?: number

  @prop()
  facebookId?: string

  @prop()
  googleId?: string

  @Field(() => [String])
  @prop({
    type: String,
    enum: RoleOptions,
    default: [RoleOptions.client],
  })
  roles: RoleOptions[]

  @Field()
  @prop({ default: () => Date.now() + 60 * 60 * 1000 * 7 })
  createdAt: Date
}

export const UserModel = getModelForClass(User)
