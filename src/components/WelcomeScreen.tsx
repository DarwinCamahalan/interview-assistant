import React from 'react';
import { Button } from './ui/button';

interface WelcomeScreenProps {
  onOpenSettings: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onOpenSettings }) => {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      <div className="max-w-2xl w-full space-y-6 fade-in">
        {/* Hero Section */}
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center pulse-glow">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 gradient-text">
            Interview AI Assistant
        </h1>
            <p className="text-white/60 text-sm max-w-lg mx-auto select-none">
              Your intelligent companion for technical interviews. Get AI-powered solutions, 
              complexity analysis, and real-time assistance while staying completely invisible during screen sharing.
            </p>
        </div>

        {/* Setup Card */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">API Key Required</h3>
              <p className="text-white/60 text-sm mb-4">
                Configure your OpenAI API key to start using the AI assistant. Your key is stored locally and securely.
              </p>
              <button
                onClick={onOpenSettings}
                className="w-full px-6 py-3 rounded-xl gradient-accent text-white font-medium hover:shadow-lg transition-all duration-200 modern-button"
              >
                Configure API Key
              </button>
            </div>
          </div>
        </div>
        
        {/* Keyboard Shortcuts */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <h3 className="text-white font-semibold">Keyboard Shortcuts</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Toggle Window', keys: '⌘+B' },
              { label: 'Take Screenshot', keys: '⌘+H' },
              { label: 'Delete Last', keys: '⌘+L' },
              { label: 'Process Queue', keys: '⌘+Enter' },
              { label: 'Reset View', keys: '⌘+R' },
              { label: 'Move Window', keys: '⌘+Arrows' },
            ].map((shortcut, index) => (
              <div
                key={index}
                className="glass-panel-dark rounded-lg p-3 flex items-center justify-between slide-in-right"
                style={{ animationDelay: `${index * 0.05}s` }}
          >
                <span className="text-white/70 text-xs">{shortcut.label}</span>
                <kbd className="px-2 py-1 bg-white/10 rounded text-white/90 text-xs font-mono">
                  {shortcut.keys}
                </kbd>
              </div>
            ))}
          </div>
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              ),
              title: 'Fast',
              desc: 'Real-time analysis'
            },
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              ),
              title: 'Secure',
              desc: 'Local storage'
            },
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              ),
              title: 'Smart',
              desc: 'AI-powered'
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="glass-card rounded-xl p-4 text-center scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {feature.icon}
                </svg>
              </div>
              <h4 className="text-white text-sm font-semibold mb-1">{feature.title}</h4>
              <p className="text-white/50 text-xs">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};