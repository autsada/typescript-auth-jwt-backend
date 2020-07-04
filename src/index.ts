import { config } from 'dotenv'
config()
import express from 'express'
import mongoose from 'mongoose'
import passport from 'passport'
import cookieParser from 'cookie-parser'

import createServer from './createServer'

const { PORT, DB_USER, DB_PASSWORD, DB_ENDPOINT, DB_NAME } = process.env

const startServer = async () => {
  try {
    // Connect to the database
    await mongoose.connect(
      `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_ENDPOINT}/${DB_NAME}?retryWrites=true&w=majority`,
      {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      }
    )

    const app = express()
    app.use(cookieParser())

    // Facebook login route
    app.get('/auth/facebook', passport.authenticate('facebook'))

    const server = await createServer()

    server.applyMiddleware({ app })

    app.listen({ port: PORT }, () =>
      console.log(
        `Server is ready at http://localhost:${PORT}${server.graphqlPath}`
      )
    )
  } catch (error) {
    console.log(error)
  }
}

startServer()
