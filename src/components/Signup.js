import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { showToast } from "./Toastify2";
function SignUp() {
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    

    const handleCreateAccount = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Password does not match!");
            return;
        }
        setError("");

        try {
            const response = await fetch("http://localhost:5000/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password, contact,})
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Signup failed"); 
            }
            showToast("success", "Account Created Successfully", 3000);
            setTimeout(() => {
                navigate('/salesman');
            }, 1500);

        } catch (error) {
            alert(error.response?.data?.message || "Signup failed");
        }

    };
    return (
        <div className="container mt-5">
        <div className="row justify-content-center">
            <div className="col-md-6">
                <div className="card shadow-lg p-4">
                    <h2 className="text-center mb-4">Create Pharmacy Salesman Account</h2>
                    <form onSubmit={handleCreateAccount}>
                        <div className="mb-3 input-group">
                            <span className="input-group-text"><i className="fas fa-user"></i></span>
                            <input type="text" className="form-control" placeholder="Salesman Name" 
                                value={name} onChange={(e) => setName(e.target.value)} minLength={3} required />
                        </div>
                        
                        <div className="mb-3 input-group">
                            <span className="input-group-text"><i className="fas fa-phone"></i></span>
                            <input type="number" className="form-control" placeholder="Contact Number" 
                                value={contact} onChange={(e) => setContact(e.target.value)} required />
                        </div>
                        
                        <div className="mb-3 input-group">
                            <span className="input-group-text"><i className="fas fa-envelope"></i></span>
                            <input type="email" className="form-control" placeholder="Email Address" 
                                value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        
                        <div className="mb-3 input-group">
                            <span className="input-group-text"><i className="fas fa-lock"></i></span>
                            <input type="password" className="form-control" placeholder="Password" 
                                value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
                        </div>
                        
                        <div className="mb-3 input-group">
                            <span className="input-group-text"><i className="fas fa-lock"></i></span>
                            <input type="password" className="form-control" placeholder="Confirm Password" 
                                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} required />
                        </div>
                        
                        {error && <p className="text-danger text-center">{error}</p>}
                        
                        <button type="submit" className="btn btn-primary w-100">Create Salesman Account</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    )
}

export default SignUp
