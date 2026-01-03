import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileClient() {
    const [activeCall, setActiveCall] = useState(false);
    const [transcript, setTranscript] = useState([]);
    const [risk, setRisk] = useState(0);
    const [ws, setWs] = useState(null);

    useEffect(() => {
        // Connect to Backend WebSocket
        const socket = new WebSocket('ws://localhost:8001/ws/monitor');
        socket.onopen = () => console.log('Mobile connected to Neural Core');
        socket.onmessage = (e) => {
            // Receive verification hooks if needed
        };
        setWs(socket);
        return () => socket.close();
    }, []);

    const startSimulation = (type) => {
        setActiveCall(true);
        setRisk(0);
        setTranscript([]);

        // Simulate a scam conversation
        const scamScript = type === 'bank' ? [
            "Hello, this is Bank Support.",
            "Your account is blocked due to KYC.",
            "Please tell me the OTP sent to your mobile.",
            "Quickly sir, or money will proceed to debit."
        ] : [
            "Congrats! You won a lottery.",
            "Pay 5000 registration fee.",
            "Give me your UPI pin to receive money."
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i >= scamScript.length) {
                clearInterval(interval);
                return;
            }

            const text = scamScript[i];
            setTranscript(prev => [...prev, text]);

            // Send to backend
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'AUDIO_CHUNK',
                    text: text,
                    device_id: 'MOBILE_WEB_CLIENT_01',
                    scam_type: type === 'bank' ? 'Bank Fraud' : 'Lottery Scam'
                }));
            }

            // Local fake risk update
            setRisk(r => Math.min(99, r + 25));

            i++;
        }, 2000);
    };

    const endCall = () => {
        setActiveCall(false);
        setRisk(0);
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 font-sans flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Animation */}
            <div className={`absolute inset-0 transition-colors duration-1000 ${risk > 50 ? 'bg-red-900/20' : 'bg-slate-900'}`} />

            <div className="z-10 w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
                {/* Status Bar */}
                <div className="flex justify-between text-xs text-slate-500 mb-8">
                    <span>ShieldCall Mobile</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full" /> Protected</span>
                </div>

                {/* Main Display */}
                <div className="text-center space-y-6">
                    <div className="relative inline-block">
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${risk > 70 ? 'border-red-500 animate-pulse' : 'border-cyan-500'} transition-all`}>
                            {activeCall ? <Phone size={40} className="animate-bounce" /> : <ShieldCheck size={40} className="text-cyan-500" />}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold">{activeCall ? 'Call in Progress...' : 'System Secure'}</h2>
                        <p className="text-slate-400 text-sm mt-1">{activeCall ? 'Analyzing Audio Stream...' : 'Monitoring enabled'}</p>
                    </div>

                    {/* Live Transcription Box */}
                    {activeCall && (
                        <div className="bg-black/40 rounded-xl p-4 h-32 overflow-y-auto text-left text-sm space-y-2 border border-white/10">
                            {transcript.map((t, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-slate-300">
                                    "{t}"
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Risk Warning Overlay */}
                    {risk > 50 && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-red-500/90 text-white p-4 rounded-xl shadow-lg border border-red-400"
                        >
                            <div className="flex items-center gap-2 justify-center font-bold text-lg mb-1">
                                <AlertTriangle /> SCAM DETECTED
                            </div>
                            <p className="text-sm">Do not share OTP! Caller is suspicious.</p>
                        </motion.div>
                    )}

                    {/* Controls */}
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        {!activeCall ? (
                            <>
                                <button onClick={() => startSimulation('bank')} className="p-4 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all">
                                    Simulate<br /><span className="text-cyan-400 font-bold">Bank Scam</span>
                                </button>
                                <button onClick={() => startSimulation('lottery')} className="p-4 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all">
                                    Simulate<br /><span className="text-purple-400 font-bold">Lottery Scam</span>
                                </button>
                            </>
                        ) : (
                            <button onClick={endCall} className="col-span-2 p-4 bg-red-500 hover:bg-red-600 rounded-xl font-bold shadow-lg shadow-red-500/20 flex items-center justify-center gap-2">
                                <PhoneOff /> End Call
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <p className="text-slate-500 text-xs mt-8 z-10 text-center max-w-xs">
                Open this page on your phone to simulate the app experience during the hackathon.
            </p>
        </div>
    );
}
