const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");
const Resume = require("../models/resume");
const fs = require("fs");
const path = require("path");
const { createWorker } = require("tesseract.js");


const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a resume",
            });
        }

        const extension = path.extname(req.file.originalname).toLowerCase();

        let extractedText = "";

        if (extension === ".pdf") {
            const fileBuffer = fs.readFileSync(req.file.path);

            const parser = new PDFParse({ data: fileBuffer });

            const pdfData = await parser.getText();

            extractedText = pdfData.text;

            await parser.destroy();
        }
        else if (extension === ".docx") {
            const result = await mammoth.extractRawText({
                path: req.file.path,
            });

            extractedText = result.value;
        }
        else if (
            extension === ".jpg" ||
            extension === ".jpeg" ||
            extension === ".png"
        ) {
            const worker = await createWorker("eng");

            const result = await worker.recognize(req.file.path);

            extractedText = result.data.text;

            await worker.terminate();
        }

        const resume = await Resume.create({
            userId: req.user.userId,
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            extractedText: extractedText,
        });

        res.status(201).json({
            message: "Resume uploaded and text extracted successfully",
            resume,
        });
    } catch (error) {
        console.error("Resume upload error:", error);

        res.status(500).json({
            message: error.message,
        });
    }
};
const getUserResumes = async (req, res) => {
    try {
        const resumes = await Resume.find({
            userId: req.user.userId,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            resumes,
        });
    } catch (error) {
        console.error("Get resumes error:", error);

        res.status(500).json({
            message: "Server error while fetching resumes",
        });
    }
};

const viewResume = async (req, res) => {
    try {
        const resume = await Resume.findOne({
            _id: req.params.id,
            userId: req.user.userId,
        });

        if (!resume) {
            return res.status(404).json({
                message: "Resume not found",
            });
        }

        const filePath = path.resolve(resume.filePath);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                message: "Resume file not found",
            });
        }

        const isDownload = req.query.download === "true";

        res.setHeader(
            "Content-Disposition",
            `${isDownload ? "attachment" : "inline"}; filename="${path.basename(resume.fileName)}"`
        );

        return res.sendFile(filePath);
    } catch (error) {
        console.error("View resume error:", error);

        return res.status(500).json({
            message: "Server error while opening resume",
        });
    }
};

const deleteResume = async (req, res) => {
    try {
        const resume = await Resume.findOne({
            _id: req.params.id,
            userId: req.user.userId,
        });

        if (!resume) {
            return res.status(404).json({
                message: "Resume not found",
            });
        }

        await Resume.findByIdAndDelete(resume._id);

        const filePath = path.resolve(resume.filePath);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return res.status(200).json({
            message: "Resume deleted successfully",
        });
    } catch (error) {
        console.error("Delete resume error:", error);

        return res.status(500).json({
            message: "Server error while deleting resume",
        });
    }
};


module.exports = { uploadResume, getUserResumes, deleteResume, viewResume };