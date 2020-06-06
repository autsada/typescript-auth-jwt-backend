import { Request, Response } from 'express'

export enum RoleOptions {
  client = 'CLIENT',
  itemEditor = 'ITEMEDITOR',
  admin = 'ADMIN',
  superAdmin = 'SUPERADMIN',
}

export interface AppRequest extends Request {
  userId?: string
  tokenVersion?: number
}

export interface AppContext {
  req: AppRequest
  res: Response
}
