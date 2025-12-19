import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Icons
import { TbHomeEdit } from "react-icons/tb";
import { LuActivity, LuUser, LuCompass, LuSettings, LuUsers } from "react-icons/lu";

const BottomNav = ({ userRole = 'Engineer' }) => { // Default to Engineer if no role passed
    const navigate = useNavigate();
    const location = useLocation();

    // --- CONFIGURATION BY ROLE ---
    // Define the menu structure for each role here
    const navConfigs = {
        'Engineer': [
            { label: 'Explore', path: '/new-project', icon: LuCompass, position: 'side' },
            { label: 'Home', path: '/engineer-dashboard', icon: TbHomeEdit, position: 'center' }, // Center = Floating
            { label: 'Settings', path: '/profile', icon: LuUser, position: 'side' }, // Mapped to Profile as requested
        ],
        'School Head': [
            { label: 'Explore', path: '/school-forms', icon: LuCompass, position: 'side' },
            { label: 'Home', path: '/schoolhead-dashboard', icon: TbHomeEdit, position: 'center' },
            { label: 'Settings', path: '/profile', icon: LuUser, position: 'side' },
        ],
        'Admin': [
            { label: 'Home', path: '/admin-dashboard', icon: TbHomeEdit },
            { label: 'Activity', path: '/activities', icon: LuActivity },
            { label: 'Accounts', path: '/accounts', icon: LuUsers },
            { label: 'Settings', path: '/profile', icon: LuSettings },
        ],
        'Human Resource': [
             // Assuming HR is similar to Admin, or define custom here
            { label: 'Home', path: '/hr-dashboard', icon: TbHomeEdit },
            { label: 'Activity', path: '/activities', icon: LuActivity },
            { label: 'Employees', path: '/employees', icon: LuUsers },
            { label: 'Profile', path: '/profile', icon: LuUser },
        ]
    };

    // Fallback to Engineer if role doesn't match
    const currentNavItems = navConfigs[userRole] || navConfigs['Engineer'];

    // Determine Layout Mode: Use "Curved" only if we have exactly 3 items with a center button
    const isCurvedLayout = currentNavItems.length === 3 && currentNavItems.some(i => i.position === 'center');

    // --- RENDER HELPERS ---

    const renderIcon = (IconComponent, path, isActive) => (
        <IconComponent
            size={24}
            color={isActive ? '#094684' : '#B0B0B0'}
            style={styles.icon}
        />
    );

    // --- LAYOUT 1: CURVED (Original Design for 3 Items) ---
    const renderCurvedLayout = () => {
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
                    {/* Left Button */}
                    <button style={styles.sideButton} onClick={() => navigate(leftItem.path)}>
                        {renderIcon(leftItem.icon, leftItem.path, location.pathname === leftItem.path)}
                        <span style={{ ...styles.label, color: location.pathname === leftItem.path ? '#094684' : '#B0B0B0' }}>
                            {leftItem.label}
                        </span>
                    </button>

                    {/* Center Floating Button */}
                    <div style={styles.centerButtonContainer}>
                        <button style={styles.floatingButton} onClick={() => navigate(centerItem.path)}>
                            <centerItem.icon size={30} color="#ffffffff" />
                        </button>
                    </div>

                    {/* Right Button */}
                    <button style={styles.sideButton} onClick={() => navigate(rightItem.path)}>
                        {renderIcon(rightItem.icon, rightItem.path, location.pathname === rightItem.path)}
                        <span style={{ ...styles.label, color: location.pathname === rightItem.path ? '#094684' : '#B0B0B0' }}>
                            {rightItem.label}
                        </span>
                    </button>
                </div>
            </div>
        );
    };

    // --- LAYOUT 2: FLAT (For Admin/HR - 4+ Items) ---
    const renderFlatLayout = () => (
        <div style={styles.flatWrapper}>
            {currentNavItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                    <button 
                        key={index} 
                        style={styles.flatButton} 
                        onClick={() => navigate(item.path)}
                    >
                        <item.icon 
                            size={24} 
                            color={isActive ? '#094684' : '#B0B0B0'} 
                            style={styles.icon}
                        />
                        <span style={{ ...styles.label, color: isActive ? '#094684' : '#B0B0B0' }}>
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );

    return isCurvedLayout ? renderCurvedLayout() : renderFlatLayout();
};

const styles = {
    // --- CURVED LAYOUT STYLES ---
    wrapper: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '70px',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
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
        pointerEvents: 'auto',
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
        top: '-55px', // Adjusted slightly to fit new config
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#0c4885', 
        border: '4px solid #ffffff',
        boxShadow: '0 4px 10px rgba(20, 20, 20, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s',
    },
    
    // --- FLAT LAYOUT STYLES (For Admin) ---
    flatWrapper: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '70px',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'white',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        borderTopLeftRadius: '15px',
        borderTopRightRadius: '15px',
    },
    flatButton: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        height: '100%',
    },

    // --- SHARED STYLES ---
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