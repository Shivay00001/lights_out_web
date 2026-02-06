'use client';

import React from 'react';
import { useGameState, SizeOption } from '../hooks/useGameState';

export default function GameScreen() {
    const { size, grid, moves, isWon, bestScore, newGame, changeSize, toggleLight } = useGameState(5);

    const getIntensity = () => {
        if (!grid.length) return 0;
        const total = size * size;
        const on = grid.flat().filter(Boolean).length;
        return on / total;
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-slate-900 text-white font-sans selection:bg-indigo-500/30">

            {/* Animated Background */}
            <div
                className="absolute inset-0 transition-transform duration-1000 ease-in-out"
                style={{
                    background: `linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)`,
                    transform: `scale(${1 + getIntensity() * 0.05})`
                }}
            />

            {/* Blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-pink-600/10 rounded-full blur-[100px] pointer-events-none" />

            <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">

                {/* Header Card */}
                <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-6 shadow-2xl">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-pink-300 tracking-tight">
                                Lights Out
                            </h1>
                            <p className="text-slate-400 text-sm mt-1">
                                Toggle lights to turn them all off.
                            </p>
                        </div>

                        <div className="flex gap-2 bg-black/20 p-1 rounded-full">
                            {([4, 5, 6] as SizeOption[]).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => changeSize(s)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${size === s
                                            ? 'bg-white text-indigo-900 shadow-lg'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {s}×{s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-6 mt-6">
                        <Stat label="Moves" value={moves} />
                        <Stat label="Best" value={bestScore ?? '-'} />
                        <div className="flex-1" />
                        <button
                            onClick={newGame}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-medium transition-colors shadow-lg shadow-indigo-500/20"
                        >
                            New Game
                        </button>
                    </div>
                </div>

                {/* Game Board */}
                <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">

                    {isWon && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
                            <div className="text-5xl mb-4">🎉</div>
                            <h2 className="text-3xl font-bold text-white mb-2">You Won!</h2>
                            <p className="text-slate-300 mb-6">Completed in {moves} moves</p>
                            <button
                                onClick={newGame}
                                className="px-8 py-3 bg-white text-indigo-900 rounded-full font-bold hover:scale-105 transition-transform shadow-xl"
                            >
                                Play Again
                            </button>
                        </div>
                    )}

                    <div
                        className="grid gap-3 mx-auto"
                        style={{
                            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                            maxWidth: `${size * 70}px`
                        }}
                    >
                        {grid.map((row, r) => (
                            row.map((isOn, c) => (
                                <button
                                    key={`${r}-${c}`}
                                    onClick={() => toggleLight(r, c)}
                                    className={`
                    aspect-square rounded-xl transition-all duration-300 relative
                    ${isOn
                                            ? 'bg-gradient-to-br from-indigo-400 to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-100'
                                            : 'bg-white/5 hover:bg-white/10 scale-95'
                                        }
                  `}
                                    aria-label={`Toggle light at row ${r + 1}, column ${c + 1}`}
                                >
                                    {isOn && (
                                        <div className="absolute inset-0 rounded-xl bg-white/20 blur-sm" />
                                    )}
                                </button>
                            ))
                        ))}
                    </div>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => window.location.reload()}
                            className="text-xs text-slate-500 hover:text-slate-300 underline decoration-slate-700"
                        >
                            Reset App
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

function Stat({ label, value }: { label: string, value: string | number }) {
    return (
        <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{label}</span>
            <span className="text-xl font-mono font-bold text-white">{value}</span>
        </div>
    );
}
