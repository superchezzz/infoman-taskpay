import React, {useState} from 'react'
import "../styles/Login.css"

function Login(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

     const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Login attempt:', { email, password });
        // Here you would typically send 'email' and 'password' to your backend API
        // for authentication.
        // e.g., loginUser(email, password);
    };
  return (
    <div className="login-container flex row min-h-screen items-center">
        <div className="login-left-container min-h-screen flex-6 rounded-r-[30px] items-center justify-items-center">
            <h1 className="taskpay-FFE773 text-[128px] ">Task<span className="taskpay-span-FEC400">Pay</span></h1>
            <p className="text-white text-[30px] font-medium text-opacity-80">Your Skills. Their Needs. One Platform.</p>
        </div>
        <div className="login-right-container flex-4 justify ">
            <div className="login-form-container color-black ">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email" className="login-label text-[16px">Email</label>
                        <input className="form-group-input w-[480px] h-[50px]" type="email" id="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                        <label htmlFor="password" className="login-label text-[16px]">Password</label>
                        <input className="form-group-input w-[480px] h-[50px]"type="password" id="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                    </div>
                    <button type="submit" className="login-submit-button text-[16px] text-white">Log In</button>
                </form>
                <p className="signup-text underline">Don't have an account? <a href="/signup" className="signup-link"><span className="signup-span">Sign Up</span></a></p>
            </div>
            
        </div>
    </div>
  )
}

export default Login