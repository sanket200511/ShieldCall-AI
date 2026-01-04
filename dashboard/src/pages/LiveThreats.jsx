```javascript
import React, { useState, useEffect } from 'react';
import { LiveFeed } from '../components/LiveFeed';
import { Shield, AlertOctagon, Terminal } from 'lucide-react';
import { WS_BASE_URL } from '../config';

const LiveThreats = () => {
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState({ active: 0, critical: 0 });

    useEffect(() => {
        // Shared WebSocket connection for real-time updates
        const ws = new WebSocket(WS_BASE_URL);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'NEW_THREAT') {
                const newAlert = {
                    id: Date.now(),
                    phone: data.phone,
                    scam_type: data.scam_type,
                    risk_score: data.risk_score,
                    transcript_snippet: data.transcript_snippet,
                    timestamp: new Date().toISOString()
                };
                setAlerts(prev => [newAlert, ...prev].slice(0, 50));
                if (data.risk_score > 80) setStats(s => ({ ...s, critical: s.critical + 1 }));
            }
            if (data.type === 'DEVICE_LIST_UPDATE') {
                setStats(s => ({ ...s, active: data.devices.length }));
            }
        };

        return () => ws.close();
    }, []);

    return (
        <div className="flex flex-col h-full p-6 gap-6">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                        Live Threat Matrix
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Real-time visualization of intercepted fraud attempts.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg text-center flex items-center gap-3">
                        <Activity className="text-blue-400" size={20} />
                        <div>
                            <div className="text-xl font-bold text-white leading-none">{stats.active}</div>
                            <div className="text-[10px] text-slate-500 uppercase font-bold">Active Nodes</div>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg text-center flex items-center gap-3">
                        <ShieldAlert className="text-red-500" size={20} />
                        <div>
                            <div className="text-xl font-bold text-white leading-none">{stats.critical}</div>
                            <div className="text-[10px] text-slate-500 uppercase font-bold">Critical Threats</div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 min-h-0 bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden relative">
                {/* Reusing LiveFeed component but in full container */}
                <div className="absolute inset-0 p-4">
                    <LiveFeed alerts={alerts} />
                </div>
            </div>
        </div>
    );
};

export default LiveThreats;
