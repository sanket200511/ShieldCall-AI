import React from 'react';
import { motion } from 'framer-motion';

export function RiskGauge({ score }) {
    // Score 0-100
    const color = score > 80 ? '#ef4444' : score > 50 ? '#f59e0b' : '#22c55e';
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="128"
                    cy="128"
                    r={radius}
                    stroke="#1e293b"
                    strokeWidth="12"
                    fill="transparent"
                />
                {/* Animated Progress Circle */}
                <motion.circle
                    cx="128"
                    cy="128"
                    r={radius}
                    stroke={color}
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    strokeLinecap="round"
                    className="filter drop-shadow-[0_0_8px_currentColor]"
                />
            </svg>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm text-slate-400 uppercase tracking-wider">Risk Level</span>
                <div className="text-5xl font-bold flex items-start" style={{ color }}>
                    {score}
                    <span className="text-lg mt-1">%</span>
                </div>
                <div className="mt-2 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 border border-slate-700">
                    {score > 80 ? 'CRITICAL' : score > 50 ? 'WARNING' : 'SAFE'}
                </div>
            </div>

            {/* Outer Glow Ring for Critical */}
            {score > 80 && (
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-red-500/30"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}
        </div>
    );
}
