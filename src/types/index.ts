import { Request, Response } from 'express'
import { Profile } from 'passport-facebook'

export enum RoleOptions {
  client = 'CLIENT',
  itemEditor = 'ITEMEDITOR',
  admin = 'ADMIN',
  superAdmin = 'SUPERADMIN',
}

export interface AppRequest extends Request {
  userId?: string
  tokenVersion?: number
  userProfile?: Profile
}

export interface AppContext {
  req: AppRequest
  res: Response
}
