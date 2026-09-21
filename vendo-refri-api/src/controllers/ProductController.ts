import { Request, Response } from "express"
import { ProductService } from "../services/ProductService"
import { deleteUploadedProductImage } from "../middlewares/upload"

function numberValue(value: unknown, field: string) {
  if (value === undefined || value === null || value === "") return undefined
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) throw new Error(`${field} inválido`)
  return parsed
}

export class ProductController {
  async create(req: Request, res: Response) {
    try {
      const preco = numberValue(req.body.preco, "Preço")
      const estoque = numberValue(req.body.estoque, "Estoque")

      if (preco === undefined || estoque === undefined) {
        throw new Error("Preço e estoque são obrigatórios")
      }

      const service = new ProductService()
      const product = await service.create({
        nome: req.body.nome,
        preco,
        estoque,
        imagemUrl: req.file ? `/uploads/products/${req.file.filename}` : null,
        imagemNome: req.file?.filename || null
      })

      return res.status(201).json(product)
    } catch (error: any) {
      if (req.file) deleteUploadedProductImage(req.file.filename)
      return res.status(400).json({ message: error.message })
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { page = "1", limit = "10" } = req.query
      const service = new ProductService()
      const products = await service.getAll(Number(page), Number(limit))
      return res.status(200).json(products)
    } catch (error: any) {
      return res.status(400).json({ message: error.message })
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const service = new ProductService()
      const product = await service.getById(req.params.id as string)
      return res.status(200).json(product)
    } catch (error: any) {
      return res.status(404).json({ message: error.message })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string
      const service = new ProductService()

      const { current, updated } = await service.update(id, {
        ...(req.body.nome !== undefined && { nome: req.body.nome }),
        ...(req.body.preco !== undefined && { preco: numberValue(req.body.preco, "Preço") }),
        ...(req.body.estoque !== undefined && { estoque: numberValue(req.body.estoque, "Estoque") }),
        ...(req.file && {
          imagemUrl: `/uploads/products/${req.file.filename}`,
          imagemNome: req.file.filename
        })
      })

      if (req.file && current.imagemNome) {
        deleteUploadedProductImage(current.imagemNome)
      }

      return res.status(200).json(updated)
    } catch (error: any) {
      if (req.file) deleteUploadedProductImage(req.file.filename)
      return res.status(400).json({ message: error.message })
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const service = new ProductService()
      const product = await service.delete(req.params.id as string)
      deleteUploadedProductImage(product.imagemNome)
      return res.status(200).json({ message: "Produto excluído com sucesso" })
    } catch (error: any) {
      return res.status(400).json({ message: error.message })
    }
  }
}
