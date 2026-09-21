import bcrypt from "bcrypt"
import { prisma } from "../database/prisma"
import { AppRole, generateToken } from "../utils/jwt"

export class AuthService {
  async login(email: string, senha: string) {
    if (!email || !senha) {
      throw new Error("E-mail e senha são obrigatórios")
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    })

    if (!user) {
      throw new Error("Credenciais inválidas")
    }

    const valid = await bcrypt.compare(senha, user.senha)

    if (!valid) {
      throw new Error("Credenciais inválidas")
    }

    const role: AppRole = user.role === "ADMIN" ? "ADMIN" : "USER"
    const token = generateToken(user.id, role)

    return {
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cpf: user.cpf,
        role
      }
    }
  }
}
