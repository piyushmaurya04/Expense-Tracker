import React, { useState, useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaExclamationCircle, FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';
function Login() {
    const { login } = useContext(AuthContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // 'success' or 'error'
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(""); // Clear previous messages
        console.log("Username:", username);
        console.log("Password:", password);
        try {
            const credentials = { username, password };
            await login(credentials);
            setMessage("Login successful!");
            setMessageType("success");
            setUsername("");
            setPassword("");
            // Navigate to add expense page after successful login
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } catch (error) {
            setMessage(error.response?.data?.message || "Invalid username or password. Please try again.");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    }
    return (
        <>
            {message && (
                <div className={`alert-message ${messageType}`}>
                    {messageType === 'error' ? <FaExclamationCircle /> : <FaCheckCircle />}
                    <span>{message}</span>
                </div>
            )}
            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group mb-3 ">
                    <label htmlFor="username" >Username</label>
                    <input type="text" className="form-control" id="username" onChange={(e) => setUsername(e.target.value)} value={username} required />
                </div>
                <div className="form-group mb-3">
                    <label htmlFor="password">Password</label>
                    <div className="password-input-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            id="password"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>
                <button type="submit" className="btn btn-success" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <p className="text-center mt-3">Don't have an account? <Link to="/register">Register</Link></p>
        </>
    );



}


export default Login;