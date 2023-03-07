"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_panel_1 = __importDefault(require("../controllers/admin-panel"));
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public");
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
const storageDesc = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/image");
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
    },
});
const uploadDesc = (0, multer_1.default)({ storage: storageDesc });
const router = (0, express_1.Router)();
router.post("/addimage", upload.single("image"), (req, res) => {
    res.send("Success");
});
router.post("/addimagedesc", uploadDesc.single("image"), (req, res) => {
    res.send("Success");
});
router.post("/addmovie", admin_panel_1.default.addmovie);
router.post("/set-screening", admin_panel_1.default.setscreening);
exports.default = router;
