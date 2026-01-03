import React from 'react';
import { Phone, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function LiveFeed({ alerts }) {
    return (
        <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Live Intercepts
                </h3>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">Real-time WebSocket</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                <AnimatePresence>
                    {alerts.length === 0 && (
                        <div className="text-center text-slate-500 p-10">No active threats detected... monitoring.</div>
                    )}
                    {alerts.map((alert) => (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`flex items-start gap-4 p-4 rounded-xl border ${alert.risk_score > 70
                                    ? 'bg-red-500/10 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                                    : 'bg-slate-800/50 border-white/5'
                                }`}
                        >
                            <div className={`p-2 rounded-lg ${alert.risk_score > 70 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'
                                }`}>
                                {alert.risk_score > 70 ? <AlertTriangle size={20} /> : <Phone size={20} />}
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-medium text-white">{alert.phone}</h4>
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Clock size={12} /> {new Date(alert.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400 mt-1">
                                    Detected: <span className="text-cyan-400 font-medium">{alert.scam_type}</span>
                                </p>
                                <div className="mt-2 text-xs font-mono bg-black/20 p-2 rounded text-slate-300">
                                    "{alert.transcript_snippet}"
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <div className={`text-lg font-bold ${alert.risk_score > 70 ? 'text-red-400' : 'text-yellow-400'
                                    }`}>
                                    {alert.risk_score}%
                                </div>
                                <button className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors">
                                    Investigate
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
