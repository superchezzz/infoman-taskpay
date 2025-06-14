/**
 * @file LandingPage.jsx
 * @description Component for the main landing/welcome page.
 * @date 2025-06-07
 *
 * @description
 * This component serves as the entry point for users. It features a toggle
 * to select a primary role: 'client' (Hire Talent) or 'applicant' (Find Task).
 *
 * @modification
 * The "Login" and "Sign Up" buttons have been updated. They now use the `navigate`
 * function from `react-router-dom` to pass the currently selected role to the
 * respective pages (`/login` and `/signup`) via location state. This is crucial
 * for our backend's multi-role authentication system.
 */

import React, { useState } from 'react';
import "../styles/LandingPage.css";
import { useNavigate } from "react-router-dom";

function LandingPage() {
    // Track which tab is active: 'hireTalent' (client) or 'findTask' (applicant)
    const [activeTab, setActiveTab] = useState("hireTalent");
    const nav = useNavigate();

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    const getQuote = () => {
        if (activeTab === "hireTalent") {
            return '"Find The Right Skills, Right When You Need Them."';
        } else if (activeTab === "findTask") {
            return `"Get Paid For What You're Great At."`;
        }
        return "";
    };

    // Navigates to login or signup, passing the selected role in state
    const handleNavigation = (path) => {
        const role = activeTab === "hireTalent" ? "client" : "applicant";
        const stateToPass = path === '/login'
            ? { loginRole: role }
            : { selectedRole: role };
        nav(path, { state: stateToPass });
    };

    return (
        <div className="landing-page-container items-center justify-items-center">
            <div className="items-center justify-items-center">
                <h1 className="text-[65px] text-white font-bold  leading-tight text-center ">Delivering talent to every task</h1>
                <p className="text-[18px] font-medium text-white text-opacity-80">Your Skills. Their Needs. One Platform.</p>
            </div>

            <div className='auth-card items-center justify-items-center'>
                <div className="hf-button flex row gap-5 color-black">
                    <button className={`toggle-btn ${activeTab === "hireTalent" ? "active" : ""}`} onClick={() => handleTabClick("hireTalent")}>Hire Talent</button>
                    <button className={`toggle-btn ${activeTab === "findTask" ? "active" : ""}`} onClick={() => handleTabClick("findTask")}>Find Task</button>
                </div>

                <p className="quote text-white text-[16px] font-bold italic leading-tight ">{getQuote()}</p>

                <div className="reg-button flex row gap-5">
                    <button className="login-button" onClick={() => handleNavigation('/login')}>Login</button>
                    <button className="signup-button" onClick={() => handleNavigation('/signup')}>Sign Up</button>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;