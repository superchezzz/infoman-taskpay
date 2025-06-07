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
 * @modification
 * Upon successful registration, this component will now display a success alert
 * to the user and then navigate them back to the landing page. It no longer
 * automatically logs the user in; the user must now log in manually after
 * creating their account.
 */

import React, { useState } from 'react';
import axios from 'axios';
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
    const [formError, setFormError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // The 'selectedRole' ('applicant' or 'client') is passed from the landing page.
    const selectedRole = location.state?.selectedRole || 'applicant'; // Default to 'applicant'

    // --- Client-side validation functions (no changes here) ---
    const validatePassword = (pwd) => {
        if (pwd.length < 6) {
            setPasswordError('Password must be at least 6 characters long.');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const validatePhoneNumber = (num) => {
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
     * @description Handles form submission. On successful API response, it shows a
     * success alert and redirects to the landing page.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        // Run all validations before attempting to submit
        const isPasswordValid = validatePassword(password);
        const isPhoneValid = validatePhoneNumber(phoneNumber);
        const isEmailValid = validateEmail(email);

        if (isPasswordValid && isPhoneValid && isEmailValid) {
            setIsLoading(true);

            try {
                // Prepare the data payload for the backend API.
                const registrationData = {
                    First_Name: firstName,
                    Surname: lastName,
                    Email: email,
                    PhoneNumber: phoneNumber,
                    Password: password,
                    selectedRole: selectedRole
                };

                // Make the API call to the backend registration endpoint
                const response = await axios.post('http://localhost:3001/api/auth/register', registrationData);

                // --- MODIFICATION: Handle successful registration ---
                // If registration is successful, show an alert and redirect.
                console.log('Registration successful:', response.data);

                alert('Account created successfully! Please log in to continue.');

                // Navigate the user back to the landing page ('/')
                navigate('/');

            } catch (error) {
                // Handle errors from the backend API
                console.error('Registration failed:', error.response ? error.response.data : error.message);
                setFormError(error.response?.data?.message || 'An unknown error occurred. Please try again.');
            } finally {
                setIsLoading(false);
            }
        } else {
            console.log('Client-side validation failed. Please check the form.');
            setFormError('Please correct the errors highlighted in the form.');
        }
    };

    // The JSX for the form remains the same as before.
    return (
        <div className="signup-container flex row min-h-screen items-center">
            {/* Left container (brand info) */}
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
                    {formError && <p className="form-error-message">{formError}</p>}
                    <form onSubmit={handleSubmit}>
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