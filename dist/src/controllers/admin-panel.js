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
Object.defineProperty(exports, "__esModule", { value: true });
const validation_error_1 = require("../errors/validation-error");
const prisma_client_1 = require("../lib/prisma-client");
const zod_1 = require("zod");
const zod_error_1 = require("zod-error");
const addMovieSchema = zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.string(),
    image: zod_1.z.string(),
    imagedesc: zod_1.z.string(),
    movietime: zod_1.z.string(),
    direction: zod_1.z.string(),
    rating: zod_1.z.preprocess((val) => val && Number(val), zod_1.z.number()),
    description: zod_1.z.string(),
});
const addmovie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validation = addMovieSchema.safeParse(req.body);
    if (!validation.success) {
        const errorMessage = (0, zod_error_1.generateErrorMessage)(validation.error.issues);
        throw new validation_error_1.ValidationError(errorMessage);
    }
    const { name, type, image, imagedesc, movietime, direction, rating, description, } = validation.data;
    try {
        const add = yield prisma_client_1.prisma.movie.create({
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
    }
    catch (_a) {
        res.status(500).json("CustomErr");
    }
});
const setScreeningSchema = zod_1.z.object({
    movieId: zod_1.z.number(),
    cinemaHallid: zod_1.z.preprocess((val) => val && Number(val), zod_1.z.number()),
    seanceTime: zod_1.z.string(),
    seanceData: zod_1.z.string(),
});
const setscreening = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validation = setScreeningSchema.safeParse(req.body);
    if (!validation.success) {
        const errorMessage = (0, zod_error_1.generateErrorMessage)(validation.error.issues);
        throw new validation_error_1.ValidationError(errorMessage);
    }
    const { seanceData, seanceTime, movieId, cinemaHallid } = validation.data;
    try {
        const movie = yield prisma_client_1.prisma.movie.findUnique({ where: { movieId } });
        if (!movie) {
            return res.status(404).send({ error: "Movie not found" });
        }
        const cinemaHall = yield prisma_client_1.prisma.cinema_hall.findUnique({
            where: { cinemaHallid },
        });
        if (!cinemaHall) {
            return res.status(404).send({ error: "Cinema hall not found" });
        }
        const seance = yield prisma_client_1.prisma.seance.create({
            data: {
                seanceData,
                seanceTime,
                movieShow: { connect: { movieId } },
                cinemaHall: { connect: { cinemaHallid } },
            },
        });
        console.log("seance: ", seance);
        const armchairs = yield prisma_client_1.prisma.cinema_armchair.findMany({
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
        const seating = yield prisma_client_1.prisma.seating.createMany({
            data: seats,
        });
        return res.status(200).send({ data: seating });
    }
    catch (error) {
        return res.status(500).json("CustomErr");
    }
});
exports.default = {
    addmovie,
    setscreening,
};
