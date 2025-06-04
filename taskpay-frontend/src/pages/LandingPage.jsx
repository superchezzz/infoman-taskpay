import React,{useState} from 'react'
import "../styles/LandingPage.css"
import {useNavigate} from "react-router-dom"


function LandingPage(){
  const [activeTab, setActiveTab] = useState("hireTalent");
  const handleTabClick = (tabName) =>{
    setActiveTab(tabName);
  };
  const getQuote = () =>{
    if(activeTab == "hireTalent"){
      return '"Find The Right Skills, Right When You Need Them."';
    } else if (activeTab == "findTask"){
      return `"Get Paid For What You're Great At."`;
   } return "";
  } 
  const nav= useNavigate();

  return (
    <div className="landing-page-container items-center justify-items-center">
        <div className="items-center justify-items-center">
          <h1 className="text-[65px] text-white font-bold  leading-tight text-center ">Delivering talent to every task</h1>
          <p className="text-[18px] font-medium text-white text-opacity-80">Your Skills. Their Needs. One Platform.</p>
        </div>

        <div className='auth-card items-center justify-items-center'>
            <div className="hf-button flex row gap-5 color-black">
              <button className={`toggle-btn ${activeTab==="hireTalent" ? "active" : ""}`} onClick={() => handleTabClick("hireTalent")}>Hire Talent</button>
              <button className={`toggle-btn ${activeTab==="findTask" ? "active" : ""}`} onClick={() => handleTabClick("findTask")}>Find Task</button>
            </div>
            <p className="quote text-white text-[16px] font-bold italic leading-tight ">{getQuote()}</p>
            <div className="reg-button flex row gap-5">
              <button className="login-button" onClick={() => nav('/login')}>Login</button>
              <button className="signup-button" onClick={() => nav('/login')}>Sign Up</button>
            </div>
        </div>

    </div>
  )
}

export default LandingPage