import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Icons
import { TbHomeEdit, TbCloudUpload } from "react-icons/tb";
import { LuCompass } from "react-icons/lu";

const BottomNav = ({ userRole = 'Engineer', homeRoute }) => { 
    const navigate = useNavigate();
    const location = useLocation();

    // --- CONFIGURATION BY ROLE ---
    // 1. Explore (Left) | 2. Home (Center/Float) | 3. Sync (Right)
    const navConfigs = {
        'Engineer': [
            { label: 'Explore', path: '/new-project', icon: LuCompass, position: 'side' },
            { label: 'Home', path: '/engineer-dashboard', icon: TbHomeEdit, position: 'center' }, 
            { label: 'Sync', path: '/outbox', icon: TbCloudUpload, position: 'side' }, 
        ],
        'School Head': [
            { label: 'Explore', path: '/school-forms', icon: LuCompass, position: 'side' },
            { label: 'Home', path: '/schoolhead-dashboard', icon: TbHomeEdit, position: 'center' },
            { label: 'Sync', path: '/outbox', icon: TbCloudUpload, position: 'side' },
        ],
        'Admin': [
            { label: 'Activity', path: '/activities', icon: LuCompass, position: 'side' }, // Replaced Explore with Activity for Admin context
            { label: 'Home', path: '/admin-dashboard', icon: TbHomeEdit, position: 'center' },
            { label: 'Sync', path: '/outbox', icon: TbCloudUpload, position: 'side' },
        ],
        'Human Resource': [
            { label: 'Activity', path: '/activities', icon: LuCompass, position: 'side' },
            { label: 'Home', path: '/hr-dashboard', icon: TbHomeEdit, position: 'center' },
            { label: 'Sync', path: '/outbox', icon: TbCloudUpload, position: 'side' },
        ]
    };

    // Fallback: Use Engineer config if role not found
    // If 'homeRoute' prop is passed (from Activity.jsx), we can attempt to infer, 
    // but usually relying on 'userRole' state or context is safer. 
    // Defaults to Engineer config here.
    const currentNavItems = navConfigs[userRole] || navConfigs['Engineer'];

    // --- RENDER HELPERS ---

    const renderIcon = (IconComponent, isActive) => (
        <IconComponent
            size={24}
            color={isActive ? '#094684' : '#B0B0B0'}
            style={styles.icon}
        />
    );

    // Split items for layout
    const leftItem = currentNavItems[0];
    const centerItem = currentNavItems[1];
    const rightItem = currentNavItems[2];

    return (
        <div style={styles.wrapper}>
            {/* Background Curve SVG */}
            <div style={styles.curveContainer}>
                <svg viewBox="0 0 375 70" preserveAspectRatio="none" style={styles.svg}>
                    <path 
                        d="M0,0 L137,0 C145,0 150,5 152,12 C157,35 180,45 187.5,45 C195,45 218,35 223,12 C225,5 230,0 238,0 L375,0 L375,70 L0,70 Z" 
                        fill="white" 
                        filter="drop-shadow(0px -5px 10px rgba(0,0,0,0.05))"
                    />
                </svg>
            </div>

            <div style={styles.navItems}>
                {/* 1. LEFT BUTTON (Explore) */}
                <button style={styles.sideButton} onClick={() => navigate(leftItem.path)}>
                    {renderIcon(leftItem.icon, location.pathname === leftItem.path)}
                    <span style={{ ...styles.label, color: location.pathname === leftItem.path ? '#094684' : '#B0B0B0' }}>
                        {leftItem.label}
                    </span>
                </button>

                {/* 2. CENTER BUTTON (Home - Floating) */}
                <div style={styles.centerButtonContainer}>
                    <button style={styles.floatingButton} onClick={() => navigate(centerItem.path)}>
                        <centerItem.icon size={30} color="#ffffffff" />
                    </button>
                </div>

                {/* 3. RIGHT BUTTON (Sync - Replaces Profile) */}
                <button style={styles.sideButton} onClick={() => navigate(rightItem.path)}>
                    {renderIcon(rightItem.icon, location.pathname === rightItem.path)}
                    <span style={{ ...styles.label, color: location.pathname === rightItem.path ? '#094684' : '#B0B0B0' }}>
                        {rightItem.label}
                    </span>
                </button>
            </div>
        </div>
    );
};

const styles = {
    wrapper: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '70px',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none', // Allows clicking through empty spaces
    },
    curveContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '70px',
        zIndex: 1,
        pointerEvents: 'none',
    },
    svg: {
        width: '100%',
        height: '100%',
        display: 'block',
    },
    navItems: {
        position: 'relative',
        zIndex: 2,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingBottom: '10px',
        pointerEvents: 'auto', // Re-enables clicking on buttons
    },
    sideButton: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        border: 'none',
        height: '100%',
        paddingTop: '15px',
        cursor: 'pointer',
    },
    centerButtonContainer: {
        width: '80px',
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
    },
    floatingButton: {
        position: 'absolute',
        top: '-55px', // Adjusted to sit perfectly in the SVG dip
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#0c4885', // DepEd Blue
        border: '4px solid #ffffff',
        boxShadow: '0 4px 10px rgba(20, 20, 20, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s',
    },
    icon: {
        marginBottom: '4px',
        transition: 'color 0.3s',
    },
    label: {
        fontSize: '10px',
        fontWeight: '600',
    }
};

export default BottomNav;