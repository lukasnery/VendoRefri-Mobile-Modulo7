import bcrypt from "bcrypt"
import { prisma } from "../database/prisma"
import { validateCPF } from "../utils/validateCPF"

const publicUserSelect = {
  id: true,
  nome: true,
  email: true,
  cpf: true,
  role: true,
  createdAt: true,
  updatedAt: true
} as const

export class UserService {
  async create(nome: string, email: string, senha: string, cpf: string) {
    if (!nome || !email || !senha || !cpf) {
      throw new Error("Todos os campos são obrigatórios")
    }

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedCpf = cpf.replace(/\D/g, "")

    if (nome.trim().length < 2) throw new Error("Nome inválido")
    if (!normalizedEmail.includes("@")) throw new Error("E-mail inválido")
    if (senha.length < 6) throw new Error("A senha deve possuir ao menos 6 caracteres")
    if (!validateCPF(normalizedCpf)) throw new Error("CPF inválido")

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { cpf: normalizedCpf }]
      }
    })

    if (existing) throw new Error("E-mail ou CPF já cadastrado")

    const senhaHash = await bcrypt.hash(senha, 10)

    return prisma.user.create({
      data: {
        nome: nome.trim(),
        email: normalizedEmail,
        senha: senhaHash,
        cpf: normalizedCpf,
        role: "USER"
      },
      select: publicUserSelect
    })
  }

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: publicUserSelect
    })

    if (!user) throw new Error("Usuário não encontrado")
    return user
  }

  async getAll(page: number, limit: number) {
    const safePage = Math.max(1, page || 1)
    const safeLimit = Math.min(50, Math.max(1, limit || 10))
    const skip = (safePage - 1) * safeLimit

    const [items, total] = await prisma.$transaction([
      prisma.user.findMany({
        skip,
        take: safeLimit,
        select: publicUserSelect,
        orderBy: { createdAt: "desc" }
      }),
      prisma.user.count()
    ])

    return {
      items,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.max(1, Math.ceil(total / safeLimit))
      }
    }
  }

  async update(id: string, nome?: string, senha?: string, cpf?: string) {
    await this.getById(id)

    let senhaHash: string | undefined
    let normalizedCpf: string | undefined

    if (senha) {
      if (senha.length < 6) throw new Error("A senha deve possuir ao menos 6 caracteres")
      senhaHash = await bcrypt.hash(senha, 10)
    }

    if (cpf) {
      normalizedCpf = cpf.replace(/\D/g, "")
      if (!validateCPF(normalizedCpf)) throw new Error("CPF inválido")

      const cpfOwner = await prisma.user.findUnique({ where: { cpf: normalizedCpf } })
      if (cpfOwner && cpfOwner.id !== id) throw new Error("CPF já cadastrado")
    }

    if (nome !== undefined && nome.trim().length < 2) throw new Error("Nome inválido")

    return prisma.user.update({
      where: { id },
      data: {
        ...(nome !== undefined && { nome: nome.trim() }),
        ...(senhaHash && { senha: senhaHash }),
        ...(normalizedCpf && { cpf: normalizedCpf })
      },
      select: publicUserSelect
    })
  }

  async delete(id: string) {
    const user = await this.getById(id)

    const linkedOrder = await prisma.order.findFirst({ where: { userId: id } })
    if (linkedOrder) throw new Error("Usuário possui pedidos vinculados e não pode ser excluído")

    await prisma.user.delete({ where: { id } })
    return user
  }
}
