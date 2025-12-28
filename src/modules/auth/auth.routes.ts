import { Router } from "express";
import { authConroller } from "./auth.controller";

const router = Router();

router.post("/auth/signup", authConroller.userRegistration);
router.post("/auth/signin", authConroller.userLogin);

export const authRoutes = router;