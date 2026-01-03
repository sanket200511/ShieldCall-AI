import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MobileClient from './pages/MobileClient';
import { Sidebar } from './components/Sidebar';

// Placeholder Pages for completeness
const Placeholder = ({ title }) => (
    <div className="flex-1 p-8 text-white flex flex-col items-center justify-center bg-slate-950">
        <h1 className="text-4xl font-bold text-slate-700">{title}</h1>
        <p className="text-slate-500 mt-2">Implementation pending in Phase 3</p>
    </div>
);

function Layout() {
    return (
        <div className="flex h-screen bg-slate-950 text-white overflow-hidden font-sans selection:bg-cyan-500/30">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/alerts" element={<Placeholder title="Live Threat Matrix" />} />
                    <Route path="/devices" element={<Placeholder title="Device Management" />} />
                    <Route path="/community" element={<Placeholder title="Community Intel" />} />
                    <Route path="/settings" element={<Placeholder title="System Settings" />} />
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
