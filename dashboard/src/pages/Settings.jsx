import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Server, Volume2 } from 'lucide-react';

const Settings = () => {
    const [config, setConfig] = useState({
        notifications: true,
        autoBlocking: true,
        soundAlerts: false,
        reportToPolice: false
    });

    const toggle = (key) => setConfig(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white">System Settings</h1>
                <p className="text-slate-400 mt-2">Configure ShieldCall global parameters.</p>
            </header>

            <div className="space-y-6">
                {/* Section 1: Protection */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Shield className="text-blue-400" size={20} />
                        Global Protection
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl">
                            <div>
                                <div className="font-bold text-white">Auto-Block Scammers</div>
                                <div className="text-sm text-slate-500">Automatically disconnect calls from known blacklist numbers</div>
                            </div>
                            <button
                                onClick={() => toggle('autoBlocking')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${config.autoBlocking ? 'bg-blue-600' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.autoBlocking ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl">
                            <div>
                                <div className="font-bold text-white">Auto-Report to Authorities</div>
                                <div className="text-sm text-slate-500">Automatically forward high-confidence (&gt;90%) transcripts to Cyber Cell</div>
                            </div>
                            <button
                                onClick={() => toggle('reportToPolice')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${config.reportToPolice ? 'bg-green-600' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.reportToPolice ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Section 2: Server */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Server className="text-green-400" size={20} />
                        Backend Status
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-950/50 rounded-xl">
                            <div className="text-sm text-slate-500">API Endpoint</div>
                            <div className="font-mono text-green-400">http://localhost:8000</div>
                        </div>
                        <div className="p-4 bg-slate-950/50 rounded-xl">
                            <div className="text-sm text-slate-500">WebSocket Node</div>
                            <div className="font-mono text-green-400">ws://localhost:8000/ws/monitor</div>
                        </div>
                        <div className="p-4 bg-slate-950/50 rounded-xl">
                            <div className="text-sm text-slate-500">Database Connection</div>
                            <div className="font-mono text-green-400">Supabase (Connected)</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
