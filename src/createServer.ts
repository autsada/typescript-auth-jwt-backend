import { ApolloServer, gql } from 'apollo-server-express'

import { UserModel } from './entities/User'

const typeDefs = gql`
  type User {
    id: String!
    username: String!
    email: String!
    password: String!
  }

  type Query {
    users: [User]!
  }

  type Mutation {
    createUser(username: String!, email: String!, password: String!): User
  }
`

interface InputArgs {
  username: string
  email: string
  password: string
}

const resolvers = {
  Query: {
    users: () => UserModel.find(),
  },

  Mutation: {
    createUser: async (_: any, args: InputArgs) => {
      try {
        const { username, email, password } = args

        const newUser = await UserModel.create({
          username,
          email,
          password,
        })

        return newUser
      } catch (error) {
        throw error
      }
    },
  },
}

export default () => {
  return new ApolloServer({ typeDefs, resolvers })
}
