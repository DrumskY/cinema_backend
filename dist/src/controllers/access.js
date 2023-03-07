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
const validation_error_1 = require("../errors/validation-error");
const prisma_client_1 = require("../lib/prisma-client");
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_error_1 = require("zod-error");
const commentSchema = zod_1.z.object({
    comment: zod_1.z.string().min(10, { message: "comment is required" }),
    authorId: zod_1.z.preprocess((val) => val && Number(val), zod_1.z.number()),
    authorCommId: zod_1.z.preprocess((val) => val && Number(val), zod_1.z.number()),
});
const comment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validation = commentSchema.safeParse(req.body);
    if (!validation.success) {
        const errorMessage = (0, zod_error_1.generateErrorMessage)(validation.error.issues);
        throw new validation_error_1.ValidationError(errorMessage);
    }
    const { comment, authorId, authorCommId } = validation.data;
    const token = jsonwebtoken_1.default.sign({
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
    }, 
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process.env.SESSION_SECRET);
    try {
        const comm = yield prisma_client_1.prisma.comment.create({
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
    }
    catch (_a) {
        res.status(500).json("CustomErr");
    }
});
const deleteCommentSchema = zod_1.z.object({
    commentId: zod_1.z.preprocess((val) => val && Number(val), zod_1.z.number()),
});
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validation = deleteCommentSchema.safeParse(req.body);
    if (!validation.success) {
        const errorMessage = (0, zod_error_1.generateErrorMessage)(validation.error.issues);
        throw new validation_error_1.ValidationError(errorMessage);
    }
    const { commentId } = validation.data;
    const token = jsonwebtoken_1.default.sign({
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
    }, 
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process.env.SESSION_SECRET);
    try {
        const comm = yield prisma_client_1.prisma.comment.delete({
            where: {
                commentId: commentId,
            },
        });
        res.status(202).json({
            comm,
            token,
        });
    }
    catch (_b) {
        res.status(500).json("CustomErr");
    }
});
exports.default = {
    comment,
    deleteComment,
};
