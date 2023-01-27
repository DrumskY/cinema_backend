import { Request, Response } from "express";
import { ValidationError } from "../errors/validation-error";
import { prisma } from "../lib/prisma-client";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { generateErrorMessage } from "zod-error";

const commentSchema = z.object({
  comment: z.string().min(10, { message: "comment is required" }),
  authorId: z.preprocess((val) => val && Number(val), z.number()),
  authorCommId: z.preprocess((val) => val && Number(val), z.number()),
});

const comment = async (req: Request, res: Response) => {
  const validation = commentSchema.safeParse(req.body);

  if (!validation.success) {
    const errorMessage = generateErrorMessage(validation.error.issues);
    throw new ValidationError(errorMessage);
  }

  const { comment, authorId, authorCommId } = validation.data;

  const token = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    },
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process.env.SESSION_SECRET!
  );

  try {
    const comm = await prisma.comment.create({
      data: {
        comment: comment,
        authorId: authorId,
        authorCommId: authorCommId,
      },
    });
    res.status(201).json({
      comm,
      token,
    });
  } catch {
    res.status(500).json("CustomErr");
  }
};

const deleteCommentSchema = z.object({
  commentId: z.preprocess((val) => val && Number(val), z.number()),
});

const deleteComment = async (req: Request, res: Response) => {
  const validation = deleteCommentSchema.safeParse(req.body);

  if (!validation.success) {
    const errorMessage = generateErrorMessage(validation.error.issues);
    throw new ValidationError(errorMessage);
  }

  const { commentId } = validation.data;

  const token = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    },
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process.env.SESSION_SECRET!
  );

  try {
    const comm = await prisma.comment.delete({
      where: {
        commentId: commentId,
      },
    });
    res.status(202).json({
      comm,
      token,
    });
  } catch {
    res.status(500).json("CustomErr");
  }
};

export default {
  comment,
  deleteComment,
};
