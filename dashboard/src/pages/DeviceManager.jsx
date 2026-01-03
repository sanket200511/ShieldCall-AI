import React, { useState, useEffect } from 'react';
import { Smartphone, Radio, Battery, Shield, Wifi } from 'lucide-react';
import { WS_URL } from '../config';

export default function DeviceManager() {
    const [devices, setDevices] = useState([]);

    useEffect(() => {
        // We listen to the same WS as Dashboard, catching 'DEVICE_LIST_UPDATE'
        const ws = new WebSocket(WS_URL);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'DEVICE_LIST_UPDATE') {
                setDevices(data.devices);
            }
        };

        return () => ws.close();
    }, []);

    return (
        <div className="p-8 h-full">
            <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-400">
                Connected Sentinels
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {devices.length === 0 ? (
                    <div className="col-span-3 text-center p-12 text-slate-500 bg-slate-900/50 rounded-2xl border border-dashed border-white/10">
                        <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold">No Devices Online</h3>
                        <p>Open <code className="text-cyan-400">/mobile-client</code> on a phone to pair automatically.</p>
                    </div>
                ) : (
                    devices.map((device, i) => (
                        <div key={i} className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                            <div className="absolute top-0 right-0 p-4">
                                <div className="flex items-center gap-2 text-green-400 text-xs font-bold px-2 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                                    <Radio size={12} className="animate-pulse" /> {device.status}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400">
                                    <Smartphone size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">{device.name}</h3>
                                    <p className="text-xs text-slate-400">ID: {device.id}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Battery</span>
                                    <span className="text-white flex items-center gap-2">
                                        <Battery size={14} /> {device.battery}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Connection</span>
                                    <span className="text-white flex items-center gap-2">
                                        <Wifi size={14} /> WiFi-5G
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Last Heartbeat</span>
                                    <span className="text-white">Live</span>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-between items-center pt-4 border-t border-white/5">
                                <span className="text-xs text-slate-500">Protection Active</span>
                                <Shield size={16} className="text-cyan-400" />
                            </div>
                        </div>
                    ))
                )}

                {/* Always show the 'Add Device' hint */}
                <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-500 hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer min-h-[250px]">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">+</span>
                    </div>
                    <p>Pair New Device</p>
                    <span className="text-xs text-slate-600 mt-2">Just open the app URL</span>
                </div>

            </div>
        </div>
    );
}
