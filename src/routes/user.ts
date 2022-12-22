import { Router } from "express";
import authUser from "../controllers/auth";

const router = Router();

router.get("/profile/:username", authUser.profile);

export default router;
