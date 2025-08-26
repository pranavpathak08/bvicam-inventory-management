import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:8081/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.message === 'Login successful') {
                
                localStorage.setItem('token', data.token);
                localStorage.setItem('userid', data.userid);

                if (data.role === 'Admin') {
                    navigate('/adminDashboard');
                } else if (data.role === 'Faculty') {
                    navigate('/facultyDashboard');
                } else if (data.role === 'Super Admin') {
                    navigate('/superAdminDashboard');
                } else {
                    Swal.fire('Error', `Unknown role: ${data.role}`, 'error');
                }
            } else {
                Swal.fire('Login Failed', data.message, 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            Swal.fire('Error', 'Something went wrong. Please try again later.', 'error');
        }
    };

    return (
        <div className='container'>
            <div className='form-container'>
                <div className='form'>
                    <h2>Login</h2>
                    <input type='email' placeholder='Email ID' value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button onClick={handleLogin}>Login</button>
                    <p>New User? <a href='/signup' style={{ textDecoration: 'none' }}>Signup</a></p>
                </div>
            </div>
        </div>
    );
}
