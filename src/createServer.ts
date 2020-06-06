import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'

import { AuthResolvers } from './resolvers/AuthResolvers'
import { verifyToken } from './utils/tokenHandler'
import { AppContext } from './types'

export default async () => {
  const schema = await buildSchema({
    resolvers: [AuthResolvers],
    emitSchemaFile: { path: './src/schema.graphql' },
    validate: false,
  })

  return new ApolloServer({
    schema,
    context: ({ req, res }: AppContext) => {
      const token = req.cookies[process.env.COOKIE_NAME!]

      if (token) {
        try {
          // Verify token
          const decodedToken = verifyToken(token) as {
            userId: string
            tokenVersion: number
            iat: number
            exp: number
          } | null

          if (decodedToken) {
            req.userId = decodedToken.userId
            req.tokenVersion = decodedToken.tokenVersion
          }
        } catch (error) {
          req.userId = undefined
          req.tokenVersion = undefined
        }
      }

      return { req, res }
    },
  })
}
