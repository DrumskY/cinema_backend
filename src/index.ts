import * as dotenv from "dotenv";
import express from "express";
require("express-async-errors");
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth";
import authUser from "./routes/user";
import accessComment from "./routes/comment";
import authBooking from "./routes/booking";
import adminRouter from "./routes/admin";

import bodyParser from "body-parser";
import authMiddleware from "./middlewares/is-logged";
import { prisma } from "./lib/prisma-client";

import { Request, Response } from "express";
import { z } from "zod";
import { ValidationError } from "./errors/validation-error";
import { errorHandlerMiddleware } from "./middlewares/error-handler";
import { generateErrorMessage } from "zod-error";
import { NotFoundError } from "./errors/not-found-error";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.static("public"));

const jsonParser = bodyParser.json();
app.use(jsonParser);
app.use(morgan("tiny"));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello Stranger <br /> https://youtu.be/dQw4w9WgXcQ");
});

app.get("/movies", async (req: Request, res: Response) => {
  const movies = await prisma.movie.findMany();
  console.log(movies);
  res.json(movies);
});

app.get("/movies/search", async (req: Request, res: Response) => {
  const givenParam = req.query.searchParam as string;
  console.log("searching movies which name contain: " + givenParam);
  const result = await prisma.movie.findMany({
    take: 4,
    where: {
      name: {
        contains: givenParam,
      },
    },
  });
  console.log(result);
  res.json(result);
});

app.get("/seance/repertoire", async (req: Request, res: Response) => {
  const givenParam = req.query.searchParam as string;
  console.log("searching movies which name contain: " + givenParam);
  const result = await prisma.movie.findMany({
    include: {
      movieSeance: {
        where: {
          seanceData: {
            contains: givenParam,
          },
        },
      },
    },
  });
  console.log(result);
  res.json(result);
});

// const seanceSchema = z.object({
//   id: z.preprocess((val) => val && Number(val), z.number()),
// });

// app.get("/booking/repertoire", async (req: Request, res: Response) => {
//   const validation = seanceSchema.safeParse(req.query);

//   if (!validation.success) {
//     const errorMessage = generateErrorMessage(validation.error.issues);
//     throw new ValidationError(errorMessage);
//   }
//   const { id } = validation.data;

//   console.log("searching seance: " + id);
//   const result = await prisma.seance.findUnique({
//     where: {
//       seanceId: id,
//     },
//     include: {
//       movieShow: {
//         select: {
//           name: true,
//           type: true,
//           movietime: true,
//           direction: true,
//         },
//       },
//       seatAtTheSeance: {
//         select: {
//           cinemaArmchair: true,
//           SeatingNumber: true,
//           reservationNum: true,
//         },
//       },
//     },
//   });
//   console.log(result);
//   res.json(result);
// });

const movieDetailsSchema = z.object({
  id: z.preprocess((val) => val && Number(val), z.number()),
});

app.get("/movies/details", async (req: Request, res: Response) => {
  const validation = movieDetailsSchema.safeParse(req.query);

  if (!validation.success) {
    const errorMessage = generateErrorMessage(validation.error.issues);
    throw new ValidationError(errorMessage);
  }

  const { id } = validation.data;
  const result = await prisma.movie.findUnique({
    where: {
      movieId: id,
    },
    include: {
      movieComment: {
        include: {
          author: {
            select: {
              userId: true,
              username: true,
            },
          },
        },
      },
    },
  });
  if (result) {
    res.json(result);
  } else {
    throw new NotFoundError("Movie not found");
  }
  console.log(result);
});

app.get("/movies/rating", async (req: Request, res: Response) => {
  const movies = await prisma.movie.findMany({
    orderBy: {
      rating: "desc",
    },
  });
  console.log(movies);
  res.json(movies);
});

app.get("/movies/rateasc", async (req: Request, res: Response) => {
  const movies = await prisma.movie.findMany({
    orderBy: {
      movieId: "desc",
    },
  });
  console.log(movies);
  res.json(movies);
});

// app.get("/seanceall", async (req: Request, res: Response) => {
//   const movies = await prisma.seance.findMany();
//   console.log(movies);
//   res.json(movies);
// });

app.get("/armchaireall", async (req: Request, res: Response) => {
  const movies = await prisma.cinema_armchair.findMany();
  console.log(movies);
  res.json(movies);
});

app.get("/movies/random", async (req: Request, res: Response) => {
  const randomId = Math.floor(Math.random() * 10) + 1;
  console.log(randomId);
  const movies = await prisma.movie.findMany({
    where: {
      movieId: randomId,
    },
  });
  console.log(movies);
  res.json(movies);
});

app.use("/booking", authBooking);

app.use("/api/auth", authRoutes);

app.use(authMiddleware);

app.use("/comment", accessComment);

app.use("/admin", adminRouter);

app.use("/api/auth", authUser);

app.use(errorHandlerMiddleware);

app.listen(5000, () => {
  console.log("Application started on port 5000!");
});
