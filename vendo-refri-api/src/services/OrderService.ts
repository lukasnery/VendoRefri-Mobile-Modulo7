import { prisma } from "../database/prisma"
import { AppRole } from "../utils/jwt"

export class OrderService {
  async create(userId: string, productId: string, quantidade: number) {
    if (!productId || !Number.isInteger(quantidade) || quantidade <= 0) {
      throw new Error("Produto e quantidade válida são obrigatórios")
    }

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } })
      if (!product) throw new Error("Produto não encontrado")

      // A atualização condicional impede que duas compras concorrentes
      // ultrapassem o estoque disponível e levem o saldo a valor negativo.
      const stockUpdate = await tx.product.updateMany({
        where: {
          id: productId,
          estoque: { gte: quantidade }
        },
        data: { estoque: { decrement: quantidade } }
      })

      if (stockUpdate.count !== 1) {
        throw new Error("Estoque insuficiente")
      }

      return tx.order.create({
        data: { userId, productId, quantidade },
        include: {
          product: true,
          user: {
            select: { id: true, nome: true, email: true, role: true }
          }
        }
      })
    })
  }

  async getAll(userId: string, role: AppRole, page: number, limit: number) {
    const safePage = Math.max(1, page || 1)
    const safeLimit = Math.min(50, Math.max(1, limit || 10))
    const where = role === "ADMIN" ? {} : { userId }

    const [items, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
        include: {
          product: true,
          user: { select: { id: true, nome: true, email: true, role: true } }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.order.count({ where })
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

  async getById(id: string, userId: string, role: AppRole) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        product: true,
        user: { select: { id: true, nome: true, email: true, role: true } }
      }
    })

    if (!order) throw new Error("Pedido não encontrado")
    if (role !== "ADMIN" && order.userId !== userId) throw new Error("Acesso não autorizado")
    return order
  }

  async delete(id: string, userId: string, role: AppRole) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id } })
      if (!order) throw new Error("Pedido não encontrado")
      if (role !== "ADMIN" && order.userId !== userId) throw new Error("Acesso não autorizado")

      await tx.order.delete({ where: { id } })
      await tx.product.update({
        where: { id: order.productId },
        data: { estoque: { increment: order.quantidade } }
      })

      return order
    })
  }
}
