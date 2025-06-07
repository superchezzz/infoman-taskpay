/**
 * @file Signup.jsx
 * @description Component for the user registration page.
 * @date 2025-06-07
 *
 * @description
 * This component renders the sign-up form. It handles user input, performs
 * client-side validation, and makes an API call to the backend registration
 * endpoint (`/api/auth/register`).
 *
 * It uses the 'selectedRole' passed from a previous route (e.g., the landing page)
 * via React Router's location state to determine if the user is signing up as an
 * 'applicant' or a 'client'.
 *
 * Upon successful registration, it stores the received user data and JWT token
 * in localStorage and navigates the user to their respective dashboard.
 */

import React, { useState } from 'react';
import axios from 'axios'; // Import axios for making API calls
import "../styles/Signup.css";
import { useNavigate, useLocation } from "react-router-dom";

function Signup() {
    // State for form inputs
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');

    // State for handling errors and loading feedback
    const [formError, setFormError] = useState(''); // For general errors from the backend
    const [passwordError, setPasswordError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // The 'selectedRole' ('applicant' or 'client') should be passed from the landing page
    // when the user navigates here. We use location.state for this.
    // Example from another component: navigate('/signup', { state: { selectedRole: 'applicant' } });
    const selectedRole = location.state?.selectedRole || 'applicant'; // Default to 'applicant' if not provided

    // --- Client-side validation functions ---
    const validatePassword = (pwd) => {
        // This validation should ideally match the backend's rules.
        if (pwd.length < 6) {
            setPasswordError('Password must be at least 6 characters long.');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const validatePhoneNumber = (num) => {
        // This regex checks for a valid Philippine phone number format.
        const phoneRegex = /^(09|\+639)\d{9}$/;
        if (num && !phoneRegex.test(num)) {
            setPhoneError('Please enter a valid PH phone number (e.g., 09xxxxxxxxx).');
            return false;
        }
        setPhoneError('');
        return true;
    };

    const validateEmail = (mail) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (mail && !emailRegex.test(mail)) {
            setEmailError('Please enter a valid email address.');
            return false;
        }
        setEmailError('');
        return true;
    };

    /**
     * @function handleSubmit
     * @description Handles the form submission event.
     * It performs client-side validation, then sends a POST request to the backend
     * registration API endpoint with the form data. It also handles success and error
     * responses from the backend.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(''); // Reset general error on new submission

        // Run all validations before attempting to submit
        const isPasswordValid = validatePassword(password);
        const isPhoneValid = validatePhoneNumber(phoneNumber);
        const isEmailValid = validateEmail(email);

        if (isPasswordValid && isPhoneValid && isEmailValid) {
            setIsLoading(true); // Set loading state for user feedback

            try {
                // Prepare the data payload for the backend API.
                // Note: The backend expects 'Surname' for last name.
                const registrationData = {
                    First_Name: firstName,
                    Surname: lastName,
                    Email: email,
                    PhoneNumber: phoneNumber,
                    Password: password,
                    selectedRole: selectedRole // Pass the role selected on the landing page
                };

                // Make the API call to our backend registration endpoint
                const response = await axios.post('http://localhost:3001/api/auth/register', registrationData);

                // If registration is successful, the backend responds with a 201 status and data
                console.log('Registration successful:', response.data);

                // --- Handle successful registration ---
                // Store the received token and user data in localStorage to manage the session
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('userData', JSON.stringify({
                    UserID: response.data.UserID,
                    Email: response.data.Email,
                    activeRole: response.data.activeRole
                }));

                // Navigate to the appropriate dashboard based on the role
                if (response.data.activeRole === 'applicant') {
                    navigate('/applicant-dashboard'); // Note: Ensure this route is defined in your React Router
                } else if (response.data.activeRole === 'client') {
                    navigate('/client-dashboard'); // Future route for clients
                } else {
                    navigate('/'); // Default fallback navigation
                }

            } catch (error) {
                // Handle errors returned from the backend API
                console.error('Registration failed:', error.response ? error.response.data : error.message);
                // Set the formError state to display the specific error message from the backend
                setFormError(error.response?.data?.message || 'An unknown error occurred. Please try again.');
            } finally {
                setIsLoading(false); // Reset loading state regardless of success or failure
            }
        } else {
            console.log('Client-side validation failed. Please check the form.');
            setFormError('Please correct the errors highlighted in the form.');
        }
    };

    return (
        <div className="signup-container flex row min-h-screen items-center">
            {/* Left container (brand info) - no functional changes needed */}
            <div className="signup-left-container min-h-screen flex-3 items-center justify-items-center">
                <svg onClick={() => navigate('/')} className="back-icon" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M26.9834 3.33337H13.0167C6.95004 3.33337 3.33337 6.95004 3.33337 13.0167V26.9667C3.33337 33.05 6.95004 36.6667 13.0167 36.6667H26.9667C33.0334 36.6667 36.65 33.05 36.65 26.9834V13.0167C36.6667 6.95004 33.05 3.33337 26.9834 3.33337ZM22.9834 25C23.4667 25.4834 23.4667 26.2834 22.9834 26.7667C22.7334 27.0167 22.4167 27.1334 22.1 27.1334C21.7834 27.1334 21.4667 27.0167 21.2167 26.7667L15.3334 20.8834C14.85 20.4 14.85 19.6 15.3334 19.1167L21.2167 13.2334C21.7 12.75 22.5 12.75 22.9834 13.2334C23.4667 13.7167 23.4667 14.5167 22.9834 15L17.9834 20L22.9834 25Z" fill="#F3BD06"/>
                </svg>
                <h1 className="taskpay-FFE773 text-[76px] ">Task<span className="taskpay-span-FEC400">Pay</span></h1>
                <p className="text-white text-[20px] font-medium text-opacity-80">Your Skills. Their Needs. One Platform.</p>
            </div>

            {/* Right container with the form */}
            <div className="signup-right-container flex-7 rounded-l-[20px]">
                <div className="signup-form-container color-black ">
                    <h1 className="signup-text font-bold text-[40px]">Sign Up</h1>
                    {/* Display general form errors from the backend here */}
                    {formError && <p className="form-error-message">{formError}</p>}
                    <form onSubmit={handleSubmit}>
                        {/* Input fields remain the same structurally */}
                        <div className="signup-name-row flex flex-row">
                            <div className="flex flex-col">
                                <label htmlFor="firstName">First Name</label>
                                <input type="text" id="firstName" name="firstName" placeholder="Your First Name" className="signup-form-group-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="lastName">Last Name</label>
                                <input type="text" id="lastName" name="lastName" placeholder="Your Last Name" className="signup-form-group-input" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                            </div>
                        </div>
                        <div className="signup-form-group">
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" name="email" placeholder="you@example.com" className="signup-form-group-input" value={email} onChange={(e) => { setEmail(e.target.value); validateEmail(e.target.value); }} required />
                            {emailError && <p className="error-message">{emailError}</p>}
                        </div>
                        <div className="signup-form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input type="tel" id="phone" name="phone" placeholder="+63 9xx xxxx xxx" className="signup-form-group-input" value={phoneNumber} onChange={(e) => { setPhoneNumber(e.target.value); validatePhoneNumber(e.target.value); }} required />
                            {phoneError && <p className="error-message">{phoneError}</p>}
                        </div>
                        <div className="signup-form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" name="password" placeholder="Min. 8 characters" className="signup-form-group-input" value={password} onChange={(e) => { setPassword(e.target.value); validatePassword(e.target.value); }} required />
                            {passwordError && <p className="error-message">{passwordError}</p>}
                        </div>

                        {/* Disable the button while the API call is in progress */}
                        <button type="submit" className="create-account-btn font-bold text-[24px]" disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'Create account'}
                        </button>

                        <p className="already-text">Already have an account? <a href="#" className="login-link" onClick={() => navigate('/login')}>Log in</a></p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Signup;