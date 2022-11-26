import * as dotenv from "dotenv";
import express from "express";
require("express-async-errors");
import cors from "cors";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { Request, Response } from "express";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.static("public"));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello Stranger <br /> https://youtu.be/dQw4w9WgXcQ");
});

app.get("/movies", async (req: Request, res: Response) => {
  const movies = await prisma.movie.findMany();
  console.log(movies);
  res.json(movies);
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

app.listen(5000, () => {
  console.log("Application started on port 5000!");
});
