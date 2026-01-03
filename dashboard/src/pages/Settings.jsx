import React, { useState } from 'react';
import { User, Bell, Shield, Eye, Save, Plus } from 'lucide-react';
import { storage } from '../utils/storage';

export default function Settings() {
    const [elderlyMode, setElderlyMode] = useState(storage.get('elderly_mode', false));
    const [notifications, setNotifications] = useState(true);

    const toggleElderly = () => {
        const newState = !elderlyMode;
        setElderlyMode(newState);
        storage.set('elderly_mode', newState);
        // In a real app, this would trigger a global context update to increase font sizes
        if (newState) {
            document.body.style.fontSize = '120%';
        } else {
            document.body.style.fontSize = '100%';
        }
    };

    return (
        <div className="p-8 h-full overflow-y-auto">
            <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-400">
                System Preferences
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Accessibility Section */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                            <Eye size={24} />
                        </div>
                        <h2 className="text-xl font-bold">Accessibility</h2>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                        <div>
                            <div className="font-bold text-lg">Elderly Mode</div>
                            <div className="text-sm text-slate-400">Increases contrast and button sizes.</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={elderlyMode}
                                onChange={toggleElderly}
                            />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>
                </div>

                {/* Trusted Contacts */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                            <Shield size={24} />
                        </div>
                        <h2 className="text-xl font-bold">Trusted Contacts</h2>
                    </div>

                    <div className="space-y-3">
                        {['Son (Rahul)', 'Daughter (Priya)'].map((contact, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <span className="font-medium">{contact}</span>
                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Verified</span>
                            </div>
                        ))}
                        <button className="w-full py-3 border border-dashed border-white/20 rounded-lg text-slate-400 hover:bg-white/5 flex items-center justify-center gap-2">
                            <Plus size={16} /> Add Contact
                        </button>
                    </div>
                </div>

                {/* Account Info */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                            <User size={24} />
                        </div>
                        <h2 className="text-xl font-bold">Profile</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-slate-400 uppercase">Username</label>
                            <input type="text" value="SuperAdmin" readOnly className="w-full bg-black/20 border border-white/10 rounded-lg p-2 mt-1 text-slate-300" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 uppercase">Region</label>
                            <input type="text" value="India (IN)" readOnly className="w-full bg-black/20 border border-white/10 rounded-lg p-2 mt-1 text-slate-300" />
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
                            <Bell size={24} />
                        </div>
                        <h2 className="text-xl font-bold">Alert Config</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-300">Push Notifications</span>
                            <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} className="accent-yellow-500 w-4 h-4" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-300">Email Reports</span>
                            <input type="checkbox" checked className="accent-yellow-500 w-4 h-4" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-300">SMS Alerts to Trusted</span>
                            <input type="checkbox" checked className="accent-yellow-500 w-4 h-4" />
                        </div>
                    </div>
                </div>

            </div>

            <div className="mt-8 flex justify-end">
                <button className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all">
                    <Save size={18} /> Save Changes
                </button>
            </div>
        </div>
    );
}
