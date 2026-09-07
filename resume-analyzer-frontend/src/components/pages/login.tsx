import { useState, type FormEvent } from "react";
import "./login.css";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

import { Link, useNavigate } from "react-router-dom";

function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError("");

        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Login failed");
                return;
            }

            // Store JWT token
            localStorage.setItem("token", data.token);

            // Store logged-in user
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            // Redirect to dashboard
            navigate("/dashboard");

        } catch {
            setError("Unable to connect to server");
        } finally {
            setLoading(false);
        }
    };

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
                                <p>
                                    Check how well your resume performs
                                    in ATS systems
                                </p>
                            </div>
                        </div>

                        <div className="feature">
                            <div className="feature-icon">☆</div>

                            <div>
                                <h3>Skill Analysis</h3>
                                <p>
                                    Identify your key skills and strengths
                                </p>
                            </div>
                        </div>

                        <div className="feature">
                            <div className="feature-icon">▣</div>

                            <div>
                                <h3>Job Matching</h3>
                                <p>
                                    Find the best job matches for your profile
                                </p>
                            </div>
                        </div>

                        <div className="feature">
                            <div className="feature-icon">♧</div>

                            <div>
                                <h3>Smart Suggestions</h3>
                                <p>
                                    Get AI-powered suggestions to improve
                                    your resume
                                </p>
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

                    <form onSubmit={handleSubmit}>

                        {/* Email */}
                        <label>Email Address</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        {/* Password */}
                        <label>Password</label>

                        <div className="password-box">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>

                        </div>

                        {/* Forgot Password */}
                        <div className="forgot-password">
                            Forgot password?
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="login-error">
                                {error}
                            </p>
                        )}

                        {/* Login Button */}
                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Logging in..."
                                : "Login"}
                        </button>

                    </form>

                    {/* Divider */}
                    <div className="divider">
                        <span>or continue with</span>
                    </div>

                    {/* Social Login */}
                    <div className="social-buttons">

                        <button type="button">
                            <FcGoogle />
                            Google
                        </button>

                        <button type="button">
                            <FaGithub />
                            GitHub
                        </button>

                    </div>

                    {/* Register Link */}
                    <p className="signup-text">
                        Don't have an account?{" "}

                        <Link
                            to="/register"
                            className="signup-link"
                        >
                            Sign up
                        </Link>
                    </p>

                </div>

                {/* Security Text */}
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