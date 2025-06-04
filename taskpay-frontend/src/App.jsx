import React from 'react'
import Navbar from './components/Navbar/Navbar'
import LandingPage from './pages/LandingPage';
import Login from './pages/Login'

function App(){
  return (
    <div  className='container'>  
      <Navbar />
      <LandingPage />
      <Login />
    </div>
  )
}

export default App;