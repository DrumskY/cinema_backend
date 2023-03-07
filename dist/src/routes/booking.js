"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_1 = __importDefault(require("../controllers/booking"));
const router = (0, express_1.Router)();
router.get("/repertoire", booking_1.default.repertoire);
router.post("/reserve", booking_1.default.booking);
router.get("/reservation", booking_1.default.userReservation);
exports.default = router;
