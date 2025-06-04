import React from 'react'
import './Navbar.css'
import {useNavigate} from "react-router-dom"

const Navbar = () => {
  const nav = useNavigate();
  return (
    <div className='Navbar'>
        
        <h1 className="taskpay-FFE773" onClick={() => nav('/')}> Task<span className="taskpay-span-FEC400">Pay</span></h1>
        
        <ul className="flex row list-none text-white text-opacity-60 gap-10 items-center justify-items-center">
            <li className="active-nav-link" onClick={() => nav('/')}>Home</li>
            <li>Jobs</li>
            <li>About Us</li>
            <li>Contact Us</li>   
        </ul>


    </div>
  )
}

export default Navbar

