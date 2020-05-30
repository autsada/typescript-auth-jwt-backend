import { Request, Response } from 'express'

export enum RoleOptions {
  client = 'CLIENT',
  itemEditor = 'ITEMEDITOR',
  admin = 'ADMIN',
  superAdmin = 'SUPERADMIN',
}

export interface AppContext {
  req: Request
  res: Response
}
