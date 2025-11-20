import React, { useState, useEffect } from 'react';
import { Camera, Code, Settings, Eye, EyeOff, Keyboard } from 'lucide-react';
import { formatShortcutForDisplay } from '../../utils/platform';

interface SidebarProps {
  currentView: 'queue' | 'solutions' | 'debug' | 'settings';
  onViewChange: (view: 'queue' | 'solutions' | 'debug' | 'settings') => void;
  onOpenSettings: () => void;
  screenshotCount: number;
  isProcessing: boolean;
}

export function Sidebar({ 
  currentView, 
  onViewChange, 
  onOpenSettings,
  screenshotCount,
  isProcessing
}: SidebarProps) {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [shortcuts, setShortcuts] = useState({
    takeScreenshot: 'CommandOrControl+H',
    processQueue: 'CommandOrControl+Enter',
    toggleWindow: 'CommandOrControl+B',
    resetView: 'CommandOrControl+R',
    deleteLastScreenshot: 'CommandOrControl+L',
    decreaseOpacity: 'CommandOrControl+[',
    increaseOpacity: 'CommandOrControl+]',
  });

  useEffect(() => {
    // Load shortcuts from config
    window.electronAPI.getConfig().then((config: any) => {
      if (config.shortcuts) {
        setShortcuts(config.shortcuts);
      }
    }).catch((error) => {
      console.error('Failed to load shortcuts:', error);
    });

    // Listen for shortcut updates
    const handleShortcutsUpdate = (event: any) => {
      if (event.detail) {
        setShortcuts(event.detail);
      }
    };

    window.addEventListener('shortcuts-updated', handleShortcutsUpdate);
    return () => window.removeEventListener('shortcuts-updated', handleShortcutsUpdate);
  }, []);

  const navItems = [
    {
      id: 'queue' as const,
      icon: Camera,
      label: 'Queue',
      badge: screenshotCount > 0 ? screenshotCount : null,
      description: 'Capture screenshots'
    },
    {
      id: 'solutions' as const,
      icon: Code,
      label: 'Solutions',
      badge: null,
      description: 'View solutions',
      disabled: screenshotCount === 0
    },
    {
      id: 'settings' as const,
      icon: Settings,
      label: 'Settings',
      badge: null,
      description: 'App settings'
    }
  ];

  return (
    <div className="flex flex-col h-full glass-panel-dark border-r border-white/10">
      {/* Brand Section */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-semibold text-sm">Interview AI</span>
            <span className="text-white/50 text-xs">Assistant</span>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className={`status-dot ${isProcessing ? 'processing' : 'active'}`}></div>
          <span className="text-white/70 text-xs">
            {isProcessing ? 'Processing...' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const isDisabled = item.disabled;

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && onViewChange(item.id)}
              disabled={isDisabled}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200 group relative
                ${isActive 
                  ? 'bg-white/10 text-white shadow-lg' 
                  : isDisabled
                  ? 'text-white/30 cursor-not-allowed'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
                }
              `}
              title={item.description}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-sm font-medium">{item.label}</span>
              
              {item.badge !== null && (
                <span className="ml-auto w-5 h-5 rounded-full bg-gradient-accent text-white text-xs flex items-center justify-center font-semibold">
                  {item.badge}
                </span>
              )}

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-accent rounded-r-full"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Keyboard Shortcuts Toggle */}
      <div className="p-2 border-t border-white/10">
        <button
          onClick={() => setShowShortcuts(!showShortcuts)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-all duration-200"
          title="Keyboard shortcuts"
        >
          <Keyboard className="w-4 h-4" />
          <span className="text-sm font-medium">Shortcuts</span>
        </button>

        {showShortcuts && (
          <div className="mt-2 p-3 glass-card rounded-lg space-y-2 fade-in">
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/50">Screenshot</span>
              <kbd className="px-2 py-1 bg-white/10 rounded text-white/70 font-mono">{formatShortcutForDisplay(shortcuts.takeScreenshot)}</kbd>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/50">Process</span>
              <kbd className="px-2 py-1 bg-white/10 rounded text-white/70 font-mono">{formatShortcutForDisplay(shortcuts.processQueue)}</kbd>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/50">Hide App</span>
              <kbd className="px-2 py-1 bg-white/10 rounded text-white/70 font-mono">{formatShortcutForDisplay(shortcuts.toggleWindow)}</kbd>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/50">Reset</span>
              <kbd className="px-2 py-1 bg-white/10 rounded text-white/70 font-mono">{formatShortcutForDisplay(shortcuts.resetView)}</kbd>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/50">Opacity -</span>
              <kbd className="px-2 py-1 bg-white/10 rounded text-white/70 font-mono">{formatShortcutForDisplay(shortcuts.decreaseOpacity)}</kbd>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/50">Opacity +</span>
              <kbd className="px-2 py-1 bg-white/10 rounded text-white/70 font-mono">{formatShortcutForDisplay(shortcuts.increaseOpacity)}</kbd>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}


