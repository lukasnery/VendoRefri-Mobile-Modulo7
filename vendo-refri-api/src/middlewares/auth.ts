import { Request, Response, NextFunction } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import { AppRole, getJwtSecret } from "../utils/jwt"

interface TokenPayload extends JwtPayload {
  id: string
  role: AppRole
}

export function auth(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization

  if (!authorization) {
    return res.status(401).json({ message: "Token não informado" })
  }

  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : authorization

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as TokenPayload

    req.user = {
      id: decoded.id,
      role: decoded.role === "ADMIN" ? "ADMIN" : "USER"
    }

    return next()
  } catch {
    return res.status(401).json({ message: "Token inválido ou expirado" })
  }
}

export function authorizeRoles(...roles: AppRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Usuário não autenticado" })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Acesso não autorizado para este perfil" })
    }

    return next()
  }
}
