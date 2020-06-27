import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'

import { AuthResolvers } from './resolvers/AuthResolvers'
import { verifyToken, createToken, sendToken } from './utils/tokenHandler'
import { AppContext } from './types'
import { UserModel } from './entities/User'

export default async () => {
  const schema = await buildSchema({
    resolvers: [AuthResolvers],
    emitSchemaFile: { path: './src/schema.graphql' },
    validate: false,
  })

  return new ApolloServer({
    schema,
    context: async ({ req, res }: AppContext) => {
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

            // Re generate token if below conditions are met
            if (Date.now() / 1000 - decodedToken.iat > 6 * 60 * 60) {
              const user = await UserModel.findById(req.userId)

              if (user) {
                // Check if the token version is correct

                if (user.tokenVersion === req.tokenVersion) {
                  // Update the token version in the user info in the database
                  user.tokenVersion = user.tokenVersion + 1

                  const updatedUser = await user.save()

                  if (updatedUser) {
                    // Create token
                    const token = createToken(
                      updatedUser.id,
                      updatedUser.tokenVersion
                    )

                    req.tokenVersion = updatedUser.tokenVersion

                    // Send token to the frontend
                    sendToken(res, token)
                  }
                }
              }
            }
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

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZWY2ZTkwZTIyMDliMjg5MjQ5MmY3ODciLCJ0b2tlblZlcnNpb24iOjYsImlhdCI6MTU5MzI0MTE2MCwiZXhwIjoxNTk0NTM3MTYwfQ.M8aeQHTPi6Qg3VIU0wA0mRMhFmnbA2GIGGYLji7JSog
