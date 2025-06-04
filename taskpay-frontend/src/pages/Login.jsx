import React, {useState} from 'react'
import "../styles/Login.css"
import {useNavigate} from "react-router-dom"

function Login(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

     const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Login attempt:', { email, password });
        // here, send 'email' and 'password' to your backend API for authentication- loginUser(email, password);
    };
    const nav = useNavigate();
  return (
    <div className="login-container flex row min-h-screen items-center">
        <div className="login-left-container min-h-screen flex-6 rounded-r-[30px] items-center justify-items-center">
            <svg  onClick={() => nav('/')} className="back-icon" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M26.9834 3.33337H13.0167C6.95004 3.33337 3.33337 6.95004 3.33337 13.0167V26.9667C3.33337 33.05 6.95004 36.6667 13.0167 36.6667H26.9667C33.0334 36.6667 36.65 33.05 36.65 26.9834V13.0167C36.6667 6.95004 33.05 3.33337 26.9834 3.33337ZM22.9834 25C23.4667 25.4834 23.4667 26.2834 22.9834 26.7667C22.7334 27.0167 22.4167 27.1334 22.1 27.1334C21.7834 27.1334 21.4667 27.0167 21.2167 26.7667L15.3334 20.8834C14.85 20.4 14.85 19.6 15.3334 19.1167L21.2167 13.2334C21.7 12.75 22.5 12.75 22.9834 13.2334C23.4667 13.7167 23.4667 14.5167 22.9834 15L17.9834 20L22.9834 25Z" fill="#F3BD06"/>
            </svg>
            <h1 className="taskpay-FFE773 text-[128px] ">Task<span className="taskpay-span-FEC400">Pay</span></h1>
            <p className="text-white text-[30px] font-medium text-opacity-80">Your Skills. Their Needs. One Platform.</p>
        </div>
        <div className="login-right-container flex-4 justify rounded-tr-[20px] rounded-br-[20px]">
            <div className="login-form-container color-black ">
                <form onSubmit={handleSubmit}>
                    <div className="login-form-group">
                        <label htmlFor="email" className="login-label text-[16px">Email</label>
                        <input className="login-form-group-input w-[480px] h-[50px]" type="email" id="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                        <label htmlFor="password" className="login-label text-[16px]">Password</label>
                        <input className="login-form-group-input w-[480px] h-[50px]"type="password" id="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                    </div>
                    <button type="submit" className="login-submit-button text-[16px] text-white">Log In</button>
                </form>
                <p className="signup-text underline">Don't have an account? <a href="/signup" className="signup-link"><span className="signup-span">Sign Up</span></a></p>
            </div>
            
        </div>
    </div>
  )
}

export default Login