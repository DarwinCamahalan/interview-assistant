// Platform detection utilities

export const isMac = () => {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
};

export const isWindows = () => {
  return navigator.platform.toUpperCase().indexOf('WIN') >= 0;
};

export const getOS = (): 'mac' | 'windows' | 'linux' => {
  const platform = navigator.platform.toUpperCase();
  if (platform.indexOf('MAC') >= 0) return 'mac';
  if (platform.indexOf('WIN') >= 0) return 'windows';
  return 'linux';
};

export const COMMAND_KEY = isMac() ? '⌘' : 'Ctrl';

export const formatShortcutForDisplay = (shortcut: string): string => {
  // Safety check for undefined or non-string shortcuts
  if (!shortcut || typeof shortcut !== 'string') {
    return '';
  }
  
  const os = getOS();
  
  if (os === 'mac') {
    return shortcut
      .replace(/CommandOrControl/g, '⌘')
      .replace(/Command/g, '⌘')
      .replace(/Cmd/g, '⌘')
      .replace(/Control/g, '⌃')
      .replace(/Ctrl/g, '⌃')
      .replace(/Alt/g, '⌥')
      .replace(/Option/g, '⌥')
      .replace(/Shift/g, '⇧')
      .replace(/\+/g, ' ');
  } else {
    return shortcut
      .replace(/CommandOrControl/g, 'Ctrl')
      .replace(/Command/g, 'Ctrl')
      .replace(/Cmd/g, 'Ctrl')
      .replace(/Control/g, 'Ctrl')
      .replace(/\+/g, ' + ');
  }
};

export const recordKeyPress = (event: KeyboardEvent): string => {
  event.preventDefault();
  
  const keys: string[] = [];
  
  // Add modifiers
  if (event.ctrlKey || event.metaKey) {
    keys.push('CommandOrControl');
  }
  if (event.altKey) {
    keys.push('Alt');
  }
  if (event.shiftKey) {
    keys.push('Shift');
  }
  
  // Add the main key (if it's not a modifier)
  if (!['Control', 'Meta', 'Alt', 'Shift'].includes(event.key)) {
    let key = event.key;
    
    // Normalize some keys
    if (key === ' ') key = 'Space';
    if (key.length === 1) key = key.toUpperCase();
    
    // Special keys
    const specialKeys: Record<string, string> = {
      'Enter': 'Enter',
      'Return': 'Enter',
      'Escape': 'Escape',
      'Tab': 'Tab',
      'Backspace': 'Backspace',
      'Delete': 'Delete',
      'ArrowUp': 'Up',
      'ArrowDown': 'Down',
      'ArrowLeft': 'Left',
      'ArrowRight': 'Right',
    };
    
    if (specialKeys[event.key]) {
      key = specialKeys[event.key];
    }
    
    keys.push(key);
  }
  
  return keys.join('+');
};
