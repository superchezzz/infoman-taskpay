/**
 * @file Login.jsx
 * @description
 * Renders the user login page. This component provides a form for email and
 * password authentication. It determines the user's intended role ('applicant' or 'client')
 * from the navigation state and communicates this to the backend API. Upon successful
 * authentication, it saves the session data (JWT, user info) to localStorage and
 * redirects the user to their corresponding dashboard.
 */

import React, { useState } from 'react';
import axios from 'axios';
import "../styles/Login.css";
import { useNavigate, useLocation } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // The user's role is passed via location state from the page they clicked "Login" on.

    const loginRole = location.state?.loginRole || 'applicant'; // Default to 'applicant' if state is not passed.

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(''); // Reset previous errors on a new submission.
        setIsLoading(true); // Provide visual feedback that the request is in progress.

        try {
            const loginData = {
                Email: email,
                Password: password,
                loginRole: loginRole // Inform the backend which role the user is trying to log in as.
            };

            const response = await axios.post('http://localhost:3001/api/auth/login', loginData);
            console.log('Login successful:', response.data);

            // Store session data to maintain the user's logged-in state.
            sessionStorage.setItem('authToken', response.data.token);
            sessionStorage.setItem('userData', JSON.stringify({
                UserID: response.data.UserID,
                Email: response.data.Email,
                activeRole: response.data.activeRole
            }));

            // Navigate to the correct dashboard based on the user's role.
            switch (response.data.activeRole) {
                case 'applicant':
                    navigate('/applicant-dashboard');
                    break;
                case 'client':
                    navigate('/client-dashboard');
                    break;
                case 'admin':
                    navigate('/admin-dashboard'); // For future admin functionality
                    break;
                default:
                    navigate('/'); // Fallback to the homepage if the role is unrecognized.
                    break;
            }

        } catch (error) {
            // Display a user-friendly error message from the API response.
            console.error('Login failed:', error.response ? error.response.data : error.message);
            setFormError(error.response?.data?.message || 'An unknown error occurred. Please try again.');
        } finally {
            // Ensure the loading state is reset whether the request succeeded or failed.
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container flex row min-h-screen items-center">
            <div className="login-left-container min-h-screen flex-6 rounded-r-[30px] items-center justify-items-center">
                <svg onClick={() => navigate('/')} className="back-icon" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M26.9834 3.33337H13.0167C6.95004 3.33337 3.33337 6.95004 3.33337 13.0167V26.9667C3.33337 33.05 6.95004 36.6667 13.0167 36.6667H26.9667C33.0334 36.6667 36.65 33.05 36.65 26.9834V13.0167C36.6667 6.95004 33.05 3.33337 26.9834 3.33337ZM22.9834 25C23.4667 25.4834 23.4667 26.2834 22.9834 26.7667C22.7334 27.0167 22.4167 27.1334 22.1 27.1334C21.7834 27.1334 21.4667 27.0167 21.2167 26.7667L15.3334 20.8834C14.85 20.4 14.85 19.6 15.3334 19.1167L21.2167 13.2334C21.7 12.75 22.5 12.75 22.9834 13.2334C23.4667 13.7167 23.4667 14.5167 22.9834 15L17.9834 20L22.9834 25Z" fill="#F3BD06"/>
                </svg>
                <h1 className="taskpay-FFE773 text-[128px] ">Task<span className="taskpay-span-FEC400">Pay</span></h1>
                <p className="text-white text-[30px] font-medium text-opacity-80">Your Skills. Their Needs. One Platform.</p>
            </div>

            <div className="login-right-container flex-4 justify rounded-tr-[20px] rounded-br-[20px]">
                <div className="login-form-container color-black ">
                    <h1 className="login-text font-bold text-[40px]">Log In</h1>
                    {/* Display API or validation errors to the user */}
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
                        {/* Disable the button during the API call to prevent multiple submissions */}
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