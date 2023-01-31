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

const setScreeningSchema = z.object({
  movieId: z.number(),
  cinemaHallid: z.preprocess((val) => val && Number(val), z.number()),
  seanceTime: z.string(),
  seanceData: z.string(),
});

const setscreening = async (req: Request, res: Response) => {
  const validation = setScreeningSchema.safeParse(req.body);

  if (!validation.success) {
    const errorMessage = generateErrorMessage(validation.error.issues);
    throw new ValidationError(errorMessage);
  }

  const { seanceData, seanceTime, movieId, cinemaHallid } = validation.data;
  try {
    const movie = await prisma.movie.findUnique({ where: { movieId } });
    if (!movie) {
      return res.status(404).send({ error: "Movie not found" });
    }
    const cinemaHall = await prisma.cinema_hall.findUnique({
      where: { cinemaHallid },
    });
    if (!cinemaHall) {
      return res.status(404).send({ error: "Cinema hall not found" });
    }
    const seance = await prisma.seance.create({
      data: {
        seanceData,
        seanceTime,
        movieShow: { connect: { movieId } },
        cinemaHall: { connect: { cinemaHallid } },
      },
    });
    console.log("seance: ", seance);
    const armchairs = await prisma.cinema_armchair.findMany({
      where: { chairInHall: { cinemaHallid } },
    });
    console.log(armchairs);
    const seats = armchairs.map((armchair, seatId) => {
      seatId++;
      return {
        SeatingNumber: seatId,
        seanceFk: seance.seanceId,
        cinemaArmchairFk: armchair.cinemaArmchairId,
      };
    });
    console.log(seats);
    const seating = await prisma.seating.createMany({
      data: seats,
    });
    return res.status(200).send({ data: seating });
  } catch (error) {
    return res.status(500).json("CustomErr");
  }
};

export default {
  addmovie,
  setscreening,
};
