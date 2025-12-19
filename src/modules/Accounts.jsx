import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';
import PageTransition from '../components/PageTransition'; 
import { LuSearch, LuShield, LuShieldAlert, LuUserCheck, LuUserX } from "react-icons/lu";

const Accounts = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState(null);

    // --- FETCH USERS FROM BACKEND ---
    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                console.error("Failed to fetch users");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // --- TOGGLE ACCOUNT STATUS ---
    const handleToggleStatus = async (uid, currentStatus) => {
        if(!window.confirm(`Are you sure you want to ${currentStatus ? 'DISABLE' : 'ENABLE'} this user?`)) return;

        setProcessingId(uid);
        try {
            const response = await fetch(`http://localhost:3000/api/admin/users/${uid}/toggle`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ disabled: !currentStatus }) // Flip the status
            });

            if (response.ok) {
                // Update local state to reflect change immediately
                setUsers(users.map(user => 
                    user.uid === uid ? { ...user, disabled: !currentStatus } : user
                ));
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Server error");
        } finally {
            setProcessingId(null);
        }
    };

    // --- FILTERING ---
    const filteredUsers = users.filter(user => 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <PageTransition>
            <div className="min-h-screen bg-slate-50 font-sans pb-24 relative">
                
                {/* HEADER */}
                <div className="bg-white px-6 pt-12 pb-6 rounded-b-[2rem] shadow-sm relative z-10">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Account Management</h1>
                            <p className="text-xs text-slate-400 mt-1">Manage user access and roles</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-[#004A99]">
                            <LuShield size={20} />
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <LuSearch className="absolute left-3 top-3 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by email or name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                        />
                    </div>
                </div>

                {/* USER LIST */}
                <div className="px-5 mt-6 space-y-3">
                    {loading ? (
                        <p className="text-center text-slate-400 text-sm py-10">Loading accounts...</p>
                    ) : filteredUsers.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm py-10">No users found.</p>
                    ) : (
                        filteredUsers.map((user) => (
                            <div key={user.uid} className={`bg-white p-4 rounded-xl border transition-all ${user.disabled ? 'border-red-100 opacity-75' : 'border-slate-100'}`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        {/* Avatar / Icon */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${user.disabled ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}>
                                            {user.disabled ? <LuUserX size={18} /> : <LuUserCheck size={18} />}
                                        </div>
                                        
                                        {/* Info */}
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-700">
                                                {user.displayName || "No Name"}
                                            </h3>
                                            <p className="text-xs text-slate-400">{user.email}</p>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block ${user.customClaims?.role ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                                                {user.customClaims?.role || "User"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button 
                                        onClick={() => handleToggleStatus(user.uid, user.disabled)}
                                        disabled={processingId === user.uid}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                            user.disabled 
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                                        }`}
                                    >
                                        {processingId === user.uid ? '...' : user.disabled ? 'Enable' : 'Disable'}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* ADMIN NAV */}
                <BottomNav userRole="Admin" />
            </div>
        </PageTransition>
    );
};

export default Accounts;