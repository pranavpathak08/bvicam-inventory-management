import React, { useState } from 'react';
import Swal from 'sweetalert2';

export default function Signup() {
    const [userName, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [deptname, setDeptname] = useState('');
    const [empId, setEmpid] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const validateEmail = (email) => {
        const atIndex = email.indexOf('@');
        return email.substring(atIndex + 1) === 'bvicam.in';
    };

    const handleSignup = (e) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            Swal.fire('Invalid Email', 'Use your @bvicam.in email', 'error');
            return;
        }

        if (password !== confirmPassword) {
            Swal.fire('Password Mismatch', "Passwords don't match", 'warning');
            return;
        }

        fetch('http://localhost:8081/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userName,
                phone,
                email,
                deptname,
                empId,
                password
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'User registered successfully') {
                    Swal.fire('Success', 'You are registered as Faculty!', 'success');
                } else {
                    Swal.fire('Error', data.message || 'Something went wrong', 'error');
                }
            })
            .catch(error => {
                console.error('Signup error:', error);
                Swal.fire('Error', 'Server error. Try again later.', 'error');
            });
    };

    return (
        <div className='container'>
            <div className='form-container'>
                <div className='form'>
                    <h2>Sign Up (Faculty Only)</h2>
                    <input type='text' placeholder='User Name' value={userName} onChange={(e) => setUsername(e.target.value)} />
                    <input type='number' placeholder='Phone Number' value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <select value={deptname} onChange={(e) => setDeptname(e.target.value)}>
                        <option value="" disabled>Select Department</option>
                        <option value="MCA">MCA</option>
                        <option value="BA(JMC)">BA(JMC)</option>
                    </select>
                    <input type='number' placeholder='Employee ID' value={empId} onChange={(e) => setEmpid(e.target.value)} />
                    <input type='email' placeholder='Email ID' value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
                    <input type='password' placeholder='Confirm Password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    <button onClick={handleSignup}>Signup</button>
                    <p>Already Registered? <a href='/login'>Login</a></p>
                </div>
            </div>
        </div>
    );
}
