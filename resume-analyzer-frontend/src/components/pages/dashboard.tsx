import { useEffect, useState } from "react";
import "./dashboard.css";

function Dashboard() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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

                // Store user data received from backend
                setUser(data.user);

            } catch (error) {
                console.error("Profile fetch error:", error);
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
        <div className="dashboard">

            {/* YOUR EXISTING DASHBOARD JSX STARTS HERE */}

            {/* Header */}
            <header className="dashboard-header">

                <div className="profile">
                    <span>{user?.name}</span>
                    <small>Job Seeker</small>
                </div>

            </header>


            {/* Welcome */}
            <section className="welcome-section">
                <h2>Welcome back, {user?.name} 👋</h2>
            </section>


            {/* KEEP THE REST OF YOUR EXISTING DASHBOARD CODE HERE */}

        </div>
    );
}

export default Dashboard;