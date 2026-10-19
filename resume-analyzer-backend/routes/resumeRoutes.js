
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authmiddleware");
const upload = require("../middleware/upload");

const {
    uploadResume,
    getUserResumes,
    deleteResume,
    viewResume, analyzeResume
} = require("../controllers/resumecontroller");

router.get("/", protect, getUserResumes);
router.post("/upload", protect, upload.single("resume"), uploadResume);
router.get("/:id/view", protect, viewResume);
router.delete("/:id", protect, deleteResume);
router.post("/:id/analyze", protect, analyzeResume);

module.exports = router;
