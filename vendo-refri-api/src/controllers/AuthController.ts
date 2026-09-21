import { Request, Response } from "express"
import { AuthService } from "../services/AuthService"

export class AuthController {

  async login(req: Request, res: Response) {

    try {

      const { email, senha } = req.body

      const service = new AuthService()

      const result = await service.login(
        email,
        senha
      )

      return res.status(200).json(result)

    } catch (error: any) {

      return res.status(400).json({
        message: error.message
      })

    }
  }
}