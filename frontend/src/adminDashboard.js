import React, { useState, useEffect } from 'react';
import './navbar.css';
import './views.css'
import './Dashboard.css';
import { Navigate, useNavigate } from 'react-router-dom';
import bvp from './bvp logo.png';
import Swal from 'sweetalert2';


export default function AdminDashboard() {
    
        let navigate = useNavigate();
    
        const routeChange = (path) => {
            navigate(path);
        };
     const token = localStorage.getItem('token');
   
    const [selectedCategory, setSelectedCategory] = useState(''); // To store selected category
    const [itemName, setItemName] = useState(''); // To store new item name
    const [itemCount, setItemCount] = useState(1); // To store item count
    const [showForm, setShowForm] = useState(true); // To control form visibility
    const [activeTab, setActiveTab] = useState('addItem'); // State to control the active tab

    // New state for handling requests
    const [requests, setRequests] = useState([]);
    const [showRequests, setShowRequests] = useState(false);
    const [searchRequestTerm, setSearchRequestTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedUsername, setSelectedUsername] = useState('');

    // State for handling users
    const [users, setUsers] = useState([]);
    const [showUsers, setShowUsers] = useState(false);

    const [searchUserTerm, setSearchUserTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    //ADD NEW CATEGORY STATES
    const [categories, setCategories] = useState([]); // Existing categories for the dropdown
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryDescription, setNewCategoryDescription] = useState('');
    const [isSubCategory, setIsSubCategory] = useState(false); // Checkbox state
    const [parentCategoryID, setParentCategoryID] = useState(null); // Parent category ID
    const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);

    const [inventory, setInventory] = useState([]);
    const [showInventory, setShowInventory] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState('');

    const [showResolvedRequests, setShowResolvedRequests] = useState(false);
    const [showReturns, setShowReturns] = useState(false);


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

    const fetchCategories = () => {
        fetchWithAuth('http://localhost:8081/api/category/categories')
            .then(res => res.json())
            .then(setCategories)
            .catch(err => console.error('Error fetching categories:', err));
    };

    useEffect(() => { fetchCategories(); }, []);

    const fetchRequests = () => {
        fetchWithAuth('http://localhost:8081/api/request/getRequests')
            .then(res => res.json())
            .then(data => setRequests(data.filter(r => r.Status === 'Pending')))
            .catch(err => Swal.fire('Error', 'Failed to fetch requests.', 'error'));
    };

    const fetchResolvedRequests = () => {
        fetchWithAuth('http://localhost:8081/api/request/getRequests')
            .then(res => res.json())
            .then(data => setRequests(data.filter(r => r.Status !== 'Pending' && r.Status !== 'Returned')))
            .catch(err => Swal.fire('Error', 'Failed to fetch resolved requests.', 'error'));
    };

    const fetchReturns = () => {
        fetchWithAuth('http://localhost:8081/api/return/getReturnRequests')
            .then(res => res.json())
            .then(data => setRequests(data.filter(r => r.Status === 'Returned')))
            .catch(err => Swal.fire('Error', 'Failed to fetch return requests.', 'error'));
    };

    const fetchUsers = () => {
        fetchWithAuth('http://localhost:8081/api/user/getUsers')
            .then(res => res.json())
            .then(setUsers)
            .catch(err => Swal.fire('Error', 'Failed to fetch users.', 'error'));
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setShowForm(tab === 'addItem');
        setShowRequests(tab === 'requests');
        setShowUsers(tab === 'users');
        setShowInventory(tab === 'inventory');
        setShowResolvedRequests(tab === 'resolvedRequests');
        setShowReturns(tab === 'returns');
        setIsAddingNewCategory(tab === 'addCategory');

        if (tab === 'requests') fetchRequests();
        if (tab === 'users') fetchUsers();
        if (tab === 'inventory') fetchInventory();
        if (tab === 'resolvedRequests') fetchResolvedRequests();
        if (tab === 'returns') fetchReturns();
    };

    const handleAddCategory = () => {
        fetchWithAuth('http://localhost:8081/api/category/addCategory', {
            method: 'POST',
            body: JSON.stringify({
                categoryName: newCategoryName,
                description: newCategoryDescription,
                parentCategoryID: isSubCategory ? parentCategoryID : null,
            })
        })
        .then(res => res.json())
        .then(data => {
            Swal.fire('Success', 'Category added.', 'success');
            setCategories([...categories, { CategoryID: data.CategoryID, CategoryName: newCategoryName }]);
            setNewCategoryName('');
            setNewCategoryDescription('');
            setIsSubCategory(false);
            setParentCategoryID(null);
        })
        .catch(err => Swal.fire('Error', `Failed to add category.`, 'error'));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchWithAuth('http://localhost:8081/api/inventory/addItem', {
            method: 'POST',
            body: JSON.stringify({ itemName, itemCount, categoryId: selectedCategory })
        })
        .then(res => res.json())
        .then(() => {
            Swal.fire('Success', 'Item added!', 'success');
            setItemName('');
            setItemCount(1);
        })
        .catch(err => Swal.fire('Error', err.message, 'error'));
    };

    const updateRequestStatus = (reqId, newStatus, comment = '') => {
        fetchWithAuth('http://localhost:8081/api/request/updateRequestStatus', {
            method: 'POST',
            body: JSON.stringify({ reqId, status: newStatus, comment })
        })
        .then(res => res.json())
        .then(data => {
            Swal.fire('Success', data.message, 'success');
            setRequests(prev => prev.map(r => r.ReqID === reqId ? { ...r, Status: newStatus, Remark: comment } : r));
        })
        .catch(err => Swal.fire('Error', 'Failed to update request.', 'error'));
    };

    const decrementItemCount = (itemName, quantity, callback) => {
        fetchWithAuth('http://localhost:8081/api/inventory/decrementItemCount', {
            method: 'POST',
            body: JSON.stringify({ itemName, quantity })
        })
        .then(res => res.json())
        .then(data => {
            Swal.fire('Success', data.message, 'success');
            callback?.();
        })
        .catch(err => Swal.fire('Error', 'Failed to decrement item.', 'error'));
    };

    const incrementItemCount = (reqId, itemName, quantity) => {
        fetchWithAuth('http://localhost:8081/api/inventory/incrementItemCount', {
            method: 'POST',
            body: JSON.stringify({ reqId, itemName, quantity })
        })
        .then(res => res.json())
        .then(data => Swal.fire('Success', data.message, 'success'))
        .catch(err => Swal.fire('Error', 'Failed to increment item.', 'error'));
    };
     const handleStatusUpdate = (reqId, newStatus, itemName, quantity) => {
        if (newStatus === 'Disapproved') {
            Swal.fire({
                title: 'Enter remark for rejection',
                input: 'text',
                inputPlaceholder: 'Enter remark...',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                preConfirm: (remark) => {
                    if (!remark) {
                        Swal.showValidationMessage('Remark is required for rejection.');
                    }
                    return remark;
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    const remark = result.value;
                    updateRequestStatus(reqId, newStatus, remark);
                }
            });
        } else if (newStatus === 'Approved') {
            decrementItemCount(itemName, quantity, () => {
                updateRequestStatus(reqId, newStatus);
            });
        } else {
            updateRequestStatus(reqId, newStatus);
        }
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
    const matchesDepartment = selectedDepartment ? user.DepartmentName === selectedDepartment : true;

    return matchesSearchTerm && matchesRole && matchesDepartment;
});
   
    const handleLogout = () => {
    localStorage.removeItem('token');
    Swal.fire('Logged out', 'You have been successfully logged out', 'success').then(() => {
        navigate('/login');
    });
};


   const filteredInventory = inventory.filter(item => {
        const matchesUser = selectedItem? item.ItemName.toLowerCase().includes(selectedItem.toLowerCase()) : true;
        const matchesCategory = selectedCategory ? item.CategoryName.toLowerCase().includes(selectedCategory.toLowerCase()) : true;
        return matchesUser && matchesCategory && (item.ItemName.toLowerCase().includes(searchTerm.toLowerCase()) || item.CategoryName.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    return (
        <>
       
            <div className="navbar">
                <img src={bvp} alt="BVP Logo" className="logo" />
                <div className="buttons-container">
                    <button className="login-button" onClick={() => routeChange('/login')}>Login</button>
                     <button className="logout-button" onClick={handleLogout}>Logout</button>
                    <button className="home-button" onClick={() => routeChange('/home')}>Home</button>
                </div>
            </div>
            <div className='dashboard'>
            <div className='sidebar'>
                <h2> Admin Panel </h2>
                <ul>
                    <li onClick={() => handleTabChange('addCategory')} className={activeTab === 'addCategory' ? 'active' : ''}>
                        Add a Category
                    </li>
                    <li onClick={() => handleTabChange('addItem')} className={activeTab === 'addItem' ? 'active' : ''}>
                        Add an Item
                    </li>
                    <li onClick={() => handleTabChange('requests')} className={activeTab === 'requests' ? 'active' : ''}>
                        Update Requests
                    </li>
                    
                    <li onClick={() => handleTabChange('users')} className={activeTab === 'users' ? 'active' : ''}>
                        View Users
                    </li>
                    <li onClick={() => handleTabChange('inventory')} className={activeTab === 'inventory' ? 'active' : ''}>
                        View Inventory
                    </li>
                    <li onClick={() => handleTabChange('returns')} className={activeTab === 'returns' ? 'active' : ''}>
                        View Returns
                    </li>
                    <li onClick={() => handleTabChange('resolvedRequests')} className={activeTab === 'resolvedRequests' ? 'active' : ''}>
                        View Resolved Requests
                    </li>
                </ul>
            </div>
            <div className='content'>
            {isAddingNewCategory && (
    <form onSubmit={(e) => { e.preventDefault(); handleAddCategory(); }}>
        <div className='form-container'>
            <div className='form'>
                <input
                    type='text'
                    placeholder='Category Name'
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    required
                />
                <input
                    type='text'
                    placeholder='Category Description'
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                />
                <div>
                <label>Is Subcategory?</label>
                    <input
                        type='checkbox'
                        checked={isSubCategory}
                        onChange={() => setIsSubCategory(!isSubCategory)}
                    />
                    
                </div>
                {isSubCategory && (
                    <select
                        value={parentCategoryID}
                        onChange={(e) => setParentCategoryID(e.target.value)}
                        required
                    >
                        <option value=''>Select Parent Category</option>
                        {categories.map(cat => (
                            <option key={cat.CategoryID} value={cat.CategoryID}>
                                {cat.CategoryName}
                            </option>
                        ))}
                    </select>
                )}
                <button type="submit">Add Category</button>
                <button type="button" onClick={() => setIsAddingNewCategory(false)}>Cancel</button>
            </div>
        </div>
    </form>
)}

                {/* Form to add new item */}
                {showForm && (
                    <form onSubmit={handleSubmit}>
                        <div className='form-container'>
                            <div className='form'>
                                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                                    <option value="" disabled>Select Category</option>
                                    {categories.map(category => (
                                        <option key={category.CategoryID} value={category.CategoryID}>{category.CategoryName}</option>
                                    ))}
                                </select>
                            
                            <div className='form'>
                                <input
                                    type='text'
                                    placeholder='Item Name'
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                />
                            </div>
                            <div className='form'>
                                <input
                                    type='number'
                                    placeholder='Quantity'
                                    value={itemCount}
                                    onChange={(e) => setItemCount(e.target.value)}
                                />
                            </div>
                            <button type="submit">Add Item</button>
                            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </div>
                    </form>
                )}
    
                {/* Display the PENDING requests table */}
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
                            <table>
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
                                    {filteredRequests.map((request) => (
                                        <tr key={request.ReqID}>
                                            <td>{request.Username}</td>
                                            <td>{request.ItemName}</td>
                                            <td>{request.Quantity}</td>
                                            <td>{request.Feedback}</td>
                                            <td>{request.Status}</td>
                                            <td>
                                                {request.Status === 'Pending' ? (
                                                    <div>
                                                        <button  className='approve-button' onClick={() => handleStatusUpdate(request.ReqID, 'Approved', request.ItemName, request.Quantity)}>
                                                            Approve
                                                        </button>
                                                        <button className='reject-button' onClick={() => handleStatusUpdate(request.ReqID, 'Disapproved', request.ItemName, request.Quantity)}>
                                                            Reject
                                                        </button>
                                                    </div>
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
                {showResolvedRequests && (
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
            <option value="Approved">Approved</option>
            <option value="Disapproved">Disapproved</option>
        </select>
        <div className='table-container'>
            <table>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Status</th>
                        <th>Feedback</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredRequests.map((request) => (
                        <tr key={request.ReqID}>
                            <td>{request.Username}</td>
                            <td>{request.ItemName}</td>
                            <td>{request.Quantity}</td>
                            <td>{request.Status}</td>
                            <td>{request.Feedback || 'N/A'}</td>
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

{showReturns && (
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
        {filteredRequests.length === 0 ? (
            <p>No return requests found.</p>
        ) :
        <div className='table-container'>
            <table>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Item</th>
                        <th>Returned Quantity</th>
                        <th>Status</th>
                        <th>Comment</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
    {filteredRequests.map((request) => (
        <tr key={request.ReqID}>
            <td>{request.Username}</td>
            <td>{request.ItemName}</td>
            <td>{request.ReturnedQuantity || 'N/A'}</td> {/* Show the returned quantity */}
            <td>{request.Status}</td>
            <td>{request.Feedback || 'N/A'}</td>
            <td>
                <button className='action-button' onClick={() => incrementItemCount(request.ReqID, request.ItemName, request.ReturnedQuantity)}>
                    Acknowledge Return
                </button>
            </td>
        </tr>
    ))}
</tbody>

            </table>
        </div>
}
    </div>
)}
            </div>
        </div>
        </>
    );
}    