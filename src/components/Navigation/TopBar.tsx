import React from 'react';
import { Minimize2, Maximize2, X } from 'lucide-react';

interface TopBarProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

const LANGUAGES = [
  { value: 'python', label: 'Python', color: '#3776ab' },
  { value: 'javascript', label: 'JavaScript', color: '#f7df1e' },
  { value: 'typescript', label: 'TypeScript', color: '#3178c6' },
  { value: 'java', label: 'Java', color: '#007396' },
  { value: 'cpp', label: 'C++', color: '#00599c' },
  { value: 'csharp', label: 'C#', color: '#239120' },
  { value: 'go', label: 'Go', color: '#00add8' },
  { value: 'rust', label: 'Rust', color: '#ce422b' },
];

export function TopBar({ currentLanguage, onLanguageChange }: TopBarProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const currentLang = LANGUAGES.find(l => l.value === currentLanguage) || LANGUAGES[0];

  return (
    <div className="glass-panel-dark border-b border-white/10 px-4 py-2 flex items-center justify-between" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      {/* Language Selector */}
      <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <span className="text-white/50 text-xs font-medium">Language:</span>
        <div className="relative">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card hover:bg-white/10 transition-all duration-200 modern-button"
          >
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: currentLang.color }}
            ></div>
            <span className="text-white text-xs font-medium">{currentLang.label}</span>
            <svg 
              className={`w-3 h-3 text-white/50 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isExpanded && (
            <div className="absolute top-full mt-2 left-0 w-48 glass-panel-dark border border-white/10 rounded-lg overflow-hidden shadow-2xl fade-in" style={{ zIndex: 9999 }}>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => {
                    onLanguageChange(lang.value);
                    setIsExpanded(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 text-left
                    transition-all duration-200
                    ${currentLanguage === lang.value 
                      ? 'bg-white/10 text-white' 
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: lang.color }}
                  ></div>
                  <span className="text-xs font-medium">{lang.label}</span>
                  {currentLanguage === lang.value && (
                    <svg className="w-3 h-3 ml-auto text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Window Controls */}
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          onClick={() => window.electronAPI?.toggleMainWindow?.()}
          className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200"
          title="Hide window (⌘+B)"
        >
          <Minimize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}


