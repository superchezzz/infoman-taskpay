/**
 * @file Login.jsx
 * @description Component for the user login page.
 * @date 2025-06-07
 *
 * @description
 * This component renders the login form. It handles user input for email and password,
 * and makes an API call to the backend login endpoint (`/api/auth/login`).
 *
 * It uses the 'loginRole' passed from a previous route (e.g., the landing page)
 * via React Router's location state to tell the backend which role the user
 * intends to log in as ('applicant' or 'client').
 *
 * Upon successful login, it stores the received user data and JWT token
 * in localStorage and navigates the user to their respective dashboard.
 */

import React, { useState } from 'react';
import axios from 'axios'; // Import axios for making API calls
import "../styles/Login.css";
import { useNavigate, useLocation } from "react-router-dom";

function Login() {
    // State for form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // State for handling errors and loading feedback
    const [formError, setFormError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // The 'loginRole' should be passed from the landing page.
    // Example from another component: navigate('/login', { state: { loginRole: 'applicant' } });
    const loginRole = location.state?.loginRole || 'applicant'; // Default to 'applicant' if not provided

    /**
     * @function handleSubmit
     * @description Handles the form submission event.
     * It sends a POST request to the backend login API endpoint with the form data.
     * It also handles success and error responses from the backend.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(''); // Reset error on new submission
        setIsLoading(true); // Set loading state for user feedback

        try {
            // Prepare the data payload for the backend API
            const loginData = {
                Email: email,
                Password: password,
                loginRole: loginRole // Pass the role context to the backend
            };

            // Make the API call to our backend login endpoint
            const response = await axios.post('http://localhost:3001/api/auth/login', loginData);

            // If login is successful, the backend responds with a 200 status and data
            console.log('Login successful:', response.data);

            // --- Handle successful login ---
            // Store the received token and user data in localStorage to manage the session
            localStorage.setItem('authToken', response.data.token);
            localStorage.setItem('userData', JSON.stringify({
                UserID: response.data.UserID,
                Email: response.data.Email,
                activeRole: response.data.activeRole
            }));

            // Navigate to the appropriate dashboard based on the active role
            if (response.data.activeRole === 'applicant') {
                navigate('/applicant-dashboard'); // Ensure this route is defined in your React Router
            } else if (response.data.activeRole === 'client') {
                navigate('/client-dashboard'); // Future route for clients
            } else if (response.data.activeRole === 'admin') {
                navigate('/admin-dashboard'); // Future route for admins
            } else {
                navigate('/'); // Default fallback navigation
            }

        } catch (error) {
            // Handle errors returned from the backend API (e.g., 401 Invalid Credentials)
            console.error('Login failed:', error.response ? error.response.data : error.message);
            // Set the formError state to display the specific error message from the backend
            setFormError(error.response?.data?.message || 'An unknown error occurred. Please try again.');
        } finally {
            setIsLoading(false); // Reset loading state regardless of success or failure
        }
    };

    return (
        <div className="login-container flex row min-h-screen items-center">
            {/* Left container (brand info) - no functional changes needed */}
            <div className="login-left-container min-h-screen flex-6 rounded-r-[30px] items-center justify-items-center">
                <svg onClick={() => navigate('/')} className="back-icon" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M26.9834 3.33337H13.0167C6.95004 3.33337 3.33337 6.95004 3.33337 13.0167V26.9667C3.33337 33.05 6.95004 36.6667 13.0167 36.6667H26.9667C33.0334 36.6667 36.65 33.05 36.65 26.9834V13.0167C36.6667 6.95004 33.05 3.33337 26.9834 3.33337ZM22.9834 25C23.4667 25.4834 23.4667 26.2834 22.9834 26.7667C22.7334 27.0167 22.4167 27.1334 22.1 27.1334C21.7834 27.1334 21.4667 27.0167 21.2167 26.7667L15.3334 20.8834C14.85 20.4 14.85 19.6 15.3334 19.1167L21.2167 13.2334C21.7 12.75 22.5 12.75 22.9834 13.2334C23.4667 13.7167 23.4667 14.5167 22.9834 15L17.9834 20L22.9834 25Z" fill="#F3BD06"/>
                </svg>
                <h1 className="taskpay-FFE773 text-[128px] ">Task<span className="taskpay-span-FEC400">Pay</span></h1>
                <p className="text-white text-[30px] font-medium text-opacity-80">Your Skills. Their Needs. One Platform.</p>
            </div>

            {/* Right container with the form */}
            <div className="login-right-container flex-4 justify rounded-tr-[20px] rounded-br-[20px]">
                <div className="login-form-container color-black ">
                    <h1 className="login-text font-bold text-[40px]">Log In</h1>
                    {/* Display general form errors from the backend here */}
                    {formError && <p className="form-error-message">{formError}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="login-form-group">
                            <label htmlFor="email" className="login-label text-[16px]">Email</label>
                            <input className="login-form-group-input w-[480px] h-[50px]" type="email" id="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                        </div>
                        <div className="login-form-group">
                            <label htmlFor="password" className="login-label text-[16px]">Password</label>
                            <input className="login-form-group-input w-[480px] h-[50px]"type="password" id="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                        </div>
                        {/* Disable the button while the API call is in progress */}
                        <button type="submit" className="login-submit-button text-[16px] text-white" disabled={isLoading}>
                            {isLoading ? 'Logging In...' : 'Log In'}
                        </button>
                    </form>
                    <p className="signup-text underline">Don't have an account? <a href="#" onClick={() => navigate('/signup')} className="signup-link"><span className="signup-span">Sign Up</span></a></p>
                </div>
            </div>
        </div>
    );
}

export default Login;
