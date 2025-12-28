import { Router } from "express";
import { userController } from "./users.controller";
import auth from "../../middleware/auth";


const router = Router();

router.get("/users", auth("admin"), userController.getAllUsers);
router.put("/users/:id", auth("admin", "customer"), userController.updateUser);
router.delete("/users/:id", auth("admin"), userController.deleteUserById);

export const userRoutes = router;