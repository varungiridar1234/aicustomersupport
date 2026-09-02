import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function SplashIntro({ onComplete }) {
  const [stage, setStage] = useState('initial');

  useEffect(() => {
    const t1 = setTimeout(() => setStage('boom'), 100);
    const t2 = setTimeout(() => setStage('reveal'), 1000);
    const t3 = setTimeout(() => setStage('exit'), 2200);
    const t4 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-slate-900 text-white flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ${
        stage === 'exit' ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'
      }`}
    >
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-6">
        <div
          className={`p-5 rounded-2xl bg-purple-600 shadow-xl transition-all duration-700 ease-out transform ${
            stage === 'initial'
              ? 'scale-0 opacity-0'
              : 'scale-100 opacity-100'
          }`}
        >
          <Sparkles className="w-8 h-8 text-white animate-pulse" />
        </div>

        <div className="mt-6 space-y-2">
          <h1
            className={`text-4xl font-extrabold tracking-tight transition-all duration-700 ${
              stage === 'initial' || stage === 'boom' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
          >
            Support<span className="text-purple-400">IQ</span>
          </h1>

          <p
            className={`text-xs font-medium tracking-wide text-slate-400 uppercase transition-all duration-700 delay-200 ${
              stage === 'reveal' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Enterprise AI Resolution Platform
          </p>
        </div>
      </div>
    </div>
  );
}
