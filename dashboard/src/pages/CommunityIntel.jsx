import React from 'react';
import { Trophy, Users, Map, ThumbsUp, Medal } from 'lucide-react';

export default function CommunityIntel() {
    return (
        <div className="p-8 h-full overflow-y-auto">
            <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                Community Intelligence
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Leaderboard Section - Gamification */}
                <div className="lg:col-span-1 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
                            <Trophy size={24} />
                        </div>
                        <h2 className="text-xl font-bold">Top Scam Hunters</h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            { name: "Rahul S.", points: 1250, badge: 'Cyber Guardian' },
                            { name: "Priya M.", points: 980, badge: 'Scam Buster' },
                            { name: "Amit K.", points: 850, badge: 'Watcher' },
                        ].map((user, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-sm">
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold">{user.name}</div>
                                    <div className="text-xs text-yellow-400 flex items-center gap-1">
                                        <Medal size={10} /> {user.badge}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono font-bold text-green-400">{user.points}</div>
                                    <div className="text-xs text-slate-500">XP</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl text-center">
                        <p className="text-sm text-blue-300 mb-2">You need 200 XP for next badge!</p>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full w-[70%] bg-blue-500" />
                        </div>
                    </div>
                </div>

                {/* Trending Scams */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Map Placeholder */}
                    <div className="h-64 bg-slate-800/50 rounded-2xl border border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 flex items-center justify-center text-slate-500 gap-2">
                            <Map /> Live Report Heatmap (API Key Required)
                        </div>
                        <div className="absolute bottom-4 left-4 flex gap-2">
                            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20">Hotspot: Delhi NCR</span>
                            <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/20">Hotspot: Jamtara</span>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Users size={20} className="text-purple-400" /> Recent Verified Reports
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { number: "+91 88*** **210", tag: "fake_police", votes: 45 },
                                { number: "+91 99*** **155", tag: "electricity_bill", votes: 32 },
                                { number: "+91 76*** **888", tag: "sextortion", votes: 89 },
                                { number: "+91 65*** **000", tag: "credit_card", votes: 12 },
                            ].map((report, i) => (
                                <div key={i} className="p-4 rounded-xl bg-slate-800/30 border border-white/5 flex justify-between items-center">
                                    <div>
                                        <div className="font-mono text-lg text-white">{report.number}</div>
                                        <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">{report.tag}</div>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <ThumbsUp size={16} className="text-green-400" />
                                        <span className="text-xs font-bold text-green-400">{report.votes}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
