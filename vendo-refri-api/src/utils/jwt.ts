import jwt from "jsonwebtoken"

export type AppRole = "ADMIN" | "USER"

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error("JWT_SECRET não configurado")
  }

  return secret
}

export function generateToken(userId: string, role: AppRole) {
  return jwt.sign(
    { id: userId, role },
    getJwtSecret(),
    { expiresIn: "1d" }
  )
}
