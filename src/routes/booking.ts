import { Router } from "express";
import authBooking from "../controllers/booking";

const router = Router();

router.get("/repertoire", authBooking.repertoire);
router.post("/reserve", authBooking.booking);

export default router;
