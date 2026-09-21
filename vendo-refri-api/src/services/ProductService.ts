import { prisma } from "../database/prisma"

export type ProductInput = {
  nome: string
  preco: number
  estoque: number
  imagemUrl?: string | null
  imagemNome?: string | null
}

export class ProductService {
  private validate(input: Partial<ProductInput>, isUpdate = false) {
    if (!isUpdate && !input.nome) throw new Error("Nome é obrigatório")

    if (input.nome !== undefined && input.nome.trim().length < 2) {
      throw new Error("O nome deve possuir ao menos 2 caracteres")
    }

    if (input.preco !== undefined && (!Number.isFinite(input.preco) || input.preco <= 0)) {
      throw new Error("O preço deve ser maior que zero")
    }

    if (input.estoque !== undefined && (!Number.isInteger(input.estoque) || input.estoque < 0)) {
      throw new Error("O estoque deve ser um número inteiro maior ou igual a zero")
    }
  }

  async create(input: ProductInput) {
    this.validate(input)

    return prisma.product.create({
      data: {
        nome: input.nome.trim(),
        preco: input.preco,
        estoque: input.estoque,
        imagemUrl: input.imagemUrl || null,
        imagemNome: input.imagemNome || null
      }
    })
  }

  async getAll(page: number, limit: number) {
    const safePage = Math.max(1, page || 1)
    const safeLimit = Math.min(50, Math.max(1, limit || 10))
    const skip = (safePage - 1) * safeLimit

    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        skip,
        take: safeLimit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.product.count()
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

  async getById(id: string) {
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) throw new Error("Produto não encontrado")
    return product
  }

  async update(id: string, input: Partial<ProductInput>) {
    this.validate(input, true)

    const current = await this.getById(id)

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(input.nome !== undefined && { nome: input.nome.trim() }),
        ...(input.preco !== undefined && { preco: input.preco }),
        ...(input.estoque !== undefined && { estoque: input.estoque }),
        ...(input.imagemUrl !== undefined && { imagemUrl: input.imagemUrl }),
        ...(input.imagemNome !== undefined && { imagemNome: input.imagemNome })
      }
    })

    return { current, updated }
  }

  async delete(id: string) {
    const product = await this.getById(id)

    const linkedOrder = await prisma.order.findFirst({ where: { productId: id } })
    if (linkedOrder) {
      throw new Error("Produto possui pedidos vinculados e não pode ser excluído")
    }

    await prisma.product.delete({ where: { id } })
    return product
  }
}
