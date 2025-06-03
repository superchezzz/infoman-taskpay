import React from 'react'
import './Navbar.css'
const Navbar = () => {
  return (
    <div className='Navbar'>
        
        <h1 className="taskpay-FFE773">Task<span className="taskpay-span-FEC400">Pay</span></h1>
        
        <ul className="flex row list-none gap-10">
            <li>Home</li>
            <li>Jobs</li>
            <li>About Us</li>
            <li>Contact Us</li>   
        </ul>


    </div>
  )
}

export default Navbar

