import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MobileClient from './pages/MobileClient';
import ReportPage from './pages/ReportPage';
import CommunityPage from './pages/CommunityPage';
import DeviceManager from './pages/DeviceManager';
import Settings from './pages/Settings';
import LiveThreats from './pages/LiveThreats';
import { Sidebar } from './components/Sidebar';

function Layout() {
    return (
        <div className="flex h-screen bg-slate-950 text-white overflow-hidden font-sans selection:bg-cyan-500/30">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/report" element={<ReportPage />} />
                    <Route path="/community" element={<CommunityPage />} />
                    <Route path="/devices" element={<DeviceManager />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/alerts" element={<LiveThreats />} />
                </Routes>
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                {/* Mobile Client has its own dedicated layout (full screen) */}
                <Route path="/mobile-client" element={<MobileClient />} />

                {/* Admin Dashboard Routes */}
                <Route path="/*" element={<Layout />} />
            </Routes>
        </Router>
    );
}

export default App;
