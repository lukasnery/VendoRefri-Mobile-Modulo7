import { Request, Response } from "express"
import { UserService } from "../services/UserService"

export class UserController {
  async create(req: Request, res: Response) {
    try {
      const { nome, email, senha, cpf } = req.body
      const service = new UserService()
      const user = await service.create(nome, email, senha, cpf)
      return res.status(201).json(user)
    } catch (error: any) {
      return res.status(400).json({ message: error.message })
    }
  }

  async me(req: Request, res: Response) {
    try {
      const service = new UserService()
      const user = await service.getById(req.user!.id)
      return res.status(200).json(user)
    } catch (error: any) {
      return res.status(404).json({ message: error.message })
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string

      if (req.user?.role !== "ADMIN" && req.user?.id !== id) {
        return res.status(403).json({ message: "Acesso não autorizado" })
      }

      const service = new UserService()
      const user = await service.getById(id)
      return res.status(200).json(user)
    } catch (error: any) {
      return res.status(404).json({ message: error.message })
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { page = "1", limit = "10" } = req.query
      const service = new UserService()
      const users = await service.getAll(Number(page), Number(limit))
      return res.status(200).json(users)
    } catch (error: any) {
      return res.status(400).json({ message: error.message })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string

      if (req.user?.role !== "ADMIN" && req.user?.id !== id) {
        return res.status(403).json({ message: "Acesso não autorizado" })
      }

      const { nome, senha, cpf } = req.body
      const service = new UserService()
      const user = await service.update(id, nome, senha, cpf)
      return res.status(200).json(user)
    } catch (error: any) {
      return res.status(400).json({ message: error.message })
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string

      if (req.user?.role !== "ADMIN" && req.user?.id !== id) {
        return res.status(403).json({ message: "Acesso não autorizado" })
      }

      const service = new UserService()
      await service.delete(id)
      return res.status(200).json({ message: "Usuário excluído com sucesso" })
    } catch (error: any) {
      return res.status(400).json({ message: error.message })
    }
  }
}
