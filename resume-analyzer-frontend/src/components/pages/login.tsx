import { useState } from "react";
import "./login.css";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Link } from "react-router-dom";

function Login() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="login-page">

            {/* Left Section */}
            <div className="login-left">

                <div className="logo">
                    Resu<span>Match</span>
                </div>

                <div className="hero-content">
                    <h1>
                        AI-Powered
                        <br />
                        <span>Resume Analyzer</span>
                    </h1>

                    <p>
                        Get AI insights, improve your resume, and
                        land your dream job faster.
                    </p>

                    <div className="features">

                        <div className="feature">
                            <div className="feature-icon">▥</div>
                            <div>
                                <h3>ATS Score</h3>
                                <p>Check how well your resume performs in ATS systems</p>
                            </div>
                        </div>

                        <div className="feature">
                            <div className="feature-icon">☆</div>
                            <div>
                                <h3>Skill Analysis</h3>
                                <p>Identify your key skills and strengths</p>
                            </div>
                        </div>

                        <div className="feature">
                            <div className="feature-icon">▣</div>
                            <div>
                                <h3>Job Matching</h3>
                                <p>Find the best job matches for your profile</p>
                            </div>
                        </div>

                        <div className="feature">
                            <div className="feature-icon">♧</div>
                            <div>
                                <h3>Smart Suggestions</h3>
                                <p>Get AI-powered suggestions to improve your resume</p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* Right Section */}
            <div className="login-right">

                <div className="login-card">

                    <h2>Welcome Back</h2>

                    <p className="login-subtitle">
                        Login to your account to continue
                    </p>

                    <form>

                        <label>Email Address</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                        />

                        <label>Password</label>

                        <div className="password-box">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        <div className="forgot-password">
                            Forgot password?
                        </div>

                        <button className="login-button">
                            Login
                        </button>

                    </form>

                    <div className="divider">
                        <span>or continue with</span>
                    </div>

                    <div className="social-buttons">
                        <button> <FcGoogle /> Google</button>
                        <button> <FaGithub /> GitHub</button>
                    </div>
                    <p className="signup-text">
                        Don't have an account?{" "}
                        <Link to="/register" className="signup-link">
                            Sign up
                        </Link>
                    </p>

                </div>

                <div className="security-text">
                    🔒 Your data is secure with us.
                    <br />
                    We never share your information.
                </div>

            </div>

        </div>
    );
}

export default Login;