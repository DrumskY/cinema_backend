import { Request, Response } from "express";
import { string, z } from "zod";
import { generateErrorMessage } from "zod-error";
import { ValidationError } from "../errors/validation-error";
import { prisma } from "../lib/prisma-client";
import jwt from "jsonwebtoken";

const seanceSchema = z.object({
  id: z.preprocess((val) => val && Number(val), z.number()),
});

const repertoire = async (req: Request, res: Response) => {
  const validation = seanceSchema.safeParse(req.query);

  if (!validation.success) {
    const errorMessage = generateErrorMessage(validation.error.issues);
    throw new ValidationError(errorMessage);
  }
  const { id } = validation.data;

  console.log("searching seance: " + id);
  const result = await prisma.seance.findUnique({
    where: {
      seanceId: id,
    },
    include: {
      movieShow: {
        select: {
          name: true,
          type: true,
          movietime: true,
          direction: true,
        },
      },
      seatAtTheSeance: {
        select: {
          cinemaArmchair: true,
          SeatingNumber: true,
          reservationNum: true,
        },
        orderBy: {
          SeatingNumber: "asc",
        },
      },
    },
  });
  console.log(result);
  res.json(result);
};

const bookingSchema = z.object({
  userId: z.preprocess((val) => val && Number(val), z.number()),
  seanceId: z.number(),
  seatReserved: z.array(z.number()),
});

const booking = async (req: Request, res: Response) => {
  const validation = bookingSchema.safeParse(req.body);

  if (!validation.success) {
    const errorMessage = generateErrorMessage(validation.error.issues);
    throw new ValidationError(errorMessage);
  }

  const { userId, seanceId, seatReserved } = validation.data;

  const token = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    },
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process.env.SESSION_SECRET!
  );

  try {
    const seats = await prisma.reservation.updateMany({
      data: {
        userReservation: userId,
      },
      where: {
        seatReservation: {
          every: {
            seanceFk: seanceId,
            cinemaArmchairFk: {
              in: seatReserved,
            },
          },
        },
      },
    });

    const q = await prisma.seating.findMany({
      where: {
        seanceFk: seanceId,
        cinemaArmchairFk: {
          in: seatReserved,
        },
      },
    });
    const reservedSeatingIds = q.map((seat) => seat.seatingId);
    console.log("q", q);
    console.log("reservedSeatingIds", reservedSeatingIds);

    const booked = await prisma.reservation.create({
      data: {
        seatReservation: {
          connect: reservedSeatingIds.map((id) => ({
            seatingId: id,
          })),
        },
        userReservation: userId,
      },
    });
    res.status(201).json({
      booked,
    });
  } catch (err) {
    res.status(500).json("CustomErr");
    console.log(err);
  }
};

const userReservationSchema = z.object({
  id: z.preprocess((val) => val && Number(val), z.number()),
});

const userReservation = async (req: Request, res: Response) => {
  const validation = userReservationSchema.safeParse(req.query);

  if (!validation.success) {
    const errorMessage = generateErrorMessage(validation.error.issues);
    throw new ValidationError(errorMessage);
  }
  const { id } = validation.data;

  const result = await prisma.reservation.findMany({
    select: {
      reservationData: true,
      seatReservation: {
        select: {
          SeatingNumber: true,
          seance: {
            select: {
              seanceData: true,
              seanceTime: true,
              movieShow: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    where: {
      userReservation: id,
    },
  });
  console.log(result);
  res.json(result);
};

export default {
  repertoire,
  booking,
  userReservation,
};
