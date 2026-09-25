import React, { useEffect, useState } from 'react'
import "./Navbar.css"
import LogoutConfirmModal from './LogoutConfirmModal';
import { useAuth } from "../Context/AuthContext";
import { Link, useLocation } from 'react-router-dom';
import { FaChartBar, FaChartPie, FaClipboardList, FaMoneyBillWave, FaUserCircle, FaWallet, FaBars, FaTimes, FaChevronLeft, FaChevronRight, FaSignOutAlt } from 'react-icons/fa';

function Navbar() {
    const { logout, user } = useAuth();
    const location = useLocation();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        document.body.classList.toggle('sidebar-collapsed', isSidebarCollapsed);

        return () => document.body.classList.remove('sidebar-collapsed');
    }, [isSidebarCollapsed]);

    const logoutHandler = () => {
        setShowLogoutModal(true);
    }

    const confirmLogout = () => {
        setShowLogoutModal(false);
        logout();
    }

    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <>
            <aside className={`app-sidebar ${isSidebarOpen ? 'is-open' : ''} ${isSidebarCollapsed ? 'is-collapsed' : ''}`} aria-label="Application navigation">
                <div className="sidebar-brand-row">
                    <Link className="workspace-brand" to="/dashboard" onClick={closeSidebar}><span className="brand-mark"><FaWallet /></span><span className="sidebar-label">Ledger</span></Link>
                    <button className="sidebar-collapse-btn" onClick={() => setIsSidebarCollapsed((collapsed) => !collapsed)} aria-label={isSidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'} title={isSidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'} aria-expanded={!isSidebarCollapsed}>
                        {isSidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
                    </button>
                    <button className="sidebar-close-btn" onClick={closeSidebar} aria-label="Close navigation" title="Close navigation"><FaTimes /></button>
                </div>
                <p className="nav-section-label">Workspace</p>
                <nav className="workspace-nav" aria-label="Primary navigation">
                    <Link className={`workspace-nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} to="/dashboard" onClick={closeSidebar}><FaChartPie /><span className="sidebar-label">Overview</span></Link>
                    <Link className={`workspace-nav-link ${location.pathname === '/all-expenses' ? 'active' : ''}`} to="/all-expenses" onClick={closeSidebar}><FaClipboardList /><span className="sidebar-label">Expenses</span></Link>
                    <Link className={`workspace-nav-link ${location.pathname === '/all-incomes' ? 'active' : ''}`} to="/all-incomes" onClick={closeSidebar}><FaMoneyBillWave /><span className="sidebar-label">Income</span></Link>
                    <Link className={`workspace-nav-link ${location.pathname === '/budget' ? 'active' : ''}`} to="/budget" onClick={closeSidebar}><FaChartBar /><span className="sidebar-label">Budget</span></Link>
                    <Link className={`workspace-nav-link ${location.pathname === '/analytics' ? 'active' : ''}`} to="/analytics" onClick={closeSidebar}><FaChartPie /><span className="sidebar-label">Reports</span></Link>
                </nav>
                <div className="sidebar-bottom">
                    <Link className={`workspace-nav-link ${location.pathname === '/profile' ? 'active' : ''}`} to="/profile" onClick={closeSidebar}><FaUserCircle /><span className="sidebar-label">Profile</span></Link>
                    <button className="workspace-logout" onClick={logoutHandler}><FaSignOutAlt /><span className="sidebar-label">Sign out</span></button>
                </div>
            </aside>
                {isSidebarOpen && <button className="sidebar-backdrop" onClick={closeSidebar} aria-label="Close navigation" />}
            <header className="workspace-topbar">
                <div><p className="topbar-eyebrow">Personal finance</p><p className="topbar-title">{location.pathname === '/dashboard' ? 'Overview' : 'Workspace'}</p></div>
                <div className="topbar-actions">
                    <button className="sidebar-menu-btn" onClick={() => setIsSidebarOpen(true)} aria-label="Open navigation" title="Open navigation"><FaBars /></button>
                    <Link className="profile-chip" to="/profile"><span>{user?.username?.slice(0, 1).toUpperCase()}</span>{user?.username}</Link>
                </div>
            </header>

            {/* Logout Confirmation Modal */}
            <LogoutConfirmModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={confirmLogout}
            />
        </>

    )
}

export default Navbar