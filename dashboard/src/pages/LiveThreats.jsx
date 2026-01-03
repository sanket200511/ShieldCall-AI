import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, MoreVertical, Shield } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function LiveThreats() {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/threats`)
            .then(res => res.json())
            .then(setData)
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="p-8 h-full flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">Live Threat Matrix</h1>
                    <p className="text-slate-400 mt-1">Database Records (Last 50 Events)</p>
                </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl overflow-y-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-slate-400 border-b border-white/5">
                            <th className="p-4 uppercase text-xs">Time</th>
                            <th className="p-4 uppercase text-xs">Caller ID</th>
                            <th className="p-4 uppercase text-xs">Scam Type</th>
                            <th className="p-4 uppercase text-xs">Risk</th>
                            <th className="p-4 uppercase text-xs">Evidence</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-slate-500">
                                    No active threats found in database. Waiting for input...
                                </td>
                            </tr>
                        ) : (
                            data.map((item, idx) => (
                                <tr key={idx} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-slate-400 text-sm">
                                        {new Date(item.created_at).toLocaleTimeString()}
                                    </td>
                                    <td className="p-4 font-mono text-white">{item.phone_number}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 rounded-md bg-slate-800 border border-white/5 text-xs text-cyan-300">
                                            {item.scam_type}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`font-bold ${item.risk_score > 70 ? 'text-red-400' : 'text-yellow-400'}`}>
                                            {item.risk_score}%
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs text-slate-500 font-mono">
                                        {item.transcript ? item.transcript.substring(0, 30) + '...' : '-'}
                                    </td>
                                </tr>
                            )))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
