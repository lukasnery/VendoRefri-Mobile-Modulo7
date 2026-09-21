import { Router } from "express"
import { ProductController } from "../controllers/ProductController"
import { auth, authorizeRoles } from "../middlewares/auth"
import { uploadProductImage } from "../middlewares/upload"

const router = Router()
const controller = new ProductController()

router.get("/", auth, controller.getAll)
router.get("/:id", auth, controller.getById)
router.post("/", auth, authorizeRoles("ADMIN"), uploadProductImage.single("imagem"), controller.create)
router.put("/:id", auth, authorizeRoles("ADMIN"), uploadProductImage.single("imagem"), controller.update)
router.delete("/:id", auth, authorizeRoles("ADMIN"), controller.delete)

export default router
