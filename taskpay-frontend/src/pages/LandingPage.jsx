import React from 'react'


function LandingPage(){
  return (
    <div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight">Delivering talent to every task</h1>
        <p>Your Skills. Their Needs. One Platform.</p>

        <div className='search-box'>
            <input type="text" placeholder='Seach by role, skills, keywords'/>
            <img src='' alt=''/>
        </div>

        <img src='' alt='' className='toggle-icon'/>
    </div>
  )
}

export default LandingPage