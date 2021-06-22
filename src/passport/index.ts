import passport from 'passport'
import {
    Strategy as FBStrategy,
    StrategyOptionWithRequest as FBStrategyOptionWithRequest,
} from 'passport-facebook'
import {
    Strategy as GoogleStrategy,
    StrategyOptionsWithRequest as GoogleStrategyOptionsWithRequest,
} from 'passport-google-oauth20'
import { AppRequest } from '../types'

const {
    FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET,
    FACEBOOK_CALLBACK_ROUTE,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_ROUTE,
    SERVER_URI,
} = process.env

const FBConfig: FBStrategyOptionWithRequest = {
    clientID: FACEBOOK_APP_ID!,
    clientSecret: FACEBOOK_APP_SECRET!,
    callbackURL: `${SERVER_URI}${FACEBOOK_CALLBACK_ROUTE}`,
    profileFields: ['id', 'email', 'displayName', 'name'],
    passReqToCallback: true,
}

export const PassportFB = () =>
    passport.use(
        new FBStrategy(FBConfig, (req, _, __, profile, done) => {
            try {
                if (profile) {
                    ;(req as AppRequest).userProfile = profile
                    done(undefined, profile)
                }
            } catch (error) {
                done(error)
            }
        })
    )

const GoogleConfig: GoogleStrategyOptionsWithRequest = {
    clientID: GOOGLE_CLIENT_ID!,
    clientSecret: GOOGLE_CLIENT_SECRET!,
    callbackURL: `${SERVER_URI}${GOOGLE_CALLBACK_ROUTE}`,
    passReqToCallback: true,
}

export const PassportGoogle = () =>
    passport.use(
        new GoogleStrategy(GoogleConfig, (req, _, __, profile, done) => {
            try {
                if (profile) {
                    ;(req as AppRequest).userProfile = profile
                    done(undefined, profile)
                }
            } catch (error) {
                done(error)
            }
        })
    )
