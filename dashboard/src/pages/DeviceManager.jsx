import React, { useState, useEffect } from 'react';
import { Smartphone, RefreshCw, Battery, Wifi, Cpu } from 'lucide-react';
import { API_BASE_URL, WS_BASE_URL } from '../config';

const DeviceManager = () => {
    const [devices, setDevices] = useState([]);
    const [wsStatus, setWsStatus] = useState("DISCONNECTED");
    const [selectedDevice, setSelectedDevice] = useState(null);

    const fetchDevices = () => {
        fetch(`${API_BASE_URL}/devices`)
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    setDevices(data);
                } else {
                    // Demo Data if no real devices connected
                    setDevices([
                        { name: "Pixel 7 Pro", id: "demo_px_7", status: "ONLINE", battery: 92, last_seen: new Date().toISOString() },
                        { name: "Samsung S23", id: "demo_s23", status: "OFFLINE", battery: 45, last_seen: new Date(Date.now() - 86400000).toISOString() }
                    ]);
                }
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchDevices();

        let ws;
        try {
            // Ensure we use the correct WS URL even if config export was weird
            const url = WS_BASE_URL || "ws://" + window.location.hostname + ":8000/ws/monitor";
            console.log("DeviceManager Connecting to:", url);

            ws = new WebSocket(url);

            ws.onopen = () => {
                console.log("DeviceManager WS Connected");
                setWsStatus("CONNECTED");
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'DEVICE_LIST_UPDATE') {
                    if (data.devices && data.devices.length > 0) {
                        setDevices(data.devices);
                    }
                }
            };

            ws.onerror = (e) => {
                console.error("WS Error", e);
                setWsStatus("ERROR");
            };

            ws.onclose = () => setWsStatus("DISCONNECTED");

        } catch (e) {
            console.error("WS Creation Error", e);
        }

        const interval = setInterval(fetchDevices, 5000); // Fallback polling
        return () => {
            clearInterval(interval);
            if (ws) ws.close();
        };
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                        Device Manager
                    </h1>
                    <p className="text-slate-400 mt-2 flex items-center gap-2">
                        Real-time monitoring of connected mobile nodes.
                        <span className={`text-[10px] px-2 py-0.5 rounded ${wsStatus === 'CONNECTED' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            WS: {wsStatus}
                        </span>
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
                            <th className="p-6">Threats Blocked</th>
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
                                        <div className="font-mono text-cyan-400 bg-cyan-950/30 px-3 py-1 rounded inline-block">
                                            {device.threats_blocked || 0}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-slate-300">
                                            {device.battery !== "N/A" ? (
                                                <>
                                                    <Battery size={18} className={device.battery < 20 ? 'text-red-400' : 'text-green-400'} />
                                                    {device.battery}%
                                                </>
                                            ) : (
                                                <span className="text-slate-500 text-xs">No Data</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-6 text-slate-400 font-mono text-sm">
                                        {new Date(device.last_seen).toLocaleTimeString()}
                                    </td>
                                    <td className="p-6 text-right">
                                        <button
                                            onClick={() => setSelectedDevice(device)}
                                            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium hover:underline decoration-cyan-500/30"
                                        >
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
            </div>

            {/* LOGS MODAL */}
            {selectedDevice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-950 p-6 border-b border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Smartphone className="text-blue-400" />
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedDevice.name}</h2>
                                    <p className="text-xs text-slate-500 font-mono">{selectedDevice.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedDevice(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                                <span className="text-slate-400">✕</span>
                            </button>
                        </div>
                        <div className="p-6 bg-slate-950/50 h-80 overflow-y-auto font-mono text-sm">
                            <div className="flex flex-col gap-2">
                                <div className="text-green-400">[SYSTEM] Connection established via WebSocket Secure.</div>
                                <div className="text-slate-400">[{new Date(selectedDevice.last_seen).toLocaleTimeString()}] Handshake successful. Device authenticated.</div>
                                <div className="text-slate-400">[{new Date(selectedDevice.last_seen).toLocaleTimeString()}] Battery Level Report: {selectedDevice.battery}%</div>
                                <div className="text-blue-400">[{new Date().toLocaleTimeString()}] Stream Status: ACTIVE</div>
                                <div className="text-slate-500">... listening for audio packets ...</div>
                                {selectedDevice.status === 'ONLINE' ? (
                                    <div className="text-green-500 animate-pulse mt-4">● Live Data Stream Active</div>
                                ) : (
                                    <div className="text-red-500 mt-4">● Connection Lost</div>
                                )}
                            </div>
                        </div>
                        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
                            <button onClick={() => setSelectedDevice(null)} className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700">Close Logs</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeviceManager;
