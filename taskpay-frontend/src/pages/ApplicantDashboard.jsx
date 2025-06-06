import React, {useState} from 'react'
import "../styles/ApplicantDashboard.css"

function ApplicantDashboard (){
    const [applicantFirstName, setApplicantFirstName] = useState("User");
    return (
        <div className="applicant-dashboard-container min-h-screen">
            <div className="applicant-dashboard-header flex flex-row items-center">
                <h1 className="applicant-taskpay-title text-[32px] tracking-[3px] font-bold">Task<span>Pay</span></h1>
                <div className="applicant-dashboard-name-img-container leading-[15px]">
                    <div>
                        <p className="tracking-[3px] font-bold text-18px">Welcome, {applicantFirstName} </p>
                        <p className="application-dashboard-text tracking-[3px] text-16px font-bold">Applicant Dashboard</p>
                    </div>
                    <div>
                        <img></img>
                    </div>
                </div>

            </div>
            <div className="applicant-dashboard-body-container flex flex-row">
                <div className="my-profile-container">
                    <div className="flex flex-column items-center">
                        <svg width="33" height="34" viewBox="0 0 33 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.4615 16.765C20.1788 16.765 23.1923 13.6376 23.1923 9.77973C23.1923 5.92186 20.1788 2.79443 16.4615 2.79443C12.7442 2.79443 9.73071 5.92186 9.73071 9.77973C9.73071 13.6376 12.7442 16.765 16.4615 16.765Z" stroke="#5A5A5A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M28.0249 30.7355C28.0249 25.3288 22.8422 20.9561 16.4614 20.9561C10.0806 20.9561 4.89795 25.3288 4.89795 30.7355" stroke="#5A5A5A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <h1>My Profile</h1>
                    </div>
                    <svg width="356" height="1" viewBox="0 0 356 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="4.11158e-08" y1="0.5" x2="356" y2="0.500033" stroke="#5A5A5A" stroke-opacity="0.15"/>
                    </svg>

                    <div>
                        <p>My Task Appl</p>
                    </div>
                </div>
                <div className="my-task-application-container">
                    <p>My Task Application</p>
                </div>
            </div>
            <div className="applicant-dashboard-footer">

            </div>

        </div>
  )
}

export default ApplicantDashboard