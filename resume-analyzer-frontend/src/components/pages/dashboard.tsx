
import { useEffect, useRef, useState } from "react";
import "./dashboard.css";
import { FiPower } from "react-icons/fi";

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

const API_URL = "http://localhost:5000/api";

function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [activeSection, setActiveSection] =
        useState<Section>("dashboard");

    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState("");

    const [resumes, setResumes] = useState<Resume[]>([]);
    const [deletingResumeId, setDeletingResumeId] = useState<string | null>(
        null
    );

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load profile and resumes when the dashboard opens
    useEffect(() => {
        let cancelled = false;

        const loadDashboard = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                window.location.href = "/login";
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

                const profileData = await profileResponse.json();

                if (!profileResponse.ok) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                    return;
                }

                const resumesData = await resumesResponse.json();

                if (cancelled) return;

                setUser(profileData.user);

                if (resumesResponse.ok) {
                    setResumes(
                        Array.isArray(resumesData.resumes)
                            ? resumesData.resumes
                            : []
                    );
                } else {
                    console.error(
                        "Failed to fetch resumes:",
                        resumesData.message
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
    }, []);

    // Validate selected resume
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

    // Log out the user
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    // Delete a resume
    const handleDeleteResume = async (resumeId: string) => {
        if (deletingResumeId) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this resume? This action cannot be undone."
        );

        if (!confirmed) return;

        const token = localStorage.getItem("token");

        if (!token) {
            alert("Your session has expired. Please log in again.");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete resume."
                );
            }

            // Remove the deleted resume from the UI
            setResumes((currentResumes) =>
                currentResumes.filter(
                    (resume) => resume._id !== resumeId
                )
            );

            setUploadMessage("");
        } catch (error) {
            console.error("Delete resume error:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while deleting the resume."
            );
        } finally {
            setDeletingResumeId(null);
        }
    };

    // Upload the selected resume
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
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
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

            const uploadData = await uploadResponse.json();

            if (!uploadResponse.ok) {
                setUploadMessage(
                    uploadData.message || "Resume upload failed."
                );
                return;
            }

            setUploadMessage("Resume uploaded successfully!");
            setSelectedFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            // Refresh the resume list after successful upload
            const listResponse = await fetch(
                `${API_URL}/resume`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const listData = await listResponse.json();

            if (listResponse.ok) {
                setResumes(
                    Array.isArray(listData.resumes)
                        ? listData.resumes
                        : []
                );
            } else {
                console.error(
                    "Could not refresh resume list:",
                    listData.message
                );
            }
        } catch (error) {
            console.error("Resume upload error:", error);

            setUploadMessage(
                "Something went wrong. Please check your connection and try again."
            );
        } finally {
            setUploading(false);
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
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>

                            <div className="profile-info">
                                <span>{user?.name}</span>
                                <small>Job Seeker</small>
                            </div>
                        </button>

                        {showProfileMenu && (
                            <div className="profile-dropdown">
                                <div className="dropdown-user">
                                    <strong>{user?.name}</strong>
                                    <small>{user?.email}</small>
                                </div>

                                <button type="button">
                                    👤 Profile
                                </button>

                                <button type="button">
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
                                You will need to login again to access
                                your account.
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
                            <h2>Welcome back, {user?.name} 👋</h2>

                            <p>
                                Upload your resume and get AI-powered
                                insights to improve it.
                            </p>
                        </section>

                        <div className="stats-container">
                            <div className="stat-card">
                                <div className="stat-icon">📊</div>
                                <div>
                                    <p>ATS Score</p>
                                    <h3>--</h3>
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
                                    <p>Analyses</p>
                                    <h3>0</h3>
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
                                <p
                                    className="upload-message"
                                    role="status"
                                >
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

                                        <button
                                            type="button"
                                            className="delete-resume-button"
                                            disabled={
                                                deletingResumeId !== null
                                            }
                                            onClick={() =>
                                                handleDeleteResume(resume._id)
                                            }
                                        >
                                            {deletingResumeId === resume._id
                                                ? "Deleting..."
                                                : "Delete"}
                                        </button>
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
                        <p>No analyses available yet.</p>
                    </section>
                )}
            </main>
        </div>
    );
}

export default Dashboard;
