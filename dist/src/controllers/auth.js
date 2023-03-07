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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const runtime_1 = require("@prisma/client/runtime");
const unautenticated_error_1 = require("../errors/unautenticated-error");
const registerSchema = zod_1.z.object({
    username: zod_1.z.string().min(5, { message: "username is required" }),
    first_name: zod_1.z.string().min(3, { message: "First name is required" }),
    last_name: zod_1.z.string().min(3, { message: "Last name is required" }),
    email: zod_1.z
        .string()
        .min(5, { message: "email is required" })
        .email({ message: "provide valid email address" }),
    password: zod_1.z.string().min(6, { message: "password is required" }),
});
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
        const errorMessage = (0, zod_error_1.generateErrorMessage)(validation.error.issues);
        throw new validation_error_1.ValidationError(errorMessage);
    }
    const { username, first_name, last_name, email, password } = validation.data;
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield prisma_client_1.prisma.user.create({
            data: {
                username: username,
                first_name: first_name,
                last_name: last_name,
                email: email,
                password: hashedPassword,
            },
        });
        res.status(201).json(user);
    }
    catch (_a) {
        res.status(500).json("CustomErr");
    }
});
const loginSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .min(5, { message: "email is required" })
        .email({ message: "provide valid email address" }),
    password: zod_1.z.string().min(6, { message: "password is required" }),
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
        const errorMessage = (0, zod_error_1.generateErrorMessage)(validation.error.issues);
        throw new validation_error_1.ValidationError(errorMessage);
    }
    const { email, password } = validation.data;
    const user = yield prisma_client_1.prisma.user.findFirst({
        where: {
            email: email,
        },
    });
    console.log(user);
    if (user == null) {
        throw new runtime_1.NotFoundError("No user with that email");
    }
    const isPasswordCorrect = yield bcrypt_1.default.compare(password, user.password);
    console.log("proccessss", process.env.SESSION_SECRET);
    if (isPasswordCorrect) {
        const token = jsonwebtoken_1.default.sign({
            exp: Math.floor(Date.now() / 1000) + 60 * 60,
            data: {
                user_id: user.userId,
                login: user.username,
            },
        }, 
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        process.env.SESSION_SECRET);
        res.status(200).json({
            user: {
                id: user.userId,
                name: user.username,
                role: user.role,
            },
            token,
        });
    }
    else {
        throw new unautenticated_error_1.UnautenticatedError("Wrong email or password");
    }
});
const profile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_client_1.prisma.user.findMany({
        where: {
            username: req.params.username,
        },
    });
    console.log(user);
    res.json(user);
});
exports.default = {
    register,
    login,
    profile,
};
