
import React, { useState } from 'react';
import { FileText, Send, Paperclip } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { motion } from 'framer-motion';

const ReportPage = () => {
    const [formData, setFormData] = useState({
        victim_name: '',
        scammer_phone: '',
        scam_type: 'Voice Phishing',
        description: '',
        evidence_text: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success' | 'error'

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const response = await fetch(`${API_BASE_URL} /report/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = "CyberCrime_Complaint.pdf";
                document.body.appendChild(a);
                a.click();
                a.remove();
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
                    Cyber-Crime Reporter
                </h1>
                <p className="text-slate-400 mt-2">
                    Generate an instant official complaint PDF for Law Enforcement & Cyber Cell.
                </p>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Victim Name</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                                placeholder="John Doe"
                                value={formData.victim_name}
                                onChange={e => setFormData({ ...formData, victim_name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Scammer Phone</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                                placeholder="+91 98xxx xxxxx"
                                value={formData.scammer_phone}
                                onChange={e => setFormData({ ...formData, scammer_phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Scam Type</label>
                        <select
                            className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                            value={formData.scam_type}
                            onChange={e => setFormData({ ...formData, scam_type: e.target.value })}
                        >
                            <option>Voice Phishing</option>
                            <option>SMS Fraud</option>
                            <option>WhatsApp Scam</option>
                            <option>Investment/Task Scam</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Incident Description</label>
                        <textarea
                            required
                            rows="4"
                            className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                            placeholder="Describe what happened..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Evidence / Transcript (Optional)</label>
                        <textarea
                            rows="3"
                            className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white font-mono text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                            placeholder="Paste message content or call transcript here..."
                            value={formData.evidence_text}
                            onChange={e => setFormData({ ...formData, evidence_text: e.target.value })}
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w - full py - 4 rounded - xl font - bold text - lg shadow - lg flex items - center justify - center gap - 2 transition - all
                                ${loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-red-500/20'}
`}
                        >
                            {loading ? (
                                <>Generating Report...</>
                            ) : (
                                <>
                                    <span>🚨</span> Generate Police Complaint (PDF)
                                </>
                            )}
                        </button>
                    </div>

                    {status === 'success' && (
                        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-center animate-pulse">
                            ✅ Complaint Generated & Downloaded Successfully!
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center">
                            ❌ Failed to generate report. Is backend running?
                        </div>
                    )}
                </form>
            </motion.div>
        </div>
    );
};

export default ReportPage;
