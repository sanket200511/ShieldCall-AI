import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, LayoutDashboard, Users, Smartphone, Settings, LogOut } from 'lucide-react';

export function Sidebar() {
    const menuItems = [
        { icon: LayoutDashboard, label: 'Mission Control', path: '/' },
        { icon: ShieldAlert, label: 'Live Threats', path: '/alerts' },
        { icon: Smartphone, label: 'Device Manager', path: '/devices' },
        { icon: Users, label: 'Community Intel', path: '/community' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="h-screen w-20 lg:w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/10 flex flex-col items-center lg:items-start py-8 transition-all duration-300 z-50">
            <div className="flex items-center gap-3 px-4 mb-10 w-full justify-center lg:justify-start">
                <div className="p-2 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                    <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <span className="hidden lg:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    ShieldCall
                </span>
            </div>

            <nav className="flex-1 w-full space-y-2 px-2">
                {menuItems.map((item, idx) => (
                    <NavLink
                        key={idx}
                        to={item.path}
                        className={({ isActive }) => `
              w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group
              ${isActive
                                ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }
            `}
                    >
                        <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="hidden lg:block font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 w-full">
                <NavLink to="/mobile-client" className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-green-400 bg-green-500/10 hover:bg-green-500/20 transition-colors border border-green-500/20 mb-2">
                    <Smartphone className="w-5 h-5" />
                    <span className="hidden lg:block font-medium">Open Mobile App</span>
                </NavLink>
                <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="hidden lg:block font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
}
