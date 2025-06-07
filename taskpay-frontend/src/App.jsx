import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar'
import LandingPage from './pages/LandingPage';
import Login from './pages/Login'
import Signup from './pages/Signup'
import ApplicantDashboard from './pages/ApplicantDashboard';


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
      </Routes>
    </React.Fragment>


  );
}

export default App;