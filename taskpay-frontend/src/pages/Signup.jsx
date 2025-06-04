import React, { useState } from 'react';
import "../styles/Signup.css";
import { useNavigate } from "react-router-dom";

function Signup() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');  
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [emailError, setEmailError] = useState('');

    const nav = useNavigate();

    const validatePassword = (pwd) => {
        if (pwd.length < 8) {
            setPasswordError('Password must be at least 8 characters long.');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const validatePhoneNumber = (num) => {
        const phoneRegex = /^(09|\+639)\d{9}$/;
        if (num && !phoneRegex.test(num)) {
            setPhoneError('Please enter a valid Philippine phone number (e.g., 09xx xxxxxxx or +639xxxxxxxxx).');
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


    const handleSubmit = (e) => {
        e.preventDefault();

        const isPasswordValid = validatePassword(password);
        const isPhoneValid = validatePhoneNumber(phoneNumber);
        const isEmailValid = validateEmail(email);

        if (isPasswordValid && isPhoneValid && isEmailValid) {
            console.log('Signup attempt:', { firstName, lastName, email, phoneNumber, password });
            // send 'email' and 'password' to your backend API for authentication or user registration.
            alert('Account created successfully!');
        } else {
            console.log('Validation failed. Please check the form.');
        }
    };

    return (
        <div className="signup-container flex row min-h-screen items-center">

            <div className="signup-left-container min-h-screen flex-3 items-center justify-items-center">
                <svg onClick={() => nav('/')} className="back-icon" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M26.9834 3.33337H13.0167C6.95004 3.33337 3.33337 6.95004 3.33337 13.0167V26.9667C3.33337 33.05 6.95004 36.6667 13.0167 36.6667H26.9667C33.0334 36.6667 36.65 33.05 36.65 26.9834V13.0167C36.6667 6.95004 33.05 3.33337 26.9834 3.33337ZM22.9834 25C23.4667 25.4834 23.4667 26.2834 22.9834 26.7667C22.7334 27.0167 22.4167 27.1334 22.1 27.1334C21.7834 27.1334 21.4667 27.0167 21.2167 26.7667L15.3334 20.8834C14.85 20.4 14.85 19.6 15.3334 19.1167L21.2167 13.2334C21.7 12.75 22.5 12.75 22.9834 13.2334C23.4667 13.7167 23.4667 14.5167 22.9834 15L17.9834 20L22.9834 25Z" fill="#F3BD06"/>
                </svg>

                <h1 className="taskpay-FFE773 text-[76px] ">Task<span className="taskpay-span-FEC400">Pay</span></h1>
                <p className="text-white text-[20px] font-medium text-opacity-80">Your Skills. Their Needs. One Platform.</p>
            </div>
            <div className="signup-right-container flex-7 rounded-l-[20px]">
                <div className="signup-form-container color-black ">
                    <h1 className="signup-text font-bold text-[40px]">Sign Up</h1>
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

                        <button type="submit" className="create-account-btn font-bold text-[24px]">Create account</button>

                        <p className="already-text">Already have an account? <a href="#" className="login-link" onClick={() => nav('/login')}>Log in</a></p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Signup;