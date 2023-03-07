"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const zod_error_1 = require("zod-error");
const validation_error_1 = require("../errors/validation-error");
const prisma_client_1 = require("../lib/prisma-client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const seanceSchema = zod_1.z.object({
    id: zod_1.z.preprocess((val) => val && Number(val), zod_1.z.number()),
});
const repertoire = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validation = seanceSchema.safeParse(req.query);
    if (!validation.success) {
        const errorMessage = (0, zod_error_1.generateErrorMessage)(validation.error.issues);
        throw new validation_error_1.ValidationError(errorMessage);
    }
    const { id } = validation.data;
    console.log("searching seance: " + id);
    const result = yield prisma_client_1.prisma.seance.findUnique({
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
});
const bookingSchema = zod_1.z.object({
    userId: zod_1.z.preprocess((val) => val && Number(val), zod_1.z.number()),
    seanceId: zod_1.z.number(),
    seatReserved: zod_1.z.array(zod_1.z.number()),
});
const booking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validation = bookingSchema.safeParse(req.body);
    if (!validation.success) {
        const errorMessage = (0, zod_error_1.generateErrorMessage)(validation.error.issues);
        throw new validation_error_1.ValidationError(errorMessage);
    }
    const { userId, seanceId, seatReserved } = validation.data;
    const token = jsonwebtoken_1.default.sign({
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
    }, 
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process.env.SESSION_SECRET);
    try {
        const seats = yield prisma_client_1.prisma.reservation.updateMany({
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
        const q = yield prisma_client_1.prisma.seating.findMany({
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
        const booked = yield prisma_client_1.prisma.reservation.create({
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
    }
    catch (err) {
        res.status(500).json("CustomErr");
        console.log(err);
    }
});
const userReservationSchema = zod_1.z.object({
    id: zod_1.z.preprocess((val) => val && Number(val), zod_1.z.number()),
});
const userReservation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validation = userReservationSchema.safeParse(req.query);
    if (!validation.success) {
        const errorMessage = (0, zod_error_1.generateErrorMessage)(validation.error.issues);
        throw new validation_error_1.ValidationError(errorMessage);
    }
    const { id } = validation.data;
    const result = yield prisma_client_1.prisma.reservation.findMany({
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
});
exports.default = {
    repertoire,
    booking,
    userReservation,
};
