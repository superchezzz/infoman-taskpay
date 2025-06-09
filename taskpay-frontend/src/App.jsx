import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ApplicantDashboard from './pages/ApplicantDashboard';
import ApplicantEditProfile from './pages/ApplicantEditProfile';
import ClientDashboard from './pages/ClientDashboard';
import ClientViewApplicantInfo from './components/ClientDashboard/ClientViewApplicantInfo.jsx';

function App(){
  return (
    <React.Fragment>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <LandingPage />
            </>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/applicant-dashboard" element={<ApplicantDashboard />} />
        <Route path="/applicant-edit-profile" element={<ApplicantEditProfile />} />

        {/* Existing Client Dashboard Route */}
        <Route path="/client-dashboard" element={<ClientDashboard />} />

        {/* NEW ROUTE for Client View Applicant Info */}
        {/* This route uses a URL parameter ':applicantId' which ClientViewApplicantInfo.jsx will read */}
        <Route path="/client/applicant-info/:applicantId" element={<ClientViewApplicantInfo />} />

      </Routes>
    </React.Fragment>
  );
}

export default App;