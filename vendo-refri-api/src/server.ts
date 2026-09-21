import path from "path"
import express, { NextFunction, Request, Response } from "express"
import cors from "cors"
import multer from "multer"
import { config } from "dotenv"

import orderRoutes from "./routes/orderRoutes"
import authRoutes from "./routes/authRoutes"
import userRoutes from "./routes/userRoutes"
import productRoutes from "./routes/productRoutes"

config()

export const app = express()

const configuredOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

app.disable("x-powered-by")
app.use(cors({
  origin(origin, callback) {
    if (!origin || configuredOrigins.includes("*") || configuredOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error("Origem não permitida pelo CORS"))
  },
  credentials: true
}))
app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true, limit: "1mb" }))
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads"), {
  dotfiles: "deny",
  maxAge: "1h"
}))

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", app: "VendoRefri Mobile API" })
})

app.use("/auth", authRoutes)
app.use("/users", userRoutes)
app.use("/products", productRoutes)
app.use("/orders", orderRoutes)

app.get("/", (_req, res) => {
  res.json({
    name: "VendoRefri Mobile API",
    version: "2.0.0",
    health: "/health"
  })
})

app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "A imagem excede o limite de 5 MB" })
    }
    return res.status(400).json({ message: `Falha no upload: ${error.message}` })
  }

  if (error?.message?.includes("Imagem inválida")) {
    return res.status(400).json({ message: error.message })
  }

  if (error?.message?.includes("CORS")) {
    return res.status(403).json({ message: error.message })
  }

  console.error(error)
  return res.status(500).json({ message: "Erro interno do servidor" })
})

const port = Number(process.env.PORT || 3000)

if (process.env.NODE_ENV !== "test") {
  app.listen(port, "0.0.0.0", () => {
    console.log(`VendoRefri Mobile API rodando em http://0.0.0.0:${port}`)
  })
}
