import { UserModel } from '../entities/User'

export const isAuthenticated = async (
  userId: string,
  tokenVersion?: number
) => {
  // Query user from the database
  const user = await UserModel.findById(userId)

  if (!user) throw new Error('Not authenticated.')

  // Check if token version is valid
  if (tokenVersion !== user.tokenVersion) throw new Error('Not authenticated.')

  return user
}
