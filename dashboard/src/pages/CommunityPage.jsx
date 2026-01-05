import React, { useState } from 'react';
import { ShieldAlert, Search, ThumbsUp, MessageSquare, Plus, Shield, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../config';

const CommunityPage = () => {
    const [reports, setReports] = useState([]);
    const [newPhone, setNewPhone] = useState('');
    const [reason, setReason] = useState('');

    React.useEffect(() => {
        fetch(`${API_BASE_URL}/blacklist/list`)
            .then(res => res.json())
            .then(data => {
                // Map API format to UI format if needed
                const mapped = data.map(d => ({
                    id: d.id || Math.random(),
                    phone: d.phone_number,
                    reason: d.reason,
                    reporter: d.reported_by || 'Anon',
                    time: new Date(d.created_at).toLocaleDateString()
                }));

                if (mapped.length > 0) setReports(mapped);
                else setReports([
                    { id: 101, phone: '+91 91122 33445', reason: 'Tech Support Scam', reporter: 'System', time: 'Today' },
                    { id: 102, phone: '+91 99887 76655', reason: 'KYC Fraud SMS', reporter: 'Rahul_User', time: 'Yesterday' },
                    { id: 103, phone: '+91 88990 01122', reason: 'Part-time Job Scam', reporter: 'Sarah_Smith', time: '2 days ago' },
                    { id: 104, phone: '+91 78901 23456', reason: 'Amazon Refund Fraud', reporter: 'Mike_D', time: '3 days ago' },
                    { id: 105, phone: '+91 77777 66666', reason: 'WhatsApp Video Call', reporter: 'Priya_K', time: '4 days ago' }
                ]);
            })
            .catch(err => console.error("Blacklist Fetch Error", err));
    }, []);

    const handleReport = async (e) => {
        e.preventDefault();
        // Optimistic UI update
        const newReport = {
            id: Date.now(),
            phone: newPhone,
            reason: reason,
            reporter: 'Admin',
            time: 'Just now'
        };
        setReports([newReport, ...reports]);

        // Backend Call
        try {
            await fetch(`${API_BASE_URL}/blacklist/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: newPhone,
                    reason: reason,
                    reported_by: 'WebDashboard'
                })
            });
        } catch (err) {
            console.error("Failed to report to backend", err);
        }

        setNewPhone('');
        setReason('');
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
                        Community Intel
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Crowd-sourced database of verified scammers.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg text-center">
                        <div className="text-xl font-bold text-white">{reports.length}</div>
                        <div className="text-xs text-slate-500">TOTAL BLOCKED</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg text-center">
                        <div className="text-xl font-bold text-green-400">+{Math.min(reports.length, 5)}</div>
                        <div className="text-xs text-slate-500">RECENT</div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Report Form */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Plus size={20} className="text-purple-400" />
                        Manual Blocklist
                    </h2>
                    <form onSubmit={handleReport} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white mt-1"
                                placeholder="+1234567890"
                                value={newPhone}
                                onChange={e => setNewPhone(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Reason / Pattern</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white mt-1"
                                placeholder="e.g. Amazon refund scam"
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition-colors">
                            Block Number
                        </button>
                    </form>
                </div>

                {/* Right: Feed */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Shield size={20} className="text-green-400" />
                            Recent Reports
                        </h2>

                        <div className="space-y-4">
                            {reports.map(item => (
                                <div key={item.id} className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between hover:border-purple-500/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                            <AlertTriangle size={20} />
                                        </div>
                                        <div>
                                            <div className="font-mono text-lg font-bold">{item.phone}</div>
                                            <div className="text-sm text-slate-400">{item.reason}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-slate-500">Reported by {item.reporter}</div>
                                        <div className="text-xs text-slate-600">{item.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityPage;
