"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const access_1 = __importDefault(require("../controllers/access"));
const router = (0, express_1.Router)();
router.post("/add", access_1.default.comment);
router.post("/delete", access_1.default.deleteComment);
exports.default = router;
