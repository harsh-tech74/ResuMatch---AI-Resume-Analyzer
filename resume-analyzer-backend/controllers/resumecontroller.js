const Resume = require("../models/resume");

const uploadResume = async (req, res) => {
    try {
        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a resume",
            });
        }

        const resume = await Resume.create({
            userId: req.user.userId,
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileType: req.file.mimetype,
        });

        res.status(201).json({
            message: "Resume uploaded successfully",
            resume,
        });
    } catch (error) {
        console.error("Resume upload error:", error);

        res.status(500).json({
            message: "Server error while uploading resume",
        });
    }
};

module.exports = {
    uploadResume,
};