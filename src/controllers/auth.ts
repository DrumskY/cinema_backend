import { Request, Response } from "express";
import { string, z } from "zod";
import { generateErrorMessage } from "zod-error";
import { ValidationError } from "../errors/validation-error";
import { prisma } from "../lib/prisma-client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NotFoundError } from "@prisma/client/runtime";
import { UnautenticatedError } from "../errors/unautenticated-error";

const registerSchema = z.object({
  username: z.string().min(5, { message: "username is required" }),
  first_name: z.string().min(3, { message: "First name is required" }),
  last_name: z.string().min(3, { message: "Last name is required" }),
  email: z
    .string()
    .min(5, { message: "email is required" })
    .email({ message: "provide valid email address" }),
  password: z.string().min(6, { message: "password is required" }),
});

const register = async (req: Request, res: Response) => {
  const validation = registerSchema.safeParse(req.body);

  if (!validation.success) {
    const errorMessage = generateErrorMessage(validation.error.issues);
    throw new ValidationError(errorMessage);
  }

  const { username, first_name, last_name, email, password } = validation.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username: username,
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: hashedPassword,
      },
    });
    res.status(201).json(user);
  } catch {
    res.status(500).json("CustomErr");
  }
};

const loginSchema = z.object({
  email: z
    .string()
    .min(5, { message: "email is required" })
    .email({ message: "provide valid email address" }),
  password: z.string().min(6, { message: "password is required" }),
});

const login = async (req: Request, res: Response) => {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    const errorMessage = generateErrorMessage(validation.error.issues);
    throw new ValidationError(errorMessage);
  }

  const { email, password } = validation.data;
  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });

  console.log(user);

  if (user == null) {
    throw new NotFoundError("No user with that email");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  console.log("proccessss", process.env.SESSION_SECRET);

  if (isPasswordCorrect) {
    const token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        data: {
          user_id: user.userId,
          login: user.username,
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      process.env.SESSION_SECRET!
    );
    res.status(200).json({
      user: {
        id: user.userId,
        name: user.username,
        role: user.role,
      },
      token,
    });
  } else {
    throw new UnautenticatedError("Wrong email or password");
  }
};

const profile = async (req: Request, res: Response) => {
  const user = await prisma.user.findMany({
    where: {
      username: req.params.username,
    },
  });
  console.log(user);
  res.json(user);
};

export default {
  register,
  login,
  profile,
};
