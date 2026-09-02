import React, { useEffect, useState } from 'react';
import { Sparkles, Shield, Zap } from 'lucide-react';

export default function SplashIntro({ onComplete }) {
  const [stage, setStage] = useState('initial'); // 'initial' | 'boom' | 'reveal' | 'exit'

  useEffect(() => {
    // Stage 1: Trigger boom animation
    const t1 = setTimeout(() => setStage('boom'), 100);

    // Stage 2: Reveal full brand text
    const t2 = setTimeout(() => setStage('reveal'), 1000);

    // Stage 3: Fade out splash
    const t3 = setTimeout(() => setStage('exit'), 2400);

    // Stage 4: Unmount splash
    const t4 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ${
        stage === 'exit' ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'
      }`}
    >
      {/* Background Ambient Glow FX */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-600/20 via-indigo-950/30 to-slate-950 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Cinematic Logo Container */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-6">
        
        {/* Glowing Lens Flare Ring */}
        <div
          className={`absolute w-72 h-72 rounded-full bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-600 blur-2xl transition-all duration-1000 ${
            stage === 'initial'
              ? 'scale-0 opacity-0'
              : stage === 'boom'
              ? 'scale-125 opacity-70 animate-pulse'
              : 'scale-100 opacity-40'
          }`}
        />

        {/* Dynamic Netflix-Style "Boom Up" Logo Icon */}
        <div
          className={`relative p-6 rounded-3xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 shadow-2xl shadow-brand-500/50 border border-white/20 transition-all duration-700 ease-out transform ${
            stage === 'initial'
              ? 'scale-0 opacity-0 rotate-[-180deg]'
              : stage === 'boom'
              ? 'scale-125 opacity-100 rotate-0 shadow-[0_0_80px_rgba(99,102,241,0.8)]'
              : 'scale-100 opacity-100 rotate-0 shadow-[0_0_50px_rgba(99,102,241,0.5)]'
          }`}
        >
          <div className="flex items-center justify-center">
            <span className="text-5xl font-black text-white tracking-tighter drop-shadow-lg font-mono">
              S
            </span>
            <Sparkles className="w-6 h-6 text-brand-200 absolute -top-2 -right-2 animate-bounce" />
          </div>
        </div>

        {/* Project Title: SHUBYA Boom Text */}
        <div className="mt-8 space-y-2 overflow-hidden">
          <h1
            className={`text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-brand-300 tracking-tighter uppercase transition-all duration-700 ease-out transform ${
              stage === 'initial' || stage === 'boom'
                ? 'translate-y-12 opacity-0 scale-90'
                : 'translate-y-0 opacity-100 scale-100'
            }`}
          >
            SHUBYA
          </h1>

          <p
            className={`text-xs sm:text-sm font-semibold tracking-widest text-brand-400 uppercase transition-all duration-700 delay-300 ${
              stage === 'reveal' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            AI Customer Support Resolution Platform
          </p>
        </div>

        {/* Soundwave/Loading Pulse Line */}
        <div className="mt-10 w-48 h-1 bg-slate-800 rounded-full overflow-hidden relative">
          <div
            className={`h-full bg-gradient-to-r from-brand-500 via-indigo-400 to-purple-500 transition-all duration-1000 ease-in-out ${
              stage === 'initial' ? 'w-0' : stage === 'boom' ? 'w-1/2' : 'w-full'
            }`}
          />
        </div>

      </div>
    </div>
  );
}
