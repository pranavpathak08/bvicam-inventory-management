import React, { useState, useEffect } from 'react';
import './navbar.css';
import './views.css';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import bvp from './bvp logo.png';
import Swal from 'sweetalert2';

export default function FacultyDashboard() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userid = localStorage.getItem('userid');

    const [categories, setCategories] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedItem, setSelectedItem] = useState('');
    const [itemCount, setItemCount] = useState(1);
    const [feedback, setFeedback] = useState('');
    const [userRequests, setUserRequests] = useState([]);
    const [searchRequest, setSearchRequest] = useState('');
    const [activeTab, setActiveTab] = useState('requestItem');
    const [showForm, setShowForm] = useState(true);

    const routeChange = (path) => {
        navigate(path);
    };

    useEffect(() => {
       fetch('http://localhost:8081/api/category/categories', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch categories");
            return res.json();
        })
        .then(data => setCategories(data))
        .catch(err => console.error('Error:', err.message));
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            fetch(`http://localhost:8081/api/inventory/inventory/${selectedCategory}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch inventory");
                return res.json();
            })
            .then(data => setInventory(data))
            .catch(err => console.error('Inventory Error:', err.message));
        }
    }, [selectedCategory]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedItem || itemCount <= 0 || isNaN(itemCount)) {
            Swal.fire('Invalid input', 'Please select a valid item and quantity.', 'warning');
            return;
        }

        fetch('http://localhost:8081/api/request/requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                userid,
                itemId: selectedItem,
                feedback,
                quantity: itemCount
            })
        })
        .then(res => res.json())
        .then(() => {
            Swal.fire('Success', 'Request submitted successfully', 'success');
            setSelectedCategory('');
            setSelectedItem('');
            setItemCount(1);
            setFeedback('');
        })
        .catch(err => {
            console.error('Submit Error:', err.message);
            Swal.fire('Error', 'Failed to submit request', 'error');
        });
    };

    useEffect(() => {
        if (activeTab === 'trackRequest' || activeTab === 'returnItem') {
            fetch(`http://localhost:8081/api/request/userRequests/${userid}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch user requests');
                return res.json();
            })
            .then(data => {
                if (activeTab === 'returnItem') {
                    setUserRequests(data.filter(req => req.Status === 'Approved'));
                } else {
                    setUserRequests(data);
                }
            })
            .catch(err => {
                console.error('Request Error:', err.message);
                Swal.fire('Error', 'Could not fetch user requests', 'error');
            });
        }
    }, [activeTab]);

    const handleReturnSubmit = (reqId, maxQuantity) => {
        Swal.fire({
            title: `Return quantity (Max: ${maxQuantity})`,
            input: 'number',
            inputAttributes: { min: 1, max: maxQuantity },
            showCancelButton: true,
            preConfirm: (val) => {
                if (!val || isNaN(val) || val <= 0 || val > maxQuantity) {
                    Swal.showValidationMessage(`Enter a valid quantity between 1 and ${maxQuantity}`);
                }
                return val;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                fetch('http://localhost:8081/api/return/returnItem', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ reqId, returnedQuantity: result.value })
                })
                .then(res => {
                    if (!res.ok) throw new Error('Failed to return item');
                    return res.json();
                })
                .then(() => {
                    Swal.fire('Returned!', 'Item returned successfully', 'success');
                    setUserRequests(prev => prev.filter(r => r.ReqID !== reqId));
                })
                .catch(err => Swal.fire('Error', err.message, 'error'));
            }
        });
    };

    const handleLogout = () => {
    localStorage.removeItem('token');
    Swal.fire('Logged out', 'You have been successfully logged out', 'success').then(() => {
        navigate('/login');
    });
};

    return (
        <>
            <div className="navbar">
                <img src={bvp} alt="BVP Logo" className="logo" />
                <div className="buttons-container">
                    <button className="home-button" onClick={() => routeChange('/home')}>Home</button>
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </div>
            </div>

            <div className="dashboard">
                <div className="sidebar">
                    <h2>Faculty Panel</h2>
                    <ul>
                        <li onClick={() => setActiveTab('requestItem')} className={activeTab === 'requestItem' ? 'active' : ''}>Request An Item</li>
                        <li onClick={() => setActiveTab('trackRequest')} className={activeTab === 'trackRequest' ? 'active' : ''}>Track Requests</li>
                        <li onClick={() => setActiveTab('returnItem')} className={activeTab === 'returnItem' ? 'active' : ''}>Return An Item</li>
                    </ul>
                </div>

                <div className="content">
                    {activeTab === 'requestItem' && (
                        <form onSubmit={handleSubmit}>
                            <div className="form-container">
                                <div className="form">
                                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                                        <option value="" disabled>Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.CategoryID} value={cat.CategoryID}>{cat.CategoryName}</option>
                                        ))}
                                    </select>

                                    <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} disabled={!selectedCategory}>
                                        <option value="" disabled>Select Item</option>
                                        {inventory.map(item => (
                                            <option key={item.ItemID} value={item.ItemID}>{item.Itemname}</option>
                                        ))}
                                    </select>

                                    <input type="number" min="1" value={itemCount} onChange={(e) => setItemCount(e.target.value)} placeholder="Quantity" />
                                    <input type="text" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Comments" />

                                    <button type="submit">Submit</button>
                                </div>
                            </div>
                        </form>
                    )}

                    {(activeTab === 'trackRequest' || activeTab === 'returnItem') && (
    <div className="table-section">
        <div className="search-section">
            <input
                type="text"
                className="search-input"
                placeholder="Search by Item Name, Quantity, Comment, or Status"
                value={searchRequest}
                onChange={(e) => setSearchRequest(e.target.value)}
            />
        </div>

        {userRequests.length === 0 ? (
            <p>No requests found.</p>
        ) : (
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th>Quantity</th>
                            <th>Comment</th>
                            <th>Status</th>
                            {activeTab === 'trackRequest' && <th>Remarks</th>}
                            {activeTab === 'returnItem' && <th>Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {userRequests
                            .filter(req =>
                                req.ItemName?.toLowerCase().includes(searchRequest.toLowerCase()) ||
                                req.Feedback?.toLowerCase().includes(searchRequest.toLowerCase()) ||
                                req.Status?.toLowerCase().includes(searchRequest.toLowerCase())
                            )
                            .map(req => (
                                <tr key={req.ReqID}>
                                    <td>{req.ItemName}</td>
                                    <td>{req.Quantity}</td>
                                    <td>{req.Feedback || 'N/A'}</td>
                                    <td>{req.Status}</td>
                                    {activeTab === 'trackRequest' && <td>{req.Remark || 'N/A'}</td>}
                                    {activeTab === 'returnItem' && (
                                        <td>
                                            <button
                                                className="action-button"
                                                onClick={() => handleReturnSubmit(req.ReqID, req.Quantity)}
                                            >
                                                Return
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
)}
                </div>
            </div>
        </>
    );
}
