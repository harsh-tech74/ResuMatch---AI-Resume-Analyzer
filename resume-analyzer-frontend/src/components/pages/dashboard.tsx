
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPower } from "react-icons/fi";
import "./dashboard.css";

type User = {
    name: string;
    email: string;
};

type Resume = {
    _id: string;
    fileName: string;
    fileType: string;
    filePath: string;
    extractedText: string;
    createdAt: string;
    updatedAt: string;
};

type Section = "dashboard" | "resumes" | "history";

type ResumeAnalysis = {
    overallScore: number;
    summary: string;
    detectedSections: string[];
    strengths: string[];
    weaknesses: string[];
    missingSections: string[];
    skillsFound: string[];
    suggestions: string[];
};

type ApiResponse = {
    message?: string;
    user?: User;
    resumes?: Resume[];
    analysis?: ResumeAnalysis;
};

const API_URL = "http://localhost:5000/api";

async function readJson(
    response: Response
): Promise<ApiResponse> {
    try {
        return (await response.json()) as ApiResponse;
    } catch {
        return {};
    }
}

function Dashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [activeSection, setActiveSection] =
        useState<Section>("dashboard");

    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState("");

    const [resumes, setResumes] = useState<Resume[]>([]);
    const [deletingResumeId, setDeletingResumeId] =
        useState<string | null>(null);

    const [analyzingResumeId, setAnalyzingResumeId] =
        useState<string | null>(null);
    const [analysisError, setAnalysisError] = useState("");
    const [selectedAnalysis, setSelectedAnalysis] =
        useState<ResumeAnalysis | null>(null);
    const [analysisResumeName, setAnalysisResumeName] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load the logged-in user's profile and resumes.
    useEffect(() => {
        let cancelled = false;

        const loadDashboard = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login", { replace: true });
                return;
            }

            try {
                const headers = {
                    Authorization: `Bearer ${token}`,
                };

                const [profileResponse, resumesResponse] =
                    await Promise.all([
                        fetch(`${API_URL}/user/profile`, { headers }),
                        fetch(`${API_URL}/resume`, { headers }),
                    ]);

                const profileData = await readJson(profileResponse);

                if (cancelled) return;

                if (!profileResponse.ok) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/login", { replace: true });
                    return;
                }

                setUser(profileData.user ?? null);

                const resumesData = await readJson(resumesResponse);

                if (cancelled) return;

                if (resumesResponse.ok) {
                    setResumes(
                        Array.isArray(resumesData.resumes)
                            ? resumesData.resumes
                            : []
                    );
                } else {
                    console.error(
                        "Failed to fetch resumes:",
                        resumesData.message || resumesResponse.status
                    );
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Dashboard loading error:", error);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadDashboard();

        return () => {
            cancelled = true;
        };
    }, [navigate]);

    // Validate the selected resume.
    const validateFile = (file: File): string | null => {
        const allowedExtensions = [
            ".pdf",
            ".docx",
            ".jpg",
            ".jpeg",
            ".png",
        ];

        const fileName = file.name.toLowerCase();

        const isAllowed = allowedExtensions.some((extension) =>
            fileName.endsWith(extension)
        );

        if (!isAllowed) {
            return "Only PDF, DOCX, JPG, JPEG, and PNG files are allowed.";
        }

        if (file.size === 0) {
            return "The selected file is empty.";
        }

        if (file.size > 5 * 1024 * 1024) {
            return "File size must not exceed 5 MB.";
        }

        return null;
    };

    // Log out the user.
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    // Open a resume.
    const handleViewResume = async (resumeId: string) => {
        const token = localStorage.getItem("token");

        if (!token) {
            localStorage.removeItem("user");
            navigate("/login", { replace: true });
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/resume/${encodeURIComponent(resumeId)}/view`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login", { replace: true });
                return;
            }

            if (!response.ok) {
                throw new Error("Unable to open this resume.");
            }

            const blob = await response.blob();
            const fileUrl = URL.createObjectURL(blob);
            const newTab = window.open(fileUrl, "_blank");

            if (!newTab) {
                URL.revokeObjectURL(fileUrl);
                throw new Error(
                    "Popup blocked. Please allow popups and try again."
                );
            }

            newTab.opener = null;

            window.setTimeout(() => {
                URL.revokeObjectURL(fileUrl);
            }, 60000);
        } catch (error) {
            console.error("View resume error:", error);

            window.alert(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while opening the resume."
            );
        }
    };

    // Delete a resume.
    const handleDeleteResume = async (resumeId: string) => {
        if (deletingResumeId !== null) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this resume? This action cannot be undone."
        );

        if (!confirmed) return;

        const token = localStorage.getItem("token");

        if (!token) {
            localStorage.removeItem("user");
            navigate("/login", { replace: true });
            return;
        }

        try {
            setDeletingResumeId(resumeId);

            const response = await fetch(
                `${API_URL}/resume/${encodeURIComponent(resumeId)}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await readJson(response);

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login", { replace: true });
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    `Failed to delete resume. Status: ${response.status}`
                );
            }

            setResumes((currentResumes) =>
                currentResumes.filter((resume) => resume._id !== resumeId)
            );

            if (selectedAnalysis && analysisResumeName) {
                const deletedResume = resumes.find(
                    (resume) => resume._id === resumeId
                );

                if (deletedResume?.fileName === analysisResumeName) {
                    setSelectedAnalysis(null);
                    setAnalysisResumeName("");
                }
            }

            setUploadMessage("");
        } catch (error) {
            console.error("Delete resume error:", error);

            window.alert(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while deleting the resume."
            );
        } finally {
            setDeletingResumeId(null);
        }
    };

    // Upload the selected resume.
    const handleUpload = async () => {
        if (uploading) return;

        if (!selectedFile) {
            setUploadMessage("Please select a resume first.");
            return;
        }

        const validationError = validateFile(selectedFile);

        if (validationError) {
            setUploadMessage(validationError);
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            localStorage.removeItem("user");
            navigate("/login", { replace: true });
            return;
        }

        try {
            setUploading(true);
            setUploadMessage("");

            const formData = new FormData();
            formData.append("resume", selectedFile);

            const uploadResponse = await fetch(
                `${API_URL}/resume/upload`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const uploadData = await readJson(uploadResponse);

            if (
                uploadResponse.status === 401 ||
                uploadResponse.status === 403
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login", { replace: true });
                return;
            }

            if (!uploadResponse.ok) {
                throw new Error(
                    uploadData.message ||
                    `Resume upload failed. Status: ${uploadResponse.status}`
                );
            }

            setSelectedFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            // Refresh the resume list after successful upload.
            const listResponse = await fetch(`${API_URL}/resume`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const listData = await readJson(listResponse);

            if (!listResponse.ok) {
                throw new Error(
                    listData.message ||
                    "Resume uploaded, but the resume list could not be refreshed."
                );
            }

            setResumes(
                Array.isArray(listData.resumes)
                    ? listData.resumes
                    : []
            );

            setUploadMessage("Resume uploaded successfully!");
        } catch (error) {
            console.error("Resume upload error:", error);

            setUploadMessage(
                error instanceof Error
                    ? error.message
                    : "Something went wrong. Please check your connection and try again."
            );
        } finally {
            setUploading(false);
        }
    };

    // Request an AI analysis for a resume.
    const handleAnalyzeResume = async (resume: Resume) => {
        const token = localStorage.getItem("token");

        if (!token) {
            localStorage.removeItem("user");
            navigate("/login", { replace: true });
            return;
        }

        try {
            setAnalyzingResumeId(resume._id);
            setAnalysisError("");
            setSelectedAnalysis(null);
            setAnalysisResumeName(resume.fileName);

            const response = await fetch(
                `${API_URL}/resume/${encodeURIComponent(resume._id)}/analyze`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await readJson(response);

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login", { replace: true });
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    `Analysis failed. Status: ${response.status}`
                );
            }

            if (!data.analysis) {
                throw new Error(
                    "The server response did not contain analysis results."
                );
            }

            setSelectedAnalysis(data.analysis);
        } catch (error) {
            console.error("Resume analysis error:", error);

            setAnalysisError(
                error instanceof Error
                    ? error.message
                    : "Analysis failed. Please try again."
            );
        } finally {
            setAnalyzingResumeId(null);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="dashboard-page">
            <aside className="dashboard-sidebar">
                <div className="dashboard-logo">
                    Resu<span>Match</span>
                </div>

                <nav className="dashboard-nav">
                    <a
                        href="#dashboard"
                        className={`nav-item ${activeSection === "dashboard" ? "active" : ""
                            }`}
                        onClick={(event) => {
                            event.preventDefault();
                            setActiveSection("dashboard");
                            setAnalysisError("");
                        }}
                    >
                        <span>🏠</span>
                        Dashboard
                    </a>

                    <a
                        href="#my-resumes"
                        className={`nav-item ${activeSection === "resumes" ? "active" : ""
                            }`}
                        onClick={(event) => {
                            event.preventDefault();
                            setActiveSection("resumes");
                            setAnalysisError("");
                        }}
                    >
                        <span>📄</span>
                        My Resumes
                    </a>

                    <a
                        href="#analysis-history"
                        className={`nav-item ${activeSection === "history" ? "active" : ""
                            }`}
                        onClick={(event) => {
                            event.preventDefault();
                            setActiveSection("history");
                            setAnalysisError("");
                        }}
                    >
                        <span>📊</span>
                        Analysis History
                    </a>
                </nav>
            </aside>

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div>
                        <h1>
                            {activeSection === "dashboard"
                                ? "Dashboard"
                                : activeSection === "resumes"
                                    ? "My Resumes"
                                    : "Analysis History"}
                        </h1>

                        <p>
                            {activeSection === "dashboard"
                                ? "Manage your resumes and track your progress."
                                : activeSection === "resumes"
                                    ? "View and manage your uploaded resumes."
                                    : "Review your previous resume analyses."}
                        </p>
                    </div>

                    <div className="profile-section">
                        <div className="notification">🔔</div>

                        <button
                            type="button"
                            className="profile-trigger"
                            onClick={() =>
                                setShowProfileMenu((previous) => !previous)
                            }
                        >
                            <div className="profile-avatar">
                                {user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>

                            <div className="profile-info">
                                <span>{user?.name || "User"}</span>
                                <small>Job Seeker</small>
                            </div>
                        </button>

                        {showProfileMenu && (
                            <div className="profile-dropdown">
                                <div className="dropdown-user">
                                    <strong>{user?.name}</strong>
                                    <small>{user?.email}</small>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowProfileMenu(false)}
                                >
                                    👤 Profile
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowProfileMenu(false)}
                                >
                                    ⚙️ Settings
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowProfileMenu(false);
                                        setShowLogoutConfirm(true);
                                    }}
                                >
                                    <FiPower /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Logout confirmation */}
                {showLogoutConfirm && (
                    <div className="logout-overlay">
                        <div className="logout-modal">
                            <h2>Are you sure you want to logout?</h2>

                            <p>
                                You will need to login again to access your
                                account.
                            </p>

                            <div className="logout-actions">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() =>
                                        setShowLogoutConfirm(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="confirm-logout-button"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dashboard home */}
                {activeSection === "dashboard" && (
                    <>
                        <section className="welcome-section">
                            <h2>
                                Welcome back, {user?.name || "User"} 👋
                            </h2>

                            <p>
                                Upload your resume and get AI-powered insights
                                to improve it.
                            </p>
                        </section>

                        <div className="stats-container">
                            <div className="stat-card">
                                <div className="stat-icon">📊</div>
                                <div>
                                    <p>Latest Resume Score</p>
                                    <h3>
                                        {selectedAnalysis
                                            ? `${selectedAnalysis.overallScore}/100`
                                            : "--"}
                                    </h3>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">📄</div>
                                <div>
                                    <p>Resumes</p>
                                    <h3>{resumes.length}</h3>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">🔍</div>
                                <div>
                                    <p>Analyses this session</p>
                                    <h3>{selectedAnalysis ? 1 : 0}</h3>
                                </div>
                            </div>
                        </div>

                        <section className="upload-section">
                            <h2>Upload Your Resume</h2>

                            <p>
                                Select your resume to start the analysis.
                            </p>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.docx,.jpg,.jpeg,.png"
                                disabled={uploading}
                                onChange={(event) => {
                                    const file =
                                        event.target.files?.[0] ?? null;

                                    setSelectedFile(file);
                                    setUploadMessage("");

                                    if (file) {
                                        const error = validateFile(file);

                                        if (error) {
                                            setUploadMessage(error);
                                        }
                                    }
                                }}
                            />

                            {selectedFile && (
                                <div className="selected-file">
                                    <p>File: {selectedFile.name}</p>
                                    <p>
                                        Size:{" "}
                                        {(
                                            selectedFile.size /
                                            (1024 * 1024)
                                        ).toFixed(2)}{" "}
                                        MB
                                    </p>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={uploading}
                            >
                                {uploading
                                    ? "Uploading..."
                                    : "Upload Resume"}
                            </button>

                            {uploadMessage && (
                                <p className="upload-message" role="status">
                                    {uploadMessage}
                                </p>
                            )}
                        </section>
                    </>
                )}

                {/* Uploaded resumes */}
                {activeSection === "resumes" && (
                    <section className="resumes-section">
                        <h2>My Resumes</h2>

                        {resumes.length === 0 ? (
                            <p>No resumes uploaded yet.</p>
                        ) : (
                            <div className="resume-list">
                                {resumes.map((resume) => (
                                    <div
                                        className="resume-card"
                                        key={resume._id}
                                    >
                                        <div>
                                            <h3>{resume.fileName}</h3>
                                            <p>{resume.fileType}</p>
                                            <p>
                                                Uploaded:{" "}
                                                {new Date(
                                                    resume.createdAt
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="resume-actions">
                                            <button
                                                type="button"
                                                className="resume-menu-button"
                                                aria-label={`Options for ${resume.fileName}`}
                                                aria-expanded={
                                                    openMenuId === resume._id
                                                }
                                                onClick={() =>
                                                    setOpenMenuId((current) =>
                                                        current === resume._id
                                                            ? null
                                                            : resume._id
                                                    )
                                                }
                                            >
                                                &#8942;
                                            </button>

                                            {openMenuId === resume._id && (
                                                <div className="resume-dropdown">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setOpenMenuId(null);
                                                            void handleViewResume(
                                                                resume._id
                                                            );
                                                        }}
                                                    >
                                                        View Resume
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            analyzingResumeId !==
                                                            null
                                                        }
                                                        onClick={() => {
                                                            setOpenMenuId(null);
                                                            void handleAnalyzeResume(
                                                                resume
                                                            );
                                                        }}
                                                    >
                                                        {analyzingResumeId ===
                                                            resume._id
                                                            ? "Analyzing..."
                                                            : "Analyze Resume"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            deletingResumeId !==
                                                            null
                                                        }
                                                        onClick={() => {
                                                            setOpenMenuId(null);
                                                            void handleDeleteResume(
                                                                resume._id
                                                            );
                                                        }}
                                                    >
                                                        {deletingResumeId ===
                                                            resume._id
                                                            ? "Deleting..."
                                                            : "Delete Resume"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* Analysis history */}
                {activeSection === "history" && (
                    <section className="recent-section">
                        <h2>Analysis History</h2>
                        <p>
                            Persistent analysis history has not been
                            implemented yet.
                        </p>
                    </section>
                )}

                {/* Analysis loading and error messages */}
                {analyzingResumeId && (
                    <section className="analysis-status" role="status">
                        <h2>Analyzing your resume...</h2>
                        <p>
                            Please wait while the AI reviews your resume.
                            This may take a little time.
                        </p>
                    </section>
                )}

                {analysisError && (
                    <section className="analysis-error" role="alert">
                        <h2>Analysis unavailable</h2>
                        <p>{analysisError}</p>
                        <p>
                            If the AI service is temporarily unavailable,
                            wait a little before trying again.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                const resume = resumes.find(
                                    (item) =>
                                        item.fileName === analysisResumeName
                                );

                                if (resume) {
                                    void handleAnalyzeResume(resume);
                                } else {
                                    setAnalysisError(
                                        "Select the resume from My Resumes and try again."
                                    );
                                }
                            }}
                            disabled={analyzingResumeId !== null}
                        >
                            Try Again
                        </button>
                    </section>
                )}

                {/* Analysis results */}
                {selectedAnalysis && (
                    <section className="analysis-results">
                        <div className="analysis-results-header">
                            <div>
                                <h2>Resume Analysis Results</h2>
                                <p>{analysisResumeName}</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedAnalysis(null);
                                    setAnalysisError("");
                                }}
                            >
                                Close Results
                            </button>
                        </div>

                        <div className="analysis-score-card">
                            <p>Overall Resume Score</p>
                            <h3>{selectedAnalysis.overallScore}/100</h3>
                            <div
                                className="analysis-score-track"
                                role="progressbar"
                                aria-label="Resume score"
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={
                                    selectedAnalysis.overallScore
                                }
                            >
                                <div
                                    className="analysis-score-fill"
                                    style={{
                                        width: `${selectedAnalysis.overallScore}%`,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="analysis-summary">
                            <h3>Summary</h3>
                            <p>{selectedAnalysis.summary}</p>
                        </div>

                        <div className="analysis-grid">
                            <div className="analysis-result-card">
                                <h3>Strengths</h3>
                                {selectedAnalysis.strengths.length ? (
                                    <ul>
                                        {selectedAnalysis.strengths.map(
                                            (item, index) => (
                                                <li key={index}>{item}</li>
                                            )
                                        )}
                                    </ul>
                                ) : (
                                    <p>No strengths were returned.</p>
                                )}
                            </div>

                            <div className="analysis-result-card">
                                <h3>Areas to Improve</h3>
                                {selectedAnalysis.weaknesses.length ? (
                                    <ul>
                                        {selectedAnalysis.weaknesses.map(
                                            (item, index) => (
                                                <li key={index}>{item}</li>
                                            )
                                        )}
                                    </ul>
                                ) : (
                                    <p>No weaknesses were returned.</p>
                                )}
                            </div>

                            <div className="analysis-result-card">
                                <h3>Missing Sections</h3>
                                {selectedAnalysis.missingSections.length ? (
                                    <ul>
                                        {selectedAnalysis.missingSections.map(
                                            (item, index) => (
                                                <li key={index}>{item}</li>
                                            )
                                        )}
                                    </ul>
                                ) : (
                                    <p>No missing sections identified.</p>
                                )}
                            </div>

                            <div className="analysis-result-card">
                                <h3>Skills Found</h3>
                                {selectedAnalysis.skillsFound.length ? (
                                    <ul>
                                        {selectedAnalysis.skillsFound.map(
                                            (item, index) => (
                                                <li key={index}>{item}</li>
                                            )
                                        )}
                                    </ul>
                                ) : (
                                    <p>No skills were identified.</p>
                                )}
                            </div>

                            <div className="analysis-result-card">
                                <h3>Detected Sections</h3>
                                {selectedAnalysis.detectedSections.length ? (
                                    <ul>
                                        {selectedAnalysis.detectedSections.map(
                                            (item, index) => (
                                                <li key={index}>{item}</li>
                                            )
                                        )}
                                    </ul>
                                ) : (
                                    <p>No sections were identified.</p>
                                )}
                            </div>

                            <div className="analysis-result-card">
                                <h3>Suggestions</h3>
                                {selectedAnalysis.suggestions.length ? (
                                    <ul>
                                        {selectedAnalysis.suggestions.map(
                                            (item, index) => (
                                                <li key={index}>{item}</li>
                                            )
                                        )}
                                    </ul>
                                ) : (
                                    <p>No suggestions were returned.</p>
                                )}
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default Dashboard;
