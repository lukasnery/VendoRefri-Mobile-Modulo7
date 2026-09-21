import { Router } from "express"
import { OrderController } from "../controllers/OrderController"
import { auth } from "../middlewares/auth"

const router = Router()
const controller = new OrderController()

router.post("/", auth, controller.create)
router.get("/", auth, controller.getAll)
router.get("/:id", auth, controller.getById)
router.delete("/:id", auth, controller.delete)

export default router
