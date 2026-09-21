import fs from "fs"
import path from "path"
import crypto from "crypto"
import multer from "multer"

const uploadDir = path.resolve(process.cwd(), "uploads", "products")
fs.mkdirSync(uploadDir, { recursive: true })

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"])
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"])

function uniqueFileName(originalName: string) {
  const extension = path.extname(originalName).toLowerCase()
  const base = path.basename(originalName, extension)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "imagem"

  let candidate = `${base}-${Date.now()}-${crypto.randomUUID()}${extension}`

  while (fs.existsSync(path.join(uploadDir, candidate))) {
    candidate = `${base}-${Date.now()}-${crypto.randomUUID()}${extension}`
  }

  return candidate
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, uniqueFileName(file.originalname))
})

export const uploadProductImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  },
  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase()
    const extensionOk = allowedExtensions.has(extension)
    const mimeOk = allowedMimeTypes.has(file.mimetype)

    if (!extensionOk || !mimeOk) {
      return cb(new Error("Imagem inválida. Use JPG, JPEG, PNG ou WEBP."))
    }

    return cb(null, true)
  }
})

export function deleteUploadedProductImage(fileName?: string | null) {
  if (!fileName) return

  const safeName = path.basename(fileName)
  const fullPath = path.join(uploadDir, safeName)

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath)
  }
}
