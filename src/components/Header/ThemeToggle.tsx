import type { Theme } from '../../hooks/useTheme';
import { Button } from '../ui/Button/Button';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

const SUN =
  'M12 4V2M12 22v-2M4 12H2M22 12h-2M6 6 4.6 4.6M19.4 19.4 18 18M6 18l-1.4 1.4M19.4 4.6 18 6';

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const dark = theme === 'dark';

  return (
    <Button aria-pressed={dark} onClick={onToggle}>
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        {dark ? (
          <path
            d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d={SUN} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
      </svg>
      Dark mode
    </Button>
  );
}
