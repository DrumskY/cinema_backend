"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const dotenv = __importStar(require("dotenv"));
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const comment_1 = __importDefault(require("./routes/comment"));
const booking_1 = __importDefault(require("./routes/booking"));
const admin_1 = __importDefault(require("./routes/admin"));
const body_parser_1 = __importDefault(require("body-parser"));
const is_logged_1 = __importDefault(require("./middlewares/is-logged"));
const prisma_client_1 = require("./lib/prisma-client");
const zod_1 = require("zod");
const validation_error_1 = require("./errors/validation-error");
const error_handler_1 = require("./middlewares/error-handler");
const zod_error_1 = require("zod-error");
const not_found_error_1 = require("./errors/not-found-error");
dotenv.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.static("public"));
const jsonParser = body_parser_1.default.json();
app.use(jsonParser);
app.use((0, morgan_1.default)("tiny"));
app.get("/", (req, res) => {
    res.send("Hello Stranger <br /> https://youtu.be/dQw4w9WgXcQ");
});
app.get("/movies", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const movies = yield prisma_client_1.prisma.movie.findMany();
    console.log(movies);
    res.json(movies);
}));
app.get("/movies/search", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const givenParam = req.query.searchParam;
    console.log("searching movies which name contain: " + givenParam);
    const result = yield prisma_client_1.prisma.movie.findMany({
        take: 4,
        where: {
            name: {
                contains: givenParam,
            },
        },
    });
    console.log(result);
    res.json(result);
}));
app.get("/seance/repertoire", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const givenParam = req.query.searchParam;
    console.log("searching movies which name contain: " + givenParam);
    const result = yield prisma_client_1.prisma.movie.findMany({
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
}));
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
const movieDetailsSchema = zod_1.z.object({
    id: zod_1.z.preprocess((val) => val && Number(val), zod_1.z.number()),
});
app.get("/movies/details", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validation = movieDetailsSchema.safeParse(req.query);
    if (!validation.success) {
        const errorMessage = (0, zod_error_1.generateErrorMessage)(validation.error.issues);
        throw new validation_error_1.ValidationError(errorMessage);
    }
    const { id } = validation.data;
    const result = yield prisma_client_1.prisma.movie.findUnique({
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
    }
    else {
        throw new not_found_error_1.NotFoundError("Movie not found");
    }
    console.log(result);
}));
app.get("/movies/rating", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const movies = yield prisma_client_1.prisma.movie.findMany({
        orderBy: {
            rating: "desc",
        },
    });
    console.log(movies);
    res.json(movies);
}));
app.get("/movies/rateasc", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const movies = yield prisma_client_1.prisma.movie.findMany({
        orderBy: {
            movieId: "desc",
        },
    });
    console.log(movies);
    res.json(movies);
}));
// app.get("/seanceall", async (req: Request, res: Response) => {
//   const movies = await prisma.seance.findMany();
//   console.log(movies);
//   res.json(movies);
// });
app.get("/armchaireall", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const movies = yield prisma_client_1.prisma.cinema_armchair.findMany();
    console.log(movies);
    res.json(movies);
}));
app.get("/movies/random", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const randomId = Math.floor(Math.random() * 10) + 1;
    console.log(randomId);
    const movies = yield prisma_client_1.prisma.movie.findMany({
        where: {
            movieId: randomId,
        },
    });
    console.log(movies);
    res.json(movies);
}));
app.use("/booking", booking_1.default);
app.use("/api/auth", auth_1.default);
app.use(is_logged_1.default);
app.use("/comment", comment_1.default);
app.use("/admin", admin_1.default);
app.use("/api/auth", user_1.default);
app.use(error_handler_1.errorHandlerMiddleware);
app.listen(5000, () => {
    console.log("Application started on port 5000!");
});
