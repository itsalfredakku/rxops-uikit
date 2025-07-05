import { component$, useContext, $ } from '@builder.io/qwik';
import { ThemeContext, type ThemeContext as ThemeContextType, type ThemeMode } from './theme-provider';

/**
 * RxOps UIKit - Theme Toggle Component
 * Interactive theme switcher for healthcare applications
 */

export interface ThemeToggleProps {
  variant?: 'compact' | 'full' | 'tabs';
  showLabels?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const ThemeToggle = component$<ThemeToggleProps>(({
  variant = 'full',
  showLabels = true,
  orientation = 'horizontal',
  className = '',
}) => {
  const theme = useContext(ThemeContext);

  const contexts: Array<{
    value: ThemeContextType;
    icon: string;
    label: string;
    description: string;
  }> = [
    { 
      value: 'clinical', 
      icon: '🏥', 
      label: 'Clinical',
      description: 'Professional medical environment'
    },
    { 
      value: 'comfort', 
      icon: '🤗', 
      label: 'Comfort',
      description: 'Patient-facing interfaces'
    },
    { 
      value: 'high-contrast', 
      icon: '👁️', 
      label: 'High Contrast',
      description: 'Maximum accessibility'
    },
    { 
      value: 'vibrant', 
      icon: '🎨', 
      label: 'Vibrant',
      description: 'Pediatric and wellness'
    },
  ];

  const modes: Array<{
    value: ThemeMode;
    icon: string;
    label: string;
  }> = [
    { value: 'light', icon: '🌞', label: 'Light' },
    { value: 'dark', icon: '🌙', label: 'Dark' },
    { value: 'system', icon: '🖥️', label: 'Auto' },
  ];

  const toggleMode = $(() => {
    const currentMode = theme.mode.value;
    if (currentMode === 'light') {
      theme.mode.value = 'dark';
    } else if (currentMode === 'dark') {
      theme.mode.value = 'system';
    } else {
      theme.mode.value = 'light';
    }
  });

  const setContext = $((newContext: ThemeContextType) => {
    theme.context.value = newContext;
  });

  const setMode = $((newMode: ThemeMode) => {
    theme.mode.value = newMode;
  });

  // Base classes
  const containerClasses = [
    'theme-toggle',
    `theme-toggle--${variant}`,
    `theme-toggle--${orientation}`,
    'flex gap-2 p-2 rounded-lg',
    'bg-base-lighter dark:bg-base-darker',
    'border border-base-light dark:border-base-dark',
    className
  ].filter(Boolean).join(' ');

  const buttonClasses = 'p-2 rounded transition-all duration-200 hover:bg-base-light dark:hover:bg-base-dark focus:ring-2 focus:ring-primary-normal';
  const activeButtonClasses = 'bg-primary-lighter dark:bg-primary-darker text-primary-dark dark:text-primary-light';

  if (variant === 'compact') {
    return (
      <div class={containerClasses}>
        {/* Quick mode toggle only */}
        <button
          onClick$={toggleMode}
          class={buttonClasses}
          aria-label="Toggle theme mode"
          title={`Current: ${theme.mode.value} (${theme.effectiveMode.value})`}
        >
          {theme.effectiveMode.value === 'dark' ? '🌙' : '🌞'}
        </button>
        
        {/* Quick context indicator */}
        <div class="px-2 py-1 text-sm text-base-darker dark:text-base-lighter">
          {contexts.find(ctx => ctx.value === theme.context.value)?.icon}
        </div>
      </div>
    );
  }

  if (variant === 'tabs') {
    return (
      <div class={containerClasses}>
        {/* Context tabs */}
        <div class="flex gap-1">
          {contexts.map(ctx => (
            <button
              key={ctx.value}
              onClick$={() => setContext(ctx.value)}
              class={[
                'px-3 py-2 rounded text-sm font-medium transition-all',
                theme.context.value === ctx.value 
                  ? activeButtonClasses
                  : 'text-base-darker dark:text-base-lighter hover:bg-base-light dark:hover:bg-base-dark'
              ].join(' ')}
              aria-label={`Switch to ${ctx.label} theme`}
              title={ctx.description}
            >
              <span class="mr-1">{ctx.icon}</span>
              {showLabels && <span>{ctx.label}</span>}
            </button>
          ))}
        </div>
        
        {/* Mode toggle */}
        <div class="border-l border-base-light dark:border-base-dark pl-2">
          <button
            onClick$={toggleMode}
            class={buttonClasses}
            aria-label="Toggle theme mode"
            title={`Current: ${theme.mode.value}`}
          >
            {modes.find(mode => mode.value === theme.mode.value)?.icon}
          </button>
        </div>
      </div>
    );
  }

  // Full variant (default)
  return (
    <div class={containerClasses}>
      {/* Theme Context Selection */}
      <div class={orientation === 'vertical' ? 'flex flex-col gap-1' : 'flex gap-1'}>
        <label class="text-sm font-medium text-base-darker dark:text-base-lighter mb-1">
          Theme Context:
        </label>
        <div class={orientation === 'vertical' ? 'flex flex-col gap-1' : 'flex gap-1'}>
          {contexts.map(ctx => (
            <button
              key={ctx.value}
              onClick$={() => setContext(ctx.value)}
              class={[
                'px-3 py-2 rounded text-sm transition-all flex items-center gap-2',
                theme.context.value === ctx.value 
                  ? activeButtonClasses
                  : 'bg-base-light dark:bg-base-dark hover:bg-base-normal dark:hover:bg-base-normal'
              ].join(' ')}
              aria-label={`Switch to ${ctx.label} theme`}
              title={ctx.description}
            >
              <span class="text-lg">{ctx.icon}</span>
              {showLabels && (
                <div class="text-left">
                  <div class="font-medium">{ctx.label}</div>
                  <div class="text-xs opacity-75">{ctx.description}</div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Selection */}
      <div class="border-l border-base-light dark:border-base-dark pl-4">
        <label class="text-sm font-medium text-base-darker dark:text-base-lighter mb-1 block">
          Mode:
        </label>
        <div class={orientation === 'vertical' ? 'flex flex-col gap-1' : 'flex gap-1'}>
          {modes.map(mode => (
            <button
              key={mode.value}
              onClick$={() => setMode(mode.value)}
              class={[
                'px-3 py-2 rounded text-sm transition-all flex items-center gap-2',
                theme.mode.value === mode.value 
                  ? activeButtonClasses
                  : 'bg-base-light dark:bg-base-dark hover:bg-base-normal dark:hover:bg-base-normal'
              ].join(' ')}
              aria-label={`Switch to ${mode.label} mode`}
            >
              <span>{mode.icon}</span>
              {showLabels && <span>{mode.label}</span>}
            </button>
          ))}
        </div>
        
        {/* Current effective mode indicator */}
        <div class="mt-2 text-xs text-base-dark dark:text-base-light">
          Active: {theme.effectiveMode.value}
          {theme.mode.value === 'system' && (
            <span class="ml-1 opacity-75">(auto)</span>
          )}
        </div>
      </div>
    </div>
  );
});

/* ========================================
   THEME STATUS INDICATOR
   ======================================== */

export const ThemeStatusIndicator = component$(() => {
  const theme = useContext(ThemeContext);
  
  const contexts: Array<{
    value: ThemeContextType;
    icon: string;
    label: string;
    description: string;
  }> = [
    { 
      value: 'clinical', 
      icon: '🏥', 
      label: 'Clinical',
      description: 'Professional medical environment'
    },
    { 
      value: 'comfort', 
      icon: '🤗', 
      label: 'Comfort',
      description: 'Patient-facing interfaces'
    },
    { 
      value: 'high-contrast', 
      icon: '👁️', 
      label: 'High Contrast',
      description: 'Maximum accessibility'
    },
    { 
      value: 'vibrant', 
      icon: '🎨', 
      label: 'Vibrant',
      description: 'Pediatric and wellness'
    },
  ];
  
  const currentContext = contexts.find(ctx => ctx.value === theme.context.value);
  
  return (
    <div class="theme-status-indicator flex items-center gap-2 px-2 py-1 rounded bg-base-lighter dark:bg-base-darker text-sm">
      <span class="text-lg" title={currentContext?.description}>
        {currentContext?.icon}
      </span>
      <span class="text-base-darker dark:text-base-lighter">
        {currentContext?.label}
      </span>
      <span class="text-base-dark dark:text-base-light opacity-75">
        {theme.effectiveMode.value === 'dark' ? '🌙' : '🌞'}
      </span>
    </div>
  );
});

/* ========================================
   EMERGENCY THEME CONTROLS
   ======================================== */

export const EmergencyThemeControls = component$(() => {
  const applyEmergency = $(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('theme-emergency-override');
    }
  });

  const removeEmergency = $(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('theme-emergency-override');
    }
  });

  return (
    <div class="emergency-theme-controls flex gap-2 p-2 bg-error-lighter dark:bg-error-darker rounded border border-error-light dark:border-error-dark">
      <button
        onClick$={applyEmergency}
        class="px-3 py-1 bg-error-normal text-white rounded text-sm font-medium hover:bg-error-dark transition-colors"
      >
        🚨 Emergency Mode
      </button>
      <button
        onClick$={removeEmergency}
        class="px-3 py-1 bg-base-normal text-base-lighter rounded text-sm hover:bg-base-dark transition-colors"
      >
        Reset
      </button>
    </div>
  );
});

export default ThemeToggle;
