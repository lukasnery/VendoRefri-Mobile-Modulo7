import { Request, Response } from "express"
import { OrderService } from "../services/OrderService"

export class OrderController {
  async create(req: Request, res: Response) {
    try {
      const { productId, quantidade } = req.body
      const service = new OrderService()
      const order = await service.create(req.user!.id, productId, Number(quantidade))
      return res.status(201).json(order)
    } catch (error: any) {
      return res.status(400).json({ message: error.message })
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { page = "1", limit = "10" } = req.query
      const service = new OrderService()
      const orders = await service.getAll(
        req.user!.id,
        req.user!.role,
        Number(page),
        Number(limit)
      )
      return res.status(200).json(orders)
    } catch (error: any) {
      return res.status(400).json({ message: error.message })
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const service = new OrderService()
      const order = await service.getById(req.params.id as string, req.user!.id, req.user!.role)
      return res.status(200).json(order)
    } catch (error: any) {
      return res.status(404).json({ message: error.message })
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const service = new OrderService()
      await service.delete(req.params.id as string, req.user!.id, req.user!.role)
      return res.status(200).json({ message: "Pedido cancelado e estoque restituído" })
    } catch (error: any) {
      return res.status(400).json({ message: error.message })
    }
  }
}
