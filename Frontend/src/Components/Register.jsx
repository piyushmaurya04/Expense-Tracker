import React, { useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { AuthContext } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Register.css';
function Register() {
    const { register } = useContext(AuthContext);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setSuccessMessage("");

        try {
            const userData = { username, email, password };
            const response = await register(userData);

            console.log("Response data:", response.data);
            console.log("Full response:", response);

            if (response.message === "User registered successfully!") {
                setSuccessMessage("Registration successful! Redirecting to login...");
                setUsername("");
                setEmail("");
                setPassword("");

                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setMessage(response.message || "Registration completed");
            }
        } catch (error) {
            setMessage("Error registering user.");
            console.error("Registration error:", error);
        } finally {
            setLoading(false);
        }
    }


    return (
        <>
            {successMessage && (
                <div className="success-message-overlay">
                    <div className="success-message-box">
                        <FaCheckCircle className="success-icon" />
                        <span>{successMessage}</span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="register-form">
                <div className="form-group mb-3">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        id="username"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="exampleInputEmail1">Email address</label>
                    <input
                        type="email"
                        className="form-control"
                        id="exampleInputEmail1"
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="exampleInputPassword1">Password</label>
                    <div className="password-input-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            id="exampleInputPassword1"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            required
                            disabled={loading}
                        />
                        <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            disabled={loading}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>

                <div className="form-group form-check mb-3">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="exampleCheck1"
                        disabled={loading}
                    />
                    <label className="form-check-label" htmlFor="exampleCheck1">Remember me</label>
                </div>

                <button type="submit" className="btn btn-success" disabled={loading}>
                    {loading ? 'Registering...' : 'Submit'}
                </button>
            </form>

            <div className="text-center mt-3">
                <p className="mb-3">
                    Already have an account?{' '}
                    <Link to="/login" className="text-decoration-none">
                        Login here
                    </Link>
                </p>
            </div>

            {message && <p className="error-message">{message}</p>}
        </>
    );
}

export default Register;
