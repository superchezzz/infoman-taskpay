import React from 'react'
import './Navbar.css'
const Navbar = () => {
  return (
    <div className='Navbar'>
        
        <img src='' alt='' className='logo' />
        
        <ul>
            <li>Home</li>
            <li>Home</li>
            <li>Home</li>
            <li>Home</li>   
        </ul>

        <div className='search-box'>
            <input type="text" placeholder='Search'/>
            <img src='' alt=''/>
        </div>

        <img src='' alt='' className='toggle-icon'/>
    </div>
  )
}

export default Navbar