import React,{useState} from 'react';
import "../auth.form.scss";
import{useNavigate,Link}from 'react-router'
import {useAuth} from'../hooks/useAuth'


const Login = () => {

const {loading,handleLogin}=useAuth()
const navigate=useNavigate()
const [errorMessage, setErrorMessage] = useState("");
const [email,setEmail]=useState("")
const[password,setPassword]=useState("")
    
        const handleSubmit =async (e)=>{
            e.preventDefault()
             setErrorMessage("");
         const result = await handleLogin({ email, password });
        
        if (result.success) {
            navigate('/home');
        } else {
            setErrorMessage(result.message || "Invalid email or password");
        }
    };
        if(loading){
            return (<main><h1>Loading......</h1></main>)
        }
    
    
    return (
        <main>
            <div className="form-container">
                 <h1>Login</h1>
                 
            {errorMessage && (
                    <div className="error-banner" style={{ color: 'red', marginBottom: '15px', fontWeight: 'bold' }}>
                        ⚠️ {errorMessage}
                    </div>
                )}
            <form onSubmit={handleSubmit}>
                
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input 
                    onChange={(e)=>{setEmail(e.target.value)}}
                    type="email" id="email" placeholder=" Enter a Email" />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input 
                     onChange={(e)=>{setPassword(e.target.value)}}
                    type="password" id="password" placeholder="Enter a Password" />
                </div>
                <button className='button primary-button'>login</button>
            </form>
            <p>Don't have an account? <Link to={"/Register"}>Register</Link></p>
            </div>
        </main>
    )
}

export default Login