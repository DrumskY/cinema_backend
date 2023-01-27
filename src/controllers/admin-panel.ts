import multer from "multer";
import { Request, Response } from "express";
import { ValidationError } from "../errors/validation-error";
import { prisma } from "../lib/prisma-client";
import { z } from "zod";
import { generateErrorMessage } from "zod-error";

const addMovieSchema = z.object({
  name: z.string(),
  type: z.string(),
  image: z.string(),
  imagedesc: z.string(),
  movietime: z.string(),
  direction: z.string(),
  rating: z.preprocess((val) => val && Number(val), z.number()),
  description: z.string(),
});

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public");
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${file.originalname}`);
//   },
// });
// const upload = multer({ storage });
// upload.single("image");

const addmovie = async (req: Request, res: Response) => {
  const validation = addMovieSchema.safeParse(req.body);

  if (!validation.success) {
    const errorMessage = generateErrorMessage(validation.error.issues);
    throw new ValidationError(errorMessage);
  }

  const {
    name,
    type,
    image,
    imagedesc,
    movietime,
    direction,
    rating,
    description,
  } = validation.data;

  try {
    const add = await prisma.movie.create({
      data: {
        name: name,
        type: type,
        movietime: movietime,
        direction: direction,
        image: image,
        imagedesc: imagedesc,
        rating: rating,
        description: description,
      },
    });
    res.status(201).json({
      add,
    });
  } catch {
    res.status(500).json("CustomErr");
  }
};

export default {
  addmovie,
};
