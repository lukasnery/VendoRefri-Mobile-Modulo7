import { Router } from "express"
import { UserController } from "../controllers/UserController"
import { auth, authorizeRoles } from "../middlewares/auth"

const router = Router()
const controller = new UserController()

router.post("/", controller.create)
router.get("/me", auth, controller.me)
router.get("/", auth, authorizeRoles("ADMIN"), controller.getAll)
router.get("/:id", auth, controller.getById)
router.put("/:id", auth, controller.update)
router.delete("/:id", auth, controller.delete)

export default router
