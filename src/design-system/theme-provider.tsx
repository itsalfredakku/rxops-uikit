import { 
  component$, 
  useContextProvider, 
  createContextId, 
  useSignal, 
  useTask$,
  useVisibleTask$,
  type Signal,
  type JSXChildren 
} from '@builder.io/qwik';

/**
 * RxOps UIKit - Healthcare Theme Provider
 * Minimal, graceful theme system that preserves semantic colors
 */

/* ========================================
   THEME TYPES & INTERFACES
   ======================================== */

export type SemanticShade = 'lighter' | 'light' | 'normal' | 'dark' | 'darker';
export type ThemeContext = 'clinical' | 'comfort' | 'high-contrast' | 'vibrant';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeModifiers {
  brightness: number;      // -20 to +20 (percentage)
  saturation: number;      // 70 to 130 (percentage)
  contrastBoost: number;   // 0.8 to 1.5 (multiplier)
  warmth: number;          // -10 to +10 (hue shift degrees)
}

export interface ThemeState {
  mode: Signal<ThemeMode>;
  context: Signal<ThemeContext>;
  isSystemDark: Signal<boolean>;
  effectiveMode: Signal<'light' | 'dark'>;
}

export interface ThemeProviderProps {
  children: JSXChildren;
  defaultMode?: ThemeMode;
  defaultContext?: ThemeContext;
  storageKey?: string;
  enableDebug?: boolean;
}

/* ========================================
   THEME PRESETS
   ======================================== */

export const themePresets: Record<ThemeContext, ThemeModifiers> = {
  clinical: {
    brightness: 0,
    saturation: 85,         // Slightly desaturated for professional look
    contrastBoost: 1.1,     // Better readability
    warmth: -5,             // Cooler tones
  },
  comfort: {
    brightness: 5,
    saturation: 100,
    contrastBoost: 1.05,
    warmth: 10,             // Warmer, more inviting
  },
  'high-contrast': {
    brightness: 0,
    saturation: 120,        // More vivid colors
    contrastBoost: 1.4,     // Maximum contrast
    warmth: 0,
  },
  vibrant: {
    brightness: 10,
    saturation: 130,        // Rich, vibrant colors
    contrastBoost: 1.15,
    warmth: 5,
  },
};

/* ========================================
   THEME CONTEXT
   ======================================== */

export const ThemeContext = createContextId<ThemeState>('rxops-theme');

/* ========================================
   THEME PROVIDER COMPONENT
   ======================================== */

export const ThemeProvider = component$<ThemeProviderProps>(({
  children,
  defaultMode = 'system',
  defaultContext = 'clinical',
  storageKey = 'rxops-theme',
  enableDebug = false,
}) => {
  // Theme state signals
  const mode = useSignal<ThemeMode>(defaultMode);
  const context = useSignal<ThemeContext>(defaultContext);
  const isSystemDark = useSignal(false);
  const effectiveMode = useSignal<'light' | 'dark'>('light');

  // Load theme from localStorage on mount
  useVisibleTask$(() => {
    if (typeof window !== 'undefined') {
      // Load saved theme preferences
      const savedMode = localStorage.getItem(`${storageKey}-mode`) as ThemeMode;
      const savedContext = localStorage.getItem(`${storageKey}-context`) as ThemeContext;
      
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        mode.value = savedMode;
      }
      
      if (savedContext && ['clinical', 'comfort', 'high-contrast', 'vibrant'].includes(savedContext)) {
        context.value = savedContext;
      }

      // Set up system dark mode detection
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      isSystemDark.value = mediaQuery.matches;
      
      const handleChange = (e: MediaQueryListEvent) => {
        isSystemDark.value = e.matches;
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      // Cleanup
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  });

  // Calculate effective mode based on current settings
  useTask$(({ track }) => {
    track(() => mode.value);
    track(() => isSystemDark.value);
    
    if (mode.value === 'system') {
      effectiveMode.value = isSystemDark.value ? 'dark' : 'light';
    } else {
      effectiveMode.value = mode.value;
    }
  });

  // Apply theme to document
  useTask$(({ track }) => {
    track(() => effectiveMode.value);
    track(() => context.value);
    
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      // Apply/remove dark mode class
      if (effectiveMode.value === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      // Apply theme context class
      root.classList.remove('theme-clinical', 'theme-comfort', 'theme-high-contrast', 'theme-vibrant');
      root.classList.add(`theme-${context.value}`);
      
      // Add debug class if enabled
      if (enableDebug) {
        root.classList.add('theme-debug');
        root.style.setProperty('--theme-mode', effectiveMode.value);
        root.style.setProperty('--theme-context', context.value);
      } else {
        root.classList.remove('theme-debug');
      }
      
      // Apply theme modifiers as CSS custom properties
      const modifiers = themePresets[context.value];
      root.style.setProperty('--theme-brightness', modifiers.brightness.toString());
      root.style.setProperty('--theme-saturation', `${modifiers.saturation}%`);
      root.style.setProperty('--theme-contrast', modifiers.contrastBoost.toString());
      root.style.setProperty('--theme-warmth', modifiers.warmth.toString());
    }
  });

  // Save theme preferences to localStorage
  useTask$(({ track }) => {
    track(() => mode.value);
    track(() => context.value);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${storageKey}-mode`, mode.value);
      localStorage.setItem(`${storageKey}-context`, context.value);
    }
  });

  // Provide theme context
  useContextProvider(ThemeContext, {
    mode,
    context,
    isSystemDark,
    effectiveMode,
  });

  return (
    <div class="themed-content">
      {children}
    </div>
  );
});

/* ========================================
   THEME UTILITIES
   ======================================== */

/**
 * Get theme-aware color value for a semantic color
 */
export const getThemeColor = (
  colorName: string, 
  shade: SemanticShade = 'normal',
  themeContext: ThemeContext = 'clinical'
): string => {
  // This would be used in JavaScript when you need programmatic access to themed colors
  // Returns CSS custom property reference
  return `var(--color-${colorName}-${shade})`;
};

/**
 * Check if current theme has high contrast enabled
 */
export const isHighContrastTheme = (themeContext: ThemeContext): boolean => {
  return themeContext === 'high-contrast' || themePresets[themeContext].contrastBoost >= 1.3;
};

/**
 * Get clinical priority color mapping
 */
export const getClinicalPriorityColor = (priority: 'critical' | 'urgent' | 'routine' | 'stable'): string => {
  const colorMap = {
    critical: 'error',
    urgent: 'warning', 
    routine: 'info',
    stable: 'success',
  };
  
  return colorMap[priority];
};

/* ========================================
   EMERGENCY THEME OVERRIDE
   ======================================== */

/**
 * Emergency theme override for patient safety situations
 * Applies maximum contrast and visibility regardless of current theme
 */
export const applyEmergencyThemeOverride = () => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('theme-emergency-override');
  }
};

export const removeEmergencyThemeOverride = () => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('theme-emergency-override');
  }
};

/* ========================================
   EXPORTS
   ======================================== */

export default ThemeProvider;
