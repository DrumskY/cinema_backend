import { Router } from "express";
import authRouter from "../controllers/auth";

const router = Router();

router.post("/register", authRouter.register);
router.post("/login", authRouter.login);
// router.get("/logout", authRouter.logout);

export default router;
