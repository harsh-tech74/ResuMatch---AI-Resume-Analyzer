const express = require("express");

const {
    getProfile
} = require("../controllers/usercontroller");

const protect = require("../middleware/authmiddleware");

const router = express.Router();

router.get("/profile", protect, getProfile);

module.exports = router;