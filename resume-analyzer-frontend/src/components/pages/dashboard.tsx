import "./dashboard.css";

function Dashboard() {
    return (
        <div className="dashboard-page">

            {/* Sidebar */}
            <aside className="dashboard-sidebar">

                <div className="dashboard-logo">
                    Resu<span>Match</span>
                </div>

                <nav className="dashboard-nav">

                    <a href="/dashboard" className="nav-item active">
                        <span>▦</span>
                        Dashboard
                    </a>

                    <a href="#" className="nav-item">
                        <span>▤</span>
                        My Resumes
                    </a>

                    <a href="#" className="nav-item">
                        <span>◷</span>
                        Analysis History
                    </a>

                    <a href="#" className="nav-item">
                        <span>⚙</span>
                        Settings
                    </a>

                </nav>

                <div className="sidebar-bottom">

                    <a href="/login" className="nav-item logout">
                        <span>↪</span>
                        Logout
                    </a>

                </div>

            </aside>


            {/* Main Content */}
            <main className="dashboard-main">

                {/* Header */}
                <header className="dashboard-header">

                    <div>
                        <h1>Dashboard</h1>
                        <p>Manage your resumes and analyze your career profile.</p>
                    </div>

                    <div className="profile-section">
                        <div className="notification">♧</div>

                        <div className="profile-avatar">
                            H
                        </div>

                        <div className="profile-info">
                            <span>Harsh</span>
                            <small>Job Seeker</small>
                        </div>
                    </div>

                </header>


                {/* Welcome Section */}
                <section className="welcome-section">

                    <div>
                        <h2>Welcome back, Harsh 👋</h2>

                        <p>
                            Ready to improve your resume and increase your chances
                            of getting shortlisted?
                        </p>
                    </div>

                </section>


                {/* Stats */}
                <section className="stats-container">

                    <div className="stat-card">
                        <div className="stat-icon">📄</div>

                        <div>
                            <p>Total Resumes</p>
                            <h3>3</h3>
                        </div>
                    </div>


                    <div className="stat-card">
                        <div className="stat-icon">▥</div>

                        <div>
                            <p>Average ATS Score</p>
                            <h3>78%</h3>
                        </div>
                    </div>


                    <div className="stat-card">
                        <div className="stat-icon">◉</div>

                        <div>
                            <p>Total Analyses</p>
                            <h3>8</h3>
                        </div>
                    </div>

                </section>


                {/* Upload Resume */}
                <section className="upload-section">

                    <div className="section-heading">
                        <h2>Analyze Your Resume</h2>

                        <p>
                            Upload your resume and get AI-powered insights.
                        </p>
                    </div>


                    <div className="upload-card">

                        <div className="upload-icon">
                            ↑
                        </div>

                        <h3>Upload your resume</h3>

                        <p>
                            Drag & drop your resume here or browse your files
                        </p>

                        <span className="file-info">
                            Supported format: PDF
                        </span>

                        <button className="upload-button">
                            Choose Resume
                        </button>

                    </div>

                </section>


                {/* Recent Analyses */}
                <section className="recent-section">

                    <div className="section-heading recent-heading">

                        <div>
                            <h2>Recent Analyses</h2>
                            <p>Your latest resume analysis results.</p>
                        </div>

                        <button className="view-all">
                            View All
                        </button>

                    </div>


                    <div className="analysis-list">

                        <div className="analysis-item">

                            <div className="analysis-info">

                                <div className="resume-icon">
                                    📄
                                </div>

                                <div>
                                    <h3>Frontend Developer Resume</h3>
                                    <p>Analyzed 2 days ago</p>
                                </div>

                            </div>

                            <div className="analysis-score">
                                <span>82%</span>
                                <small>ATS Score</small>
                            </div>

                            <button className="analysis-button">
                                View →
                            </button>

                        </div>


                        <div className="analysis-item">

                            <div className="analysis-info">

                                <div className="resume-icon">
                                    📄
                                </div>

                                <div>
                                    <h3>React Developer Resume</h3>
                                    <p>Analyzed 5 days ago</p>
                                </div>

                            </div>

                            <div className="analysis-score">
                                <span>76%</span>
                                <small>ATS Score</small>
                            </div>

                            <button className="analysis-button">
                                View →
                            </button>

                        </div>


                        <div className="analysis-item">

                            <div className="analysis-info">

                                <div className="resume-icon">
                                    📄
                                </div>

                                <div>
                                    <h3>Software Engineer Resume</h3>
                                    <p>Analyzed 1 week ago</p>
                                </div>

                            </div>

                            <div className="analysis-score">
                                <span>71%</span>
                                <small>ATS Score</small>
                            </div>

                            <button className="analysis-button">
                                View →
                            </button>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default Dashboard;