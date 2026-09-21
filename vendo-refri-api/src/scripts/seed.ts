import bcrypt from "bcrypt"
import { prisma } from "../database/prisma"

async function main() {
  const nome = process.env.ADMIN_NAME || "Administrador"
  const email = (process.env.ADMIN_EMAIL || "admin@vendorefri.com").toLowerCase()
  const senha = process.env.ADMIN_PASSWORD || "Troque@123456"
  const cpf = (process.env.ADMIN_CPF || "52998224725").replace(/\D/g, "")

  const senhaHash = await bcrypt.hash(senha, 10)

  const admin = await prisma.user.upsert({
    where: { email },
    update: { nome, senha: senhaHash, cpf, role: "ADMIN" },
    create: { nome, email, senha: senhaHash, cpf, role: "ADMIN" }
  })

  const products = [
    { nome: "Coca-Cola 2L", preco: 12.9, estoque: 24 },
    { nome: "Guaraná 2L", preco: 10.5, estoque: 18 },
    { nome: "Água Mineral 500ml", preco: 3.5, estoque: 40 }
  ]

  if ((await prisma.product.count()) === 0) {
    await prisma.product.createMany({ data: products })
  }

  console.log(`Seed concluído. Admin: ${admin.email}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
