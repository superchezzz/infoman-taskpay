import React from 'react'
import "../styles/Login.css"

function Login(){
  return (
    <div className="login-container flex row min-h-screen">
        <div className="login-left-container flex-6 rounded-r-[30px] items-center justify-items-center">
            <h1 className="taskpay-FFE773 text-[128px]">Task<span className="taskpay-span-FEC400">Pay</span></h1>
            <p className="color-white text-[30px] font-medium text-opacity-80">Your Skills. Their Needs. One Platform.</p>
        </div>
        <div className="login-right-container flex-4">
            <form>
                
            </form>
        </div>
    </div>
  )
}

export default Login