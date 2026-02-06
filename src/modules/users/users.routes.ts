import { Router } from "express";
import { userController } from "./users.controller";
import auth from "../../middleware/auth";


const router = Router();
// get all users admin only
router.get("/users", auth("admin"), userController.getAllUsers);
// update user profile admin , customer
router.put("/users/:id", auth("admin", "customer"), userController.updateUser);
// delete user admin only
router.delete("/users/:id", auth("admin"), userController.deleteUserById);

export const userRoutes = router;