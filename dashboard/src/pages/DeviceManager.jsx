import React, { useState, useEffect } from 'react';
import { Smartphone, Battery, Signal, RefreshCw, Cpu } from 'lucide-react';

const DeviceManager = () => {
    const [devices, setDevices] = useState([]);

    const fetchDevices = () => {
        fetch('http://localhost:8000/devices')
            .then(res => res.json())
            .then(data => setDevices(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchDevices();
        const interval = setInterval(fetchDevices, 5000); // Auto-refresh
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                        Device Manager
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Real-time monitoring of connected mobile nodes.
                    </p>
                </div>
                <button
                    onClick={fetchDevices}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                >
                    <RefreshCw size={18} /> Refresh
                </button>
            </header>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-bold border-b border-slate-800">
                        <tr>
                            <th className="p-6">Device Name</th>
                            <th className="p-6">Status</th>
                            <th className="p-6">Battery</th>
                            <th className="p-6">Last Seen</th>
                            <th className="p-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {devices.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-12 text-center text-slate-500">
                                    <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    No devices connected. Open the specific mobile app to register.
                                </td>
                            </tr>
                        ) : (
                            devices.map((device, idx) => (
                                <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-6 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                            <Smartphone size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{device.name}</div>
                                            <div className="text-xs text-slate-500 font-mono">ID: {device.id?.substring(0, 8)}...</div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${device.status === 'ONLINE' ? 'bg-green-500 shadow-green-500/50' : 'bg-yellow-500 shadow-yellow-500/50'} shadow-lg`} />
                                            <span className={device.status === 'ONLINE' ? 'text-green-400' : 'text-yellow-400'}>
                                                {device.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-slate-300">
                                            <Battery size={18} className={device.battery < 20 ? 'text-red-400' : 'text-green-400'} />
                                            {device.battery}%
                                        </div>
                                    </td>
                                    <td className="p-6 text-slate-400 font-mono text-sm">
                                        {new Date(device.last_seen).toLocaleTimeString()}
                                    </td>
                                    <td className="p-6 text-right">
                                        <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                                            View Logs
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center gap-4">
                    <Cpu size={24} className="text-purple-400" />
                    <div>
                        <div className="text-2xl font-bold">{new Set(devices.map(d => d.id)).size}</div>
                        <div className="text-xs text-slate-500 uppercase">Unique CPUs</div>
                    </div>
                </div>
                {/* Logic for more widgets can go here */}
            </div>
        </div>
    );
};

export default DeviceManager;
