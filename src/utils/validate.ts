export const validateUsername = (username: string) => {
  const fmtUsername = username.trim()

  return fmtUsername.length >= 3 && fmtUsername.length <= 60
}

export const validateEmail = (email: string) => {
  const fmtEmail = email.trim().toLowerCase()

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

  return emailRegex.test(fmtEmail)
}

export const validatePassword = (password: string) =>
  password.length >= 6 && password.length <= 50
