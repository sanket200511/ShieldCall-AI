import React, { useState, useEffect } from 'react';
import { RiskGauge } from '../components/RiskGauge';
import { LiveFeed } from '../components/LiveFeed';
import { Activity, Shield, Users, Database } from 'lucide-react';

export default function Dashboard() {
    const [alerts, setAlerts] = useState([]);
    const [globalRisk, setGlobalRisk] = useState(24);
    const [activeNodes, setActiveNodes] = useState(1);
    const [stats, setStats] = useState({ scams: 12, protected: 1240, blocked: 450 });

    useEffect(() => {
        // Connect to Real WebSocket
        const ws = new WebSocket('ws://localhost:8001/ws/monitor');

        ws.onopen = () => {
            console.log("Connected to ShieldCall Neural Core");
            setActiveNodes(prev => prev + 1);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            // Handle "Broadcast" type alerts (from backend simulation or mobile client)
            if (data.type === 'NEW_THREAT' || data.type === 'AUDIO_CHUNK') {
                const newAlert = {
                    id: Date.now(),
                    phone: data.type === 'AUDIO_CHUNK' ? 'Unknown (Live)' : data.phone,
                    scam_type: data.scam_type || 'Suspicious Activity',
                    risk_score: data.risk_score || 75,
                    transcript_snippet: data.text || data.transcript_snippet || "Analyzing audio stream...",
                    timestamp: new Date().toISOString()
                };

                setAlerts(prev => [newAlert, ...prev].slice(0, 50)); // Keep last 50
                setGlobalRisk(prev => Math.min(99, prev + 5));
                setStats(prev => ({ ...prev, scams: prev.scams + 1 }));
            }
        };

        ws.onclose = () => console.log("Disconnected from Neural Core");

        return () => ws.close();
    }, []);

    return (
        <div className="flex-1 p-6 overflow-hidden flex flex-col gap-6 relative h-full">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-cyan-500/5 blur-[100px] pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-center z-10">
                <div>
                    <h1 className="text-3xl font-bold">Mission Control</h1>
                    <p className="text-slate-400 text-sm">System Status: <span className="text-green-400">ONLINE</span> • Monitoring {activeNodes} Active Nodes</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-slate-900 rounded-lg border border-white/10 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
                        <span className="text-sm font-medium">Server: Mumbai-1</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 z-10">
                {[
                    { label: 'Active Scams', value: stats.scams, icon: Activity, color: 'text-red-400' },
                    { label: 'Protected Users', value: stats.protected, icon: Users, color: 'text-blue-400' },
                    { label: 'Threats Blocked', value: stats.blocked, icon: Shield, color: 'text-green-400' },
                    { label: 'Data Points', value: '8.4M', icon: Database, color: 'text-purple-400' },
                ].map((stat, idx) => (
                    <div key={idx} className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl backdrop-blur-sm flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className={`p-3 rounded-xl bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-widest">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 z-10">

                {/* Left Col: Live Map & Risk Gauge */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="flex-1 bg-slate-900/50 border border-white/5 rounded-2xl p-1 relative overflow-hidden group">
                        {/* Placeholder for Map - Could be an image or real map library */}
                        <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] opacity-10 bg-cover bg-center" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                            <div>
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Shield className="text-cyan-400" size={20} />
                                    Global Threat Level
                                </h3>
                                <p className="text-sm text-slate-400 max-w-md mt-1">
                                    Real-time aggregation of voice and text fraud reports across the region.
                                </p>
                            </div>
                            <div className="bg-slate-950/80 p-4 rounded-xl border border-white/10 backdrop-blur-xl hover:border-white/20 transition-colors">
                                <RiskGauge score={globalRisk} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col: Live Feed */}
                <div className="h-full min-h-0">
                    <LiveFeed alerts={alerts} />
                </div>

            </div>
        </div>
    );
}
