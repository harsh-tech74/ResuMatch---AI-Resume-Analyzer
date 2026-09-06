import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import "./register.css";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="register-page">

      {/* Left Section */}
      <div className="register-left">

        <div className="register-logo">
           Resu<span>Match</span>
        </div>

        <div className="register-left-content">
          <h1>
            Build a stronger
            <span> resume.</span>
          </h1>

          <p>
            Create your ResumeAI account and get intelligent feedback
            to improve your resume and stand out to recruiters.
          </p>
        </div>

      </div>

      {/* Right Section */}
      <div className="register-right">

        <div className="register-box">

          <h2>Create an account</h2>

          <p className="register-subtitle">
            Start improving your resume with ResumeAI
          </p>

          <form className="register-form">

            <div className="register-form-group">
              <label htmlFor="name">Full Name</label>

              <input
                type="text"
                id="name"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div className="register-form-group">
              <label htmlFor="email">Email</label>

              <input
                type="email"
                id="email"
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div className="register-form-group">
              <label htmlFor="password">Password</label>

              <div className="register-password-wrapper">

                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Create a password"
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>
            </div>

            {/* Confirm Password */}
            <div className="register-form-group">
              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <div className="register-password-wrapper">

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="Confirm your password"
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>

              </div>
            </div>

            {/* Create Account */}
            <button type="submit" className="register-button">
              Create Account
            </button>

          </form>

          {/* Divider */}
          <div className="register-divider">
            <span>OR</span>
          </div>

          {/* Social Login */}
          <div className="register-social-buttons">

            <button className="register-social-button">
              <FcGoogle />
              Google
            </button>

            <button className="register-social-button">
              <FaGithub />
              GitHub
            </button>

          </div>

          {/* Login */}
          <p className="login-link">
            Already have an account?{" "}
            <a href="/login">Login</a>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;

