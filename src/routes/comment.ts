import { Router } from "express";
import accessComment from "../controllers/access";

const router = Router();

router.post("/add", accessComment.comment);
router.post("/delete", accessComment.deleteComment);

export default router;
