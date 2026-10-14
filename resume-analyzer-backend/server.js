const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const resumeRoutes = require("./routes/resumeRoutes");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authroutes");
const userRoutes = require("./routes/userroutes");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("ResumeAI Backend is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/resume", resumeRoutes);

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.use((err, req, res, next) => {
    if (err.name === "MulterError") {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                message: "File size must not exceed 5 MB",
            });
        }

        return res.status(400).json({
            message: err.message,
        });
    }

    if (err.message === "Only PDF, DOCX, JPG, JPEG, and PNG files are allowed") {
        return res.status(400).json({
            message: err.message,
        });
    }

    console.error(err);

    return res.status(500).json({
        message: "Internal server error",
    });
});
