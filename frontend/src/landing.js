import React from 'react';
import bvp from './bvp logo.png';
import { useNavigate } from 'react-router-dom';
import './landing.css';
import './navbar.css'

export default function Landing() {
    let navigate = useNavigate();

    const routeChange = (path) => {
        navigate(path);
    };

    return (
        <div className="landing-container">
            <div className="navbar">
                <img src={bvp} alt="BVP Logo" className="logo" />
                <div className="buttons-container">
                    <button className="login-button" onClick={() => routeChange('/login')}>Login</button>
                    <button className="home-button" onClick={() => routeChange('/home')}>Home</button>
                </div>
                
            </div>
            <h1 className='title'>INVENTORY MANAGEMENT FOR BVICAM</h1>
            <h3>"Effortless tracking, smarter stocking—inventory management with precision and ease"</h3>
            <div className="landing-buttons">
            <div className="landing-box">
                <h4>Request an Item</h4>
                <p>Easily request items you need for your tasks or projects.</p>
                <button onClick={() => routeChange('/login')}>Request An Item</button>
            </div>
            <div className="landing-box">
                <h4>Add to Inventory</h4>
                <p>Update the inventory with new items efficiently.</p>
                <button onClick={() => routeChange('/login')}>Add to Inventory</button>
            </div>
            <div className="landing-box">
                <h4>View Users</h4>
                <p>Check the list of registered users in the system.</p>
                <button onClick={() => routeChange('/login')}>View Users</button>
            </div>
            <div className="landing-box">
                <h4>Track Requests</h4>
                <p>Monitor and manage the status of all item requests.</p>
                <button onClick={() => routeChange('/login')}>Track Requests</button>
            </div>
        </div>

        </div>
    );
}
