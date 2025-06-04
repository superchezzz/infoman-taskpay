import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar'
import LandingPage from './pages/LandingPage';
import Login from './pages/Login'

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
      </Routes>
    </React.Fragment>


  );
}

export default App;