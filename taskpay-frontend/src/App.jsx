import React from 'react'
import Navbar from './components/Navbar/Navbar'
import LandingPage from './pages/LandingPage';

function App(){
  return (
    <div  className='container'>  
      <Navbar />
      <LandingPage />
    </div>
  )
}

export default App;