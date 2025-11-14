import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  callback: () => void;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatches = event.key === shortcut.key;
        const ctrlMatches = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey;
        const shiftMatches = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey;
        const altMatches = shortcut.altKey === undefined || event.altKey === shortcut.altKey;
        const metaMatches = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          // Don't trigger shortcuts when typing in input fields
          const target = event.target as HTMLElement;
          if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable
          ) {
            continue;
          }

          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          
          shortcut.callback();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Pre-configured navigation shortcuts hook
export function useNavigationShortcuts() {
  useKeyboardShortcuts([
    {
      key: 'Home',
      callback: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      key: 'End',
      callback: () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      },
    },
    {
      key: 'Home',
      ctrlKey: true,
      callback: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      key: 'End',
      ctrlKey: true,
      callback: () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      },
    },
  ]);
}
