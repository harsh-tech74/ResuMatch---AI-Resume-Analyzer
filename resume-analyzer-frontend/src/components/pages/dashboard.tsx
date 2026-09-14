import { useEffect, useState } from "react";
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

function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState("");

    const [resumes, setResumes] = useState<Resume[]>([]);

    // Fetch user's resumes
    const fetchResumes = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "/login";
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/resume",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error(
                    "Failed to fetch resumes:",
                    data.message
                );
                return;
            }

            setResumes(data.resumes);
        } catch (error) {
            console.error(
                "Error fetching resumes:",
                error
            );
        }
    };

    // Fetch resumes when dashboard loads
    useEffect(() => {
        const loadResumes = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                window.location.href = "/login";
                return;
            }

            try {
                const response = await fetch(
                    "http://localhost:5000/api/resume",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    console.error(
                        "Failed to fetch resumes:",
                        data.message
                    );
                    return;
                }

                setResumes(data.resumes);
            } catch (error) {
                console.error(
                    "Error fetching resumes:",
                    error
                );
            }
        };

        loadResumes();
    }, []);

    // Logout user
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";
    };

    // Upload resume
    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadMessage(
                "Please select a resume first."
            );
            return;
        }

        try {
            setUploading(true);
            setUploadMessage("");

            const token = localStorage.getItem("token");

            if (!token) {
                window.location.href = "/login";
                return;
            }

            const formData = new FormData();

            formData.append("resume", selectedFile);

            const response = await fetch(
                "http://localhost:5000/api/resume/upload",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setUploadMessage(
                    data.message || "Upload failed."
                );
                return;
            }

            setUploadMessage(
                "Resume uploaded successfully!"
            );

            console.log(
                "Uploaded resume:",
                data.resume
            );

            // Clear selected file
            setSelectedFile(null);

            // Refresh resume list
            await fetchResumes();

        } catch (error) {
            console.error(
                "Upload error:",
                error
            );

            setUploadMessage(
                "Something went wrong while uploading."
            );
        } finally {
            setUploading(false);
        }
    };

    // Fetch logged-in user's profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");

                // No token → go to login
                if (!token) {
                    window.location.href = "/login";
                    return;
                }

                const response = await fetch(
                    "http://localhost:5000/api/user/profile",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                // Token invalid/expired
                if (!response.ok) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");

                    window.location.href = "/login";
                    return;
                }

                // Store user data
                setUser(data.user);

            } catch (error) {
                console.error(
                    "Profile fetch error:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // While profile is loading
    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="dashboard-page">

            {/* Sidebar */}
            <aside className="dashboard-sidebar">

                <div className="dashboard-logo">
                    Resu<span>Match</span>
                </div>

                <nav className="dashboard-nav">

                    <a
                        href="/dashboard"
                        className="nav-item active"
                    >
                        <span>🏠</span>
                        Dashboard
                    </a>

                    <a
                        href="#"
                        className="nav-item"
                    >
                        <span>📄</span>
                        My Resumes
                    </a>

                    <a
                        href="#"
                        className="nav-item"
                    >
                        <span>📊</span>
                        Analysis History
                    </a>

                </nav>

            </aside>

            {/* Main Dashboard */}
            <main className="dashboard-main">

                {/* Header */}
                <header className="dashboard-header">

                    <div>
                        <h1>Dashboard</h1>

                        <p>
                            Manage your resumes and track
                            your progress.
                        </p>
                    </div>

                    {/* Profile Section */}
                    <div className="profile-section">

                        <div className="notification">
                            🔔
                        </div>

                        {/* Profile Button */}
                        <button
                            className="profile-trigger"
                            onClick={() =>
                                setShowProfileMenu(
                                    (prev) => !prev
                                )
                            }
                        >

                            <div className="profile-avatar">
                                {user?.name
                                    ?.charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div className="profile-info">

                                <span>
                                    {user?.name}
                                </span>

                                <small>
                                    Job Seeker
                                </small>

                            </div>

                        </button>

                        {/* Profile Dropdown */}
                        {showProfileMenu && (
                            <div className="profile-dropdown">

                                <div className="dropdown-user">

                                    <strong>
                                        {user?.name}
                                    </strong>

                                    <small>
                                        {user?.email}
                                    </small>

                                </div>

                                <button>
                                    👤 Profile
                                </button>

                                <button>
                                    ⚙️ Settings
                                </button>

                                <button
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

                {/* Welcome Section */}
                <section className="welcome-section">

                    <h2>
                        Welcome back, {user?.name} 👋
                    </h2>

                    <p>
                        Upload your resume and get
                        AI-powered insights to improve it.
                    </p>

                </section>

                {/* Logout Confirmation Modal */}
                {showLogoutConfirm && (
                    <div className="logout-overlay">

                        <div className="logout-modal">

                            <h2>
                                Are you sure you want to logout?
                            </h2>

                            <p>
                                You will need to login again
                                to access your account.
                            </p>

                            <div className="logout-actions">

                                <button
                                    className="cancel-button"
                                    onClick={() =>
                                        setShowLogoutConfirm(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    className="confirm-logout-button"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>

                            </div>

                        </div>

                    </div>
                )}

                {/* Statistics */}
                <div className="stats-container">

                    <div className="stat-card">

                        <div className="stat-icon">
                            📊
                        </div>

                        <div>
                            <p>ATS Score</p>
                            <h3>--</h3>
                        </div>

                    </div>

                    <div className="stat-card">

                        <div className="stat-icon">
                            📄
                        </div>

                        <div>
                            <p>Resumes</p>
                            <h3>{resumes.length}</h3>
                        </div>

                    </div>

                    <div className="stat-card">

                        <div className="stat-icon">
                            🔍
                        </div>

                        <div>
                            <p>Analyses</p>
                            <h3>0</h3>
                        </div>

                    </div>

                </div>

                {/* Resume Upload */}
                <section className="upload-section">

                    <h2>
                        Upload Your Resume
                    </h2>

                    <p>
                        Select your resume to start the analysis.
                    </p>

                    <input
                        type="file"
                        accept=".pdf,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => {
                            const file =
                                e.target.files?.[0] || null;

                            setSelectedFile(file);
                            setUploadMessage("");
                        }}
                    />

                    {selectedFile && (
                        <p className="selected-file">
                            Selected: {selectedFile.name}
                        </p>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                    >
                        {uploading
                            ? "Uploading..."
                            : "Upload Resume"}
                    </button>

                    {uploadMessage && (
                        <p className="upload-message">
                            {uploadMessage}
                        </p>
                    )}

                </section>

                {/* My Resumes */}
                <section className="resumes-section">

                    <h2>My Resumes</h2>

                    {resumes.length === 0 ? (
                        <p>
                            No resumes uploaded yet.
                        </p>
                    ) : (
                        <div className="resume-list">

                            {resumes.map((resume) => (
                                <div
                                    className="resume-card"
                                    key={resume._id}
                                >

                                    <div>
                                        <h3>
                                            {resume.fileName}
                                        </h3>

                                        <p>
                                            {resume.fileType}
                                        </p>
                                    </div>

                                    <p>
                                        {new Date(
                                            resume.createdAt
                                        ).toLocaleDateString()}
                                    </p>

                                </div>
                            ))}

                        </div>
                    )}

                </section>

            </main>

        </div>
    );
}

export default Dashboard;