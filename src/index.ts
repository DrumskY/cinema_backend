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
  res.send("Hello <3");
});

app.get("/movies", async (req: Request, res: Response) => {
  const movies = await prisma.movie.findMany();
  console.log(movies);
  res.json(movies);
});

app.listen(5000, () => {
  console.log("Application started on port 5000!");
});
