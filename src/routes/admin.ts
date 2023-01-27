import { Router } from "express";
import adminRouter from "../controllers/admin-panel";
import { Request, Response } from "express";
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public");
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

const storageDesc = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/image");
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});

const uploadDesc = multer({ storage: storageDesc });

const router = Router();

router.post(
  "/addimage",
  upload.single("image"),
  (req: Request, res: Response) => {
    res.send("Success");
  }
);

router.post(
  "/addimagedesc",
  uploadDesc.single("image"),
  (req: Request, res: Response) => {
    res.send("Success");
  }
);

router.post("/addmovie", adminRouter.addmovie);

export default router;
