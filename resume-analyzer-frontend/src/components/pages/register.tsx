import { useState, type FormEvent } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import "./register.css";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

  
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      alert("Account created successfully!");

      navigate("/login");
    } catch {
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

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


     
      <div className="register-right">

        <div className="register-box">

          <h2>Create an account</h2>

          <p className="register-subtitle">
            Start improving your resume with ResumeAI
          </p>

          <form
            className="register-form"
            onSubmit={handleSubmit}
          >

            <div className="register-form-group">
              <label htmlFor="name">
                Full Name
              </label>

              <input
                type="text"
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

   
            <div className="register-form-group">
              <label htmlFor="email">
                Email
              </label>

              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

           
            <div className="register-form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="register-password-wrapper">

                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>
            </div>

       
            <div className="register-form-group">
              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <div className="register-password-wrapper">

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>

              </div>
            </div>

         
            {error && (
              <p className="register-error">
                {error}
              </p>
            )}

        
            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>

          </form>

          <div className="register-divider">
            <span>OR</span>
          </div>

   
          <div className="register-social-buttons">

            <button
              type="button"
              className="register-social-button"
            >
              <FcGoogle />
              Google
            </button>

            <button
              type="button"
              className="register-social-button"
            >
              <FaGithub />
              GitHub
            </button>

          </div>

          <p className="login-link">
            Already have an account?{" "}

            <Link to="/login">
              Login
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;