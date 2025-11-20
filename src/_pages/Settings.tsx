import React, { useState, useEffect, useCallback } from 'react';
import { Palette, Key, Save, Keyboard, Check } from 'lucide-react';
import { useToast } from '../contexts/toast';
import { formatShortcutForDisplay, recordKeyPress } from '../utils/platform';

interface SettingsProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

interface ShortcutConfig {
  takeScreenshot: string;
  processQueue: string;
  toggleWindow: string;
  resetView: string;
  deleteLastScreenshot: string;
  decreaseOpacity: string;
  increaseOpacity: string;
}

const THEMES = [
  {
    id: 'dark',
    name: 'Dark+ (default dark)',
    description: 'VS Code default dark theme',
    gradient: 'from-[#1e1e1e] via-[#1e1e1e] to-[#1e1e1e]',
    preview: 'bg-[#1e1e1e]',
    accent: '#007acc',
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    description: 'Deep blue professional',
    gradient: 'from-[#0d1117] via-[#161b22] to-[#0d1117]',
    preview: 'bg-[#0d1117]',
    accent: '#0078d4',
  },
  {
    id: 'forest',
    name: 'Forest Green',
    description: 'Calm green ambiance',
    gradient: 'from-[#0a1f1a] via-[#0f2922] to-[#0a1f1a]',
    preview: 'bg-[#0a1f1a]',
    accent: '#10b981',
  },
  {
    id: 'crimson',
    name: 'Crimson Red',
    description: 'Warm red theme',
    gradient: 'from-[#1a0f0f] via-[#2a1515] to-[#1a0f0f]',
    preview: 'bg-[#1a0f0f]',
    accent: '#ef4444',
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    description: 'Cool ocean depths',
    gradient: 'from-[#0a1929] via-[#0f2942] to-[#0a1929]',
    preview: 'bg-[#0a1929]',
    accent: '#06b6d4',
  },
];

const DEFAULT_SHORTCUTS: ShortcutConfig = {
  takeScreenshot: 'CommandOrControl+H',
  processQueue: 'CommandOrControl+Enter',
  toggleWindow: 'CommandOrControl+B',
  resetView: 'CommandOrControl+R',
  deleteLastScreenshot: 'CommandOrControl+L',
  decreaseOpacity: 'CommandOrControl+[',
  increaseOpacity: 'CommandOrControl+]',
};

export default function Settings({ currentTheme, onThemeChange }: SettingsProps) {
  const { showToast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [extractionModel, setExtractionModel] = useState('gpt-4o-mini');
  const [solutionModel, setSolutionModel] = useState('gpt-4o-mini');
  const [debuggingModel, setDebuggingModel] = useState('gpt-4o-mini');
  const [shortcuts, setShortcuts] = useState<ShortcutConfig>(DEFAULT_SHORTCUTS);
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const config = await window.electronAPI.getConfig();
      setApiKey(config.apiKey || '');
      setExtractionModel(config.extractionModel || 'gpt-4o-mini');
      setSolutionModel(config.solutionModel || 'gpt-4o-mini');
      setDebuggingModel(config.debuggingModel || 'gpt-4o-mini');
      setShortcuts(config.shortcuts || DEFAULT_SHORTCUTS);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load config:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await window.electronAPI.updateConfig({
        apiKey,
        extractionModel,
        solutionModel,
        debuggingModel,
        shortcuts,
      });
      showToast('Success', 'Settings saved and shortcuts updated!', 'success');
      
      // Trigger shortcuts reload in main process
      await window.electronAPI.reloadShortcuts?.();
      
      // Broadcast shortcut update event
      window.dispatchEvent(new CustomEvent('shortcuts-updated', { detail: shortcuts }));
    } catch (error) {
      console.error('Failed to save config:', error);
      showToast('Error', 'Failed to save settings', 'error');
    }
  };

  const handleShortcutEdit = (key: keyof ShortcutConfig) => {
    setEditingShortcut(key);
  };

  const handleKeyDown = useCallback((event: KeyboardEvent, key: keyof ShortcutConfig) => {
    const shortcut = recordKeyPress(event);
    
    // Only accept shortcuts with at least a modifier + key
    if (shortcut.includes('+')) {
      setShortcuts(prev => ({ ...prev, [key]: shortcut }));
      setEditingShortcut(null);
      showToast('Shortcut Updated', `New shortcut: ${formatShortcutForDisplay(shortcut)}`, 'success');
    }
  }, [showToast]);

  useEffect(() => {
    if (editingShortcut) {
      const handleKey = (e: KeyboardEvent) => handleKeyDown(e, editingShortcut as keyof ShortcutConfig);
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }
  }, [editingShortcut, handleKeyDown]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-white/60 text-sm">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="glass-card rounded-xl p-4 fade-in">
        <h1 className="text-white text-lg font-semibold gradient-text">Settings</h1>
        <p className="text-white/50 text-xs mt-1">
          Customize your AI assistant
        </p>
      </div>

      {/* Color Theme - VS Code Style */}
      <div className="glass-card rounded-xl p-4 space-y-3 fade-in">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="w-4 h-4 text-white/70" />
          <h2 className="text-sm font-semibold text-white">Color Theme</h2>
        </div>
        <div className="space-y-1">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 modern-button ${
                currentTheme === theme.id 
                  ? 'bg-[#007acc]/20 text-white' 
                  : 'text-white/80 hover:bg-white/5'
              }`}
            >
              <div className={`w-5 h-5 rounded border ${theme.preview} border-white/20`}></div>
              <div className="flex-1">
                <div className="text-sm">{theme.name}</div>
              </div>
              {currentTheme === theme.id && (
                <Check className="w-4 h-4 text-[#007acc]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* API Key Section */}
      <div className="glass-card rounded-xl p-4 space-y-3 fade-in">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-accent-blue rounded-full"></div>
          <h2 className="text-sm font-semibold text-white tracking-wide">OpenAI API Key</h2>
        </div>
        <div className="space-y-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
          />
          <p className="text-white/40 text-xs">
            Your API key is stored locally and never shared
          </p>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="glass-card rounded-xl p-4 space-y-3 fade-in">
        <div className="flex items-center gap-2 mb-2">
          <Keyboard className="w-4 h-4 text-white/70" />
          <h2 className="text-sm font-semibold text-white">Keyboard Shortcuts</h2>
        </div>
        <p className="text-xs text-white/50 mb-3">Click on a shortcut and press the key combination</p>
        <div className="space-y-2">
          {[
            { key: 'takeScreenshot' as keyof ShortcutConfig, label: 'Take Screenshot' },
            { key: 'processQueue' as keyof ShortcutConfig, label: 'Process Queue' },
            { key: 'toggleWindow' as keyof ShortcutConfig, label: 'Hide/Show Window' },
            { key: 'resetView' as keyof ShortcutConfig, label: 'Reset View' },
            { key: 'deleteLastScreenshot' as keyof ShortcutConfig, label: 'Delete Last Screenshot' },
            { key: 'decreaseOpacity' as keyof ShortcutConfig, label: 'Decrease Opacity' },
            { key: 'increaseOpacity' as keyof ShortcutConfig, label: 'Increase Opacity' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-all">
              <div className="text-sm text-white/80">{label}</div>
              {editingShortcut === key ? (
                <div className="px-3 py-2 bg-[#007acc]/20 border-2 border-[#007acc] rounded text-xs text-white animate-pulse">
                  <Keyboard className="w-4 h-4 inline mr-2" />
                  Press keys...
                </div>
              ) : (
                <button
                  onClick={() => handleShortcutEdit(key)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-[#007acc]/20 rounded text-xs text-white/90 font-mono transition-all border border-white/10 hover:border-[#007acc]"
                >
                  {formatShortcutForDisplay(shortcuts[key])}
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-400">
            💡 Click a shortcut and press your desired key combination
          </p>
          <p className="text-xs text-blue-300/60 mt-1">
            Tip: Use modifier keys (Ctrl/⌘, Alt, Shift) + another key
          </p>
        </div>
      </div>

      {/* Model Selection */}
      <div className="glass-card rounded-xl p-4 space-y-3 fade-in">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-accent-orange rounded-full"></div>
          <h2 className="text-sm font-semibold text-white tracking-wide">AI Models</h2>
        </div>
        
        <div className="space-y-3">
          {/* Extraction Model */}
          <div>
            <label className="text-white/70 text-xs font-medium">Problem Extraction</label>
            <select
              value={extractionModel}
              onChange={(e) => setExtractionModel(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            >
              <option value="gpt-4o-mini">GPT-4o Mini (Fast & Cheap)</option>
              <option value="gpt-4o">GPT-4o (Balanced)</option>
              <option value="gpt-4-turbo">GPT-4 Turbo (Powerful)</option>
            </select>
          </div>

          {/* Solution Model */}
          <div>
            <label className="text-white/70 text-xs font-medium">Solution Generation</label>
            <select
              value={solutionModel}
              onChange={(e) => setSolutionModel(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            >
              <option value="gpt-4o-mini">GPT-4o Mini (Fast & Cheap)</option>
              <option value="gpt-4o">GPT-4o (Balanced)</option>
              <option value="gpt-4-turbo">GPT-4 Turbo (Powerful)</option>
            </select>
          </div>

          {/* Debugging Model */}
          <div>
            <label className="text-white/70 text-xs font-medium">Code Debugging</label>
            <select
              value={debuggingModel}
              onChange={(e) => setDebuggingModel(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            >
              <option value="gpt-4o-mini">GPT-4o Mini (Fast & Cheap)</option>
              <option value="gpt-4o">GPT-4o (Balanced)</option>
              <option value="gpt-4-turbo">GPT-4 Turbo (Powerful)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button - Aligned with selected theme */}
      <div className={`glass-card rounded-xl p-4 fade-in ${currentTheme === 'dark' ? 'bg-[#007acc]/10 border border-[#007acc]/30' : ''}`}>
        <button
          onClick={handleSave}
          className="w-full rounded-lg py-2.5 px-4 bg-[#007acc] hover:bg-[#0098ff] transition-all duration-200 modern-button"
        >
          <div className="flex items-center justify-center gap-2">
            <Save className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-semibold">Save Settings</span>
          </div>
        </button>
      </div>
    </div>
  );
}

