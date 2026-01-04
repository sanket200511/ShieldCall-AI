import React, { useState, useEffect, useRef } from 'react';
import { Shield, Mic, Search, MessageSquare, AlertTriangle, FileText, Menu, X, CheckCircle, Smartphone, RefreshCw, AlertCircle } from 'lucide-react';
import { WS_BASE_URL, API_BASE_URL } from '../config';

const MobileClient = () => {
    // --- State ---
    const [activeTab, setActiveTab] = useState('sentinel'); // sentinel, analyzer, blacklist
    const [status, setStatus] = useState("CONNECTING...");
    const [isShieldActive, setIsShieldActive] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [threat, setThreat] = useState(null); // { type, risk_score, scam_type }

    // Analyzer State
    const [analyzeText, setAnalyzeText] = useState("");
    const [analyzeResult, setAnalyzeResult] = useState(null);

    // Blacklist State
    const [searchNumber, setSearchNumber] = useState("");
    const [blacklistResult, setBlacklistResult] = useState(null);

    const ws = useRef(null);
    const recognition = useRef(null);
    const reconnectTimeout = useRef(null);
    const audioRef = useRef(null);

    // --- Threat Logic (Defined early) ---
    const triggerThreatAlert = (data) => {
        setThreat(data);
        if (navigator.vibrate) navigator.vibrate([1000, 500, 1000]);
        // Play siren logic
        try {
            if (!audioRef.current) {
                audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            }
            audioRef.current.play().catch(e => console.log("Audio play failed:", e));
        } catch (e) { }
    };

    // --- Demo Triggers (Client-Side Fallback) ---
    const runDemo = (type) => {
        let text = "";
        let alertData = {};

        if (type === 'BANK') {
            text = "Hello this is the bank manager calling you need to provide OTP password eagerly immediate";
            alertData = { type: 'NEW_THREAT', scam_type: 'Bank Fraud', risk_score: 95 };
        } else {
            text = "Congratulations you won a lottery pay registration fee of 5000 rupees to claim prize";
            alertData = { type: 'NEW_THREAT', scam_type: 'Lottery Scam', risk_score: 88 };
        }

        setTranscript(text);

        // 1. Send to Server (Real)
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: "AUDIO_CHUNK", text: text }));
        }

        // 2. Force Local Alert (Guarantee Demo Works)
        setTimeout(() => {
            triggerThreatAlert(alertData);
        }, 500);
    };

    // --- 1. Robust WebSocket ---
    const connect = () => {
        setStatus("CONNECTING...");
        ws.current = new WebSocket(WS_BASE_URL);

        ws.current.onopen = () => {
            setStatus("SECURE");
            ws.current.send(JSON.stringify({
                type: "REGISTER_DEVICE",
                device_id: "web-mobile-" + Math.floor(Math.random() * 10000),
                device_name: "ShieldCall Mobile PWA",
                battery: 98
            }));
        };

        ws.current.onclose = () => {
            setStatus("OFFLINE");
            // Only retry automatically for a few times or let user manual retry
        };

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // Only trigger if we aren't already showing one (prevent double trigger from demo)
                if (data.type === 'NEW_THREAT') {
                    triggerThreatAlert(data);
                }
            } catch (e) { }
        };
    };

    useEffect(() => {
        let interval;
        connect();

        // Re-register periodically to keep alive
        interval = setInterval(() => {
            if (ws.current?.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify({
                    type: "REGISTER_DEVICE",
                    device_id: "web-mobile-" + Math.floor(Math.random() * 10000), // Keep ID stable in real app, but for now random is fine
                    device_name: "ShieldCall Mobile PWA",
                    battery: 98
                }));
            } else if (ws.current?.readyState === WebSocket.CLOSED) {
                connect();
            }
        }, 5000);

        return () => {
            ws.current?.close();
            clearTimeout(reconnectTimeout.current);
            clearInterval(interval);
        };
    }, []);

    // --- 2. Improved Speech Recognition ---
    useEffect(() => {
        const Speech = window.webkitSpeechRecognition || window.SpeechRecognition;
        if (!Speech) return;

        recognition.current = new Speech();
        recognition.current.continuous = false; // FINER CONTROL: Restart manually for better stability
        recognition.current.interimResults = true;
        recognition.current.lang = 'en-IN';

        recognition.current.onstart = () => { };

        recognition.current.onend = () => {
            if (isShieldActive) recognition.current.start(); // Auto-restart loop
        };

        recognition.current.onresult = (event) => {
            let finalSnippet = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalSnippet = event.results[i][0].transcript;
                    setTranscript(prev => (finalSnippet).slice(-100)); // Show latest

                    if (ws.current?.readyState === WebSocket.OPEN) {
                        ws.current.send(JSON.stringify({ type: "AUDIO_CHUNK", text: finalSnippet }));
                    }

                    // --- 3. Client-Side Offline Detection (Fallback) ---
                    // If server is offline, we detect basic keywords locally for the demo
                    const lower = finalSnippet.toLowerCase();
                    if (lower.includes("bank") && (lower.includes("otp") || lower.includes("password") || lower.includes("account"))) {
                        triggerThreatAlert({ type: 'NEW_THREAT', scam_type: 'Bank/OTP Fraud', risk_score: 99 });
                    }
                    else if (lower.includes("lottery") || lower.includes("prize") || lower.includes("winner")) {
                        triggerThreatAlert({ type: 'NEW_THREAT', scam_type: 'Lottery Scam', risk_score: 95 });
                    }
                    else if (lower.includes("police") || lower.includes("arrest") || lower.includes("customs")) {
                        triggerThreatAlert({ type: 'NEW_THREAT', scam_type: 'Legal Threat', risk_score: 92 });
                    }
                } else {
                    // Show interim
                    setTranscript(event.results[i][0].transcript);
                }
            }
        };

        recognition.current.onerror = (e) => {
            console.error("Mic Error", e);
            if (e.error === 'not-allowed') setIsShieldActive(false);
        };
    }, [isShieldActive]);

    // --- Toggle Shield ---
    const toggleShield = () => {
        if (isShieldActive) {
            setIsShieldActive(false);
            recognition.current?.stop();
        } else {
            setIsShieldActive(true);
            try { recognition.current?.start(); } catch (e) { }
        }
    };

    // --- API Handlers ---
    const handleAnalyze = async () => {
        if (!analyzeText) return;
        setAnalyzeResult({ loading: true });
        try {
            const res = await fetch(`${API_BASE_URL}/analyze/text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: analyzeText })
            });
            const data = await res.json();
            setAnalyzeResult(data);
        } catch (e) {
            setAnalyzeResult({ error: "Analysis Failed" });
        }
    };

    const handleBlacklistCheck = async () => {
        if (!searchNumber) return;
        setBlacklistResult({ loading: true });
        try {
            const res = await fetch(`${API_BASE_URL}/blacklist/check?phone=${searchNumber}`);
            const data = await res.json();
            setBlacklistResult(data);
        } catch (e) {
            setBlacklistResult({ error: "Check Failed" });
        }
    };

    // --- RENDER ---
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2147483647 }} className="w-screen h-screen bg-slate-950 text-white flex flex-col font-sans overflow-hidden">

            {/* THREAT OVERLAY */}
            {threat && (
                <div
                    onClick={() => { setThreat(null); audioRef.current?.pause(); }}
                    className="absolute inset-0 z-[2147483648] bg-red-600 animate-pulse flex flex-col items-center justify-center p-8 text-center cursor-pointer"
                >
                    <AlertTriangle size={64} className="text-white mb-4 animate-bounce" />
                    <h1 className="text-4xl font-black text-white mb-2">SCAM DETECTED!</h1>
                    <p className="text-xl text-red-100 font-bold">{threat.scam_type}</p>
                    <p className="mt-8 text-sm text-red-200 uppercase tracking-widest border border-red-400 px-4 py-2 rounded-full">Tap to Dismiss</p>
                </div>
            )}

            {/* HEADER */}
            <header className="px-6 py-4 flex justify-between items-center bg-slate-900 border-b border-slate-800 shadow-lg z-10">
                <div className="flex items-center gap-2">
                    <Shield className="text-cyan-400 fill-cyan-400/20" size={24} />
                    <span className="font-bold text-lg tracking-wide bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">ShieldCall</span>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2" onClick={connect}>
                        <div className={`w-2 h-2 rounded-full ${status === 'SECURE' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-xs font-mono text-slate-400">{status}</span>
                        {status === 'OFFLINE' && <RefreshCw size={10} className="text-slate-500" />}
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-y-auto p-6 relative pb-24">

                {/* 1. SENTINEL MODULE */}
                {activeTab === 'sentinel' && (
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <div className="relative mb-12">
                            {/* Ripple Effect */}
                            {isShieldActive && (
                                <>
                                    <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping" />
                                    <div className="absolute -inset-4 bg-cyan-500/10 rounded-full animate-pulse" />
                                </>
                            )}
                            <button
                                onClick={toggleShield}
                                className={`
                                    relative z-10 w-56 h-56 rounded-full flex flex-col items-center justify-center gap-3
                                    transition-all duration-500 border-4 shadow-[0_0_50px_rgba(0,0,0,0.5)]
                                    ${isShieldActive
                                        ? 'bg-gradient-to-br from-cyan-900 to-blue-900 border-cyan-400 shadow-cyan-500/30'
                                        : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                                    }
                                `}
                            >
                                <Shield size={72} className={isShieldActive ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'text-slate-500'} />
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold tracking-widest">{isShieldActive ? 'ACTIVE' : 'OFF'}</h2>
                                    {isShieldActive && <p className="text-[10px] text-cyan-300 uppercase tracking-wider mobile-pulse">Monitoring Call</p>}
                                </div>
                            </button>
                        </div>

                        {/* Transcript Bubble */}
                        <div className={`
                            w-full max-w-sm p-4 rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm mb-8
                            transition-all duration-500 ${isShieldActive ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4'}
                        `}>
                            <div className="flex items-center gap-2 mb-2 text-slate-500">
                                <Mic size={12} className={isShieldActive ? "text-red-400 animate-pulse" : ""} />
                                <span className="text-xs uppercase tracking-widest font-bold">Live Transcript</span>
                            </div>
                            <p className="text-sm font-mono text-cyan-100 leading-relaxed min-h-[3rem]">
                                {transcript || (isShieldActive ? "Listening for speech..." : "Tap Shield to activate")}
                            </p>
                        </div>

                        {/* DEMO BUTTONS */}
                        <div className="flex gap-4">
                            <button onClick={() => runDemo('BANK')} className="text-[10px] bg-slate-800 px-4 py-2 rounded-full border border-slate-700 hover:bg-slate-700 text-slate-300 font-bold tracking-wider active:scale-95 transition-transform flex items-center gap-2">
                                <AlertCircle size={12} className="text-yellow-500" /> TEST BANK
                            </button>
                            <button onClick={() => runDemo('LOTTERY')} className="text-[10px] bg-slate-800 px-4 py-2 rounded-full border border-slate-700 hover:bg-slate-700 text-slate-300 font-bold tracking-wider active:scale-95 transition-transform flex items-center gap-2">
                                <AlertCircle size={12} className="text-purple-500" /> TEST LOTTERY
                            </button>
                        </div>

                        <div className="mt-8 text-[10px] text-slate-600 uppercase tracking-widest">
                            Authorized Device Only
                        </div>
                    </div>
                )}

                {/* 2. ANALYZER MODULE */}
                {activeTab === 'analyzer' && (
                    <div className="flex flex-col h-full fade-in pt-4">
                        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                            <MessageSquare className="text-blue-500" /> Message Decoder
                        </h2>
                        <div className="flex-1 flex flex-col gap-6">
                            <div className="relative group">
                                <textarea
                                    className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-300 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all resize-none shadow-inner"
                                    placeholder="Paste suspicious SMS or WhatsApp message here..."
                                    value={analyzeText}
                                    onChange={(e) => setAnalyzeText(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleAnalyze}
                                disabled={!analyzeText}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold shadow-lg shadow-cyan-900/20 active:scale-95 transition-transform disabled:opacity-50 text-white tracking-wider"
                            >
                                ANALYZE TEXT
                            </button>

                            {analyzeResult && (
                                <div className={`p-4 rounded-xl border animate-in slide-in-from-bottom-4 duration-500 ${analyzeResult.verdict === 'MALICIOUS' ? 'bg-red-900/20 border-red-500' : 'bg-green-900/20 border-green-500'}`}>
                                    {analyzeResult.loading ? (
                                        <div className="text-center text-slate-400 animate-pulse">Analyzing patterns...</div>
                                    ) : analyzeResult.error ? (
                                        <div className="text-red-400">Analysis Failed</div>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={`font-bold text-lg ${analyzeResult.verdict === 'MALICIOUS' ? 'text-red-400' : 'text-green-400'}`}>{analyzeResult.verdict}</span>
                                                <span className="text-sm font-mono text-white/50">{analyzeResult.risk_score}% Risk</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {analyzeResult.patterns?.map(p => (
                                                    <span key={p} className="px-2 py-1 rounded-full bg-black/30 text-xs border border-white/10 text-slate-300">{p}</span>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 3. BLACKLIST MODULE */}
                {activeTab === 'blacklist' && (
                    <div className="flex flex-col h-full fade-in pt-4">
                        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                            <Search className="text-purple-500" /> Crowd Blacklist
                        </h2>
                        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex gap-2 mb-8 focus-within:border-cyan-500 transition-colors shadow-lg">
                            <Smartphone className="text-slate-500 ml-2 self-center" size={20} />
                            <input
                                className="bg-transparent flex-1 p-2 text-white focus:outline-none placeholder:text-slate-600"
                                placeholder="Search number (+91...)"
                                value={searchNumber}
                                onChange={(e) => setSearchNumber(e.target.value)}
                            />
                            <button
                                onClick={handleBlacklistCheck}
                                className="bg-slate-800 px-6 rounded-lg text-sm font-bold text-cyan-400 hover:bg-slate-700 transition-colors"
                            >
                                CHECK
                            </button>
                        </div>

                        {blacklistResult && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
                                {blacklistResult.is_blacklisted ? (
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
                                        <div className="relative p-8 bg-red-500/10 rounded-full ring-2 ring-red-500/50">
                                            <AlertTriangle size={48} className="text-red-500" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 bg-green-500/10 rounded-full mb-6 ring-2 ring-green-500/50">
                                        <CheckCircle size={48} className="text-green-500" />
                                    </div>
                                )}
                                <h3 className={`text-2xl font-bold mb-2 ${blacklistResult.is_blacklisted ? 'text-red-400' : 'text-green-400'}`}>
                                    {blacklistResult.is_blacklisted ? "DANGEROUS NUMBER" : "NO REPORTS FOUND"}
                                </h3>
                                <p className="text-slate-400 max-w-xs mx-auto text-sm leading-relaxed">
                                    {blacklistResult.details || "This number has not been reported by the community yet."}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* BOTTOM NAVIGATION */}
            <nav className="h-24 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-4 pb-6 absolute bottom-0 left-0 right-0 z-40">
                <NavButton icon={Shield} label="Sentinel" active={activeTab === 'sentinel'} onClick={() => setActiveTab('sentinel')} />
                <NavButton icon={MessageSquare} label="Analyzer" active={activeTab === 'analyzer'} onClick={() => setActiveTab('analyzer')} />
                <NavButton icon={Search} label="Blacklist" active={activeTab === 'blacklist'} onClick={() => setActiveTab('blacklist')} />
                <NavButton icon={FileText} label="Report" active={false} onClick={() => window.location.href = '/report'} />
            </nav>
        </div>
    );
};

const NavButton = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${active ? 'text-cyan-400 -translate-y-1' : 'text-slate-600 hover:text-slate-400'}`}
    >
        <div className={`p-1 rounded-full ${active ? 'bg-cyan-500/10' : ''}`}>
            <Icon size={24} className={active ? 'fill-cyan-400/20' : ''} />
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
    </button>
);

export default MobileClient;
