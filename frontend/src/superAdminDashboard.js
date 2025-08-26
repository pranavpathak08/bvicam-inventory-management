import React, { useState, useEffect } from 'react';
import './navbar.css';
import './views.css'
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import bvp from './bvp logo.png';
import Swal from 'sweetalert2';

    
export default function SuperAdminDashboard() {
    let navigate = useNavigate();

    const routeChange = (path) => {
        navigate(path);
    };

    const token = localStorage.getItem('token');

    const [requests, setRequests] = useState([]);
    const [showRequests, setShowRequests] = useState(true);
    const [searchRequestTerm, setSearchRequestTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedUsername, setSelectedUsername] = useState('');

    const [users, setUsers] = useState([]);
    const [showUsers, setShowUsers] = useState(false);
    const [searchUserTerm, setSearchUserTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');

    const [activeTab, setActiveTab] = useState('requests'); 

    const [inventory, setInventory] = useState([]);
    const [showInventory, setShowInventory] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const fetchWithAuth = (url, options = {}) => {
            return fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    ...(options.headers || {})
                }
            });
        };
    
        const fetchInventory = async () => {
            try {
                const response = await fetchWithAuth('http://localhost:8081/api/inventory/viewInventory');
                if (!response.ok) throw new Error(`Failed. Status: ${response.status}`);
                const data = await response.json();
                setInventory(data);
                setShowInventory(true);
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Error fetching inventory.', 'error');
            }
        };

         const fetchRequests = () => {
                fetchWithAuth('http://localhost:8081/api/request/getRequests')
                    .then(res => res.json())
                    .then(data => setRequests(data))
                    .catch(err => Swal.fire('Error', 'Failed to fetch requests.', 'error'));
            };


    const fetchUsers = () => {
            fetchWithAuth('http://localhost:8081/api/user/getUsers')
                .then(res => res.json())
                .then(setUsers)
                .catch(err => Swal.fire('Error', 'Failed to fetch users.', 'error'));
        };
    

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'requests') {
            fetchRequests();
            setShowRequests(true);
            setShowUsers(false);
            setShowInventory(false);
        } else if (tab === 'users') {
            fetchUsers();
            setShowUsers(true);
            setShowRequests(false);
            setShowInventory(false);
        }
        else if(tab==='inventory')
        {
            fetchInventory();
            setShowInventory(true);
            setShowUsers(false);
            setShowRequests(false);
            
        }
    };
    

    const handleStatusUpdate = (reqId, newStatus) => {
        fetch('http://localhost:8081/updateRequestStatus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reqId, status: newStatus }),
        })
            .then((response) => response.json())
            .then((data) => {
            
                Swal.fire({
                    title: 'Success',
                    text: data.message,
                    icon: 'success',
                    confirmButtonText: 'OK',
                });
                setRequests((prevRequests) =>
                    prevRequests.map((request) =>
                        request.ReqID === reqId ? { ...request, Status: newStatus } : request
                    )
                );
            })
            .catch((error) => console.error('Error updating request status:', error));
    };

    const filteredRequests = requests.filter((request) => {
        const matchesSearchTerm = request.ItemName.toLowerCase().includes(searchRequestTerm.toLowerCase());
        const matchesStatus = selectedStatus ? request.Status === selectedStatus : true;
        const matchesUsername = selectedUsername ? request.Username === selectedUsername : true;
        const matchesItem = selectedItem ? request.ItemName === selectedItem : true;
        return matchesSearchTerm && matchesStatus && matchesUsername && matchesItem;
    });

    const filteredUsers = users.filter((user) => {
        const matchesSearchTerm = 
            user.Username.toLowerCase().includes(searchUserTerm.toLowerCase()) ||
            user.Email.toLowerCase().includes(searchUserTerm.toLowerCase());

        const matchesRole = selectedRole ? user.Rolename === selectedRole : true;
        const matchesDepartment = selectedDepartment
        ? (selectedDepartment === "N/A" ? !user.DepartmentName : user.DepartmentName === selectedDepartment)
        : true;

    return matchesSearchTerm && matchesRole && matchesDepartment;
    });

    const filteredInventory = inventory.filter(item => {
        const matchesUser = selectedItem? item.ItemName.toLowerCase().includes(selectedItem.toLowerCase()) : true;
        const matchesCategory = selectedCategory ? item.CategoryName.toLowerCase().includes(selectedCategory.toLowerCase()) : true;
        return matchesUser && matchesCategory && (item.ItemName.toLowerCase().includes(searchTerm.toLowerCase()) || item.CategoryName.toLowerCase().includes(searchTerm.toLowerCase()));
    });

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
                    <button className="login-button" onClick={() => routeChange('/login')}>Login</button>
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                    <button className="home-button" onClick={() =>routeChange('/home')}>Home</button>
                </div>
            </div>
            {/* Sidebar Menu */}
            <div className="dashboard">
            <div className="sidebar">
                <h2> Super Admin Panel </h2>
                <ul>
                    <li onClick={() => handleTabChange('requests')} className={activeTab === 'requests' ? 'active' : ''}>
                        View/Update Requests
                    </li>
                    <li onClick={() => handleTabChange('users')} className={activeTab === 'users' ? 'active' : ''}>
                        View Users
                    </li>
                    <li onClick={() => handleTabChange('inventory')} className={activeTab === 'inventory' ? 'active' : ''}>
                        View Inventory
                    </li>
                </ul>
            </div>

            {/* Main Content Area */}
            <div className="content">
               
                {/* Requests Table */}
                {showRequests && (
                    <div>
                        
                        <input
                                type="text"
                                className='search-input'
                                placeholder="Search by Item Name"
                                value={searchRequestTerm}
                                onChange={(e) => setSearchRequestTerm(e.target.value)}
                            />
                            <select
                                value={selectedUsername}
                                onChange={(e) => setSelectedUsername(e.target.value)}
                            >
                                <option value="">Select Username</option>
                                {[...new Set(requests.map((req) => req.Username))].map((username, index) => (
                                    <option key={index} value={username}>
                                        {username}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={selectedItem}
                                onChange={(e) => setSelectedItem(e.target.value)}
                            >
                                <option value="">Select Item Name</option>
                                {[...new Set(requests.map((req) => req.ItemName))].map((item, index) => (
                                    <option key={index} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="">Select Status</option>
                                {[...new Set(requests.map((req) => req.Status))].map((status, index) => (
                                    <option key={index} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                            <div className='table-container'>
                        <table >
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Item</th>
                                    <th>Quantity</th>
                                    <th>Feedback</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests
                                .sort((a,b)=>{
                                    if(a.Status==='Pending' && b.Status!=='Pending') return -1;
                                    if(b.Status==='Pending' && a.Status!=='Pending') return 1;
                                    return 0;
                                })
                                .map((request) => (
                                    <tr key={request.ReqID}>
                                        <td>{request.Username}</td>
                                        <td>{request.ItemName}</td>
                                        <td>{request.Quantity}</td>
                                        <td>{request.Feedback}</td>
                                        <td>{request.Status}</td>
                                        <td>
                                            {request.Status === 'Pending' ? (
                                                <>
                                                    <button onClick={() => handleStatusUpdate(request.ReqID, 'Approved')}>Approve</button>
                                                    <button onClick={() => handleStatusUpdate(request.ReqID, 'Disapproved')}>Reject</button>
                                                </>
                                            ) : (
                                                <span>{request.Status}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                )}

               
                {/* Users table */}
                {showUsers && (
                    <div>
                         <input
                                type="text"
                                className="search-input"
                                placeholder="Search by Username or Email"
                                value={searchUserTerm}
                                onChange={(e) => setSearchUserTerm(e.target.value)}
                            />
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                            >
                                <option value="">Select Role</option>
                                {[...new Set(users.map((user) => user.Rolename))].map((role, index) => (
                                    <option key={index} value={role}>{role}</option>
                                ))}
                            </select>
                            <select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                            >
                                <option value="">Select Department</option>
                                {[...new Set(users.map((user) => user.DepartmentName))].map((department, index) => (
                                    <option key={index} value={department}>{department}</option>
                                ))}
                            </select>
                    <div className='table-container'>
                        <table>
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Employee ID</th>
                                    <th>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.UserID}>
                                        <td>{user.Username}</td>
                                        <td>{user.Phone}</td>
                                        <td>{user.Email}</td>
                                        <td>{user.DepartmentName}</td>
                                        <td>{user.EmployeeID}</td>
                                        <td>{user.Rolename}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                )}
    
                {/* Inventory Table */}
                {showInventory && (
                    <div>
                        <input
                                type="text"
                                className="search-input"
                                placeholder="Search by Item or Category"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}>
                                <option value="">Select Item</option>
                                {[...new Set(inventory.map(item => item.ItemName))].map((name, index) => (
                                    <option key={index} value={name}>{name}</option>
                                ))}
                            </select>
                            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                                <option value="">Select Category</option>
                                {[...new Set(inventory.map(item => item.CategoryName))].map((cat, index) => (
                                    <option key={index} value={cat}>{cat}</option>
                                ))}
                            </select>
                        <div className='table-container'>
                        <table>
                            <thead>
                                <tr>
                                    <th>Item Name</th>
                                    <th>Category</th>
                                    <th>Item Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInventory.map((item) => (
                                    <tr key={item.ItemID}>
                                        <td>{item.ItemName}</td>
                                        <td>{item.CategoryName}</td>
                                        <td>{item.ItemCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </>
    );
}
