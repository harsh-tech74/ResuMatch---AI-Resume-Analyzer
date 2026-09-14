const express = require("express");
const router = express.Router();

const protect = require("../middleware/authmiddleware");
const upload = require("../middleware/upload");
const {
    uploadResume,
    getUserResumes
} = require("../controllers/resumecontroller");

router.get("/", protect, getUserResumes);

router.post(
    "/upload",
    protect,
    upload.single("resume"),
    uploadResume
);

module.exports = router;