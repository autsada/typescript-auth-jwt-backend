import { getModelForClass, prop } from '@typegoose/typegoose'
import { ObjectType, Field, ID } from 'type-graphql'

@ObjectType({ description: 'User Model' })
export class User {
  @Field(() => ID)
  id: string

  @Field()
  @prop({ required: true, trim: true })
  username: string

  @Field()
  @prop({ required: true, trim: true, unique: true })
  email: string

  @prop({ required: true })
  password: string
}

export const UserModel = getModelForClass(User)
