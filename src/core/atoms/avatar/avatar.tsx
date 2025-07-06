import { component$, $, useStore } from '@builder.io/qwik';
import type { ComponentSize } from '../../../design-system/types';
import { BaseComponentProps, mergeClasses } from '../../../design-system/props';
import { Icon } from '../icon';

export type AvatarVariant = "circular" | "rounded" | "square";

export interface AvatarProps extends BaseComponentProps<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: ComponentSize;
  variant?: AvatarVariant;
  name?: string;
  fallbackIcon?: string;
  /** Whether the avatar is interactive (clickable/focusable) */
  interactive?: boolean;
  /** Click handler for interactive avatars */
  onClick$?: (event: MouseEvent) => void;
  /** Medical device keyboard support with enhanced focus indicators */
  medicalDeviceMode?: boolean;
  /** Emergency mode for critical medical contexts */
  emergencyMode?: boolean;
  /** Healthcare workflow shortcuts */
  enableWorkflowShortcuts?: boolean;
  /** Avatar purpose for healthcare contexts */
  purpose?: 'profile' | 'patient' | 'doctor' | 'staff' | 'emergency' | 'general';
  /** Status indicator for medical personnel */
  status?: 'online' | 'busy' | 'away' | 'offline' | 'emergency';
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const sizeClasses: Record<ComponentSize, string> = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-xl"
};

const variantClasses: Record<AvatarVariant, string> = {
  circular: "rounded-full",
  rounded: "rounded-md",
  square: "rounded-sm"
};

const getAvatarClasses = (
  size: ComponentSize, 
  variant: AvatarVariant, 
  interactive: boolean = false,
  className?: string
) => {
  return mergeClasses(
    "inline-flex items-center justify-center bg-primary-100 text-primary-700 font-medium overflow-hidden relative flex-shrink-0",
    sizeClasses[size],
    variantClasses[variant],
    interactive && [
      'cursor-pointer transition-all duration-200',
      'hover:scale-105 hover:shadow-lg',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
    ],
    className
  );
};

// Status indicator colors for medical personnel
const statusColors = {
  online: 'bg-success-normal',
  busy: 'bg-error-normal', 
  away: 'bg-warning-normal',
  offline: 'bg-neutral-normal',
  emergency: 'bg-warning-normal animate-pulse'
};

/**
 * Avatar component with Medical Device Keyboard Accessibility.
 * 
 * Medical Device Keyboard Accessibility (for interactive avatars):
 * - Enter/Space: Activate avatar action (when interactive=true)
 * - Enhanced focus indicators for clinical environments
 * - Status indicators for medical personnel availability
 * - WCAG 2.1 AA+ compliance with Section 508 support
 * - Screen reader optimization for medical workflows
 */
export const Avatar = component$<AvatarProps>((props) => {
  const {
    src,
    alt,
    size = "md",
    variant = "circular",
    name,
    fallbackIcon,
    interactive = false,
    onClick$,
    medicalDeviceMode = false,
    emergencyMode = false,
    enableWorkflowShortcuts = true,
    purpose = 'general',
    status,
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  // Medical device keyboard accessibility state
  const keyboardState = useStore({
    hasFocus: false,
    isEmergencyMode: emergencyMode,
    shortcutPressed: false
  });

  // Enhanced keyboard navigation for medical devices
  const handleKeyDown = $((event: KeyboardEvent) => {
    if (!interactive || !enableWorkflowShortcuts) return;
    
    switch (event.key) {
      case 'Enter':
      case ' ':
        // Primary activation - Enter and Space both activate
        event.preventDefault();
        if (onClick$) {
          const syntheticEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            detail: 1,
            clientX: 0,
            clientY: 0
          });
          onClick$(syntheticEvent);
        }
        break;
    }
    
    // Enhanced visual feedback for medical devices
    if ((event.ctrlKey || event.metaKey) && medicalDeviceMode) {
      keyboardState.shortcutPressed = true;
      
      switch (event.key.toLowerCase()) {
        case 'e':
          // Ctrl+E: Toggle emergency mode
          event.preventDefault();
          keyboardState.isEmergencyMode = !keyboardState.isEmergencyMode;
          break;
      }
      
      // Reset shortcut state
      setTimeout(() => {
        keyboardState.shortcutPressed = false;
      }, 200);
    }
  });

  // Enhanced focus handlers for medical device accessibility
  const handleFocus = $(() => {
    if (interactive) {
      keyboardState.hasFocus = true;
    }
  });

  const handleBlur = $(() => {
    keyboardState.hasFocus = false;
  });

  // Handle click events
  const handleClick = $((event: MouseEvent) => {
    if (interactive && onClick$) {
      onClick$(event);
    }
  });

  const avatarClasses = mergeClasses(
    getAvatarClasses(size, variant, interactive, mergeClasses(qwikClass, className)),
    // Medical device enhanced focus indicators
    interactive && medicalDeviceMode && keyboardState.hasFocus && [
      'ring-4 ring-blue-200 shadow-xl scale-105'
    ],
    // Emergency mode styling
    keyboardState.isEmergencyMode && [
      'ring-2 ring-orange-400 bg-warning-lighter'
    ]
  );

  const displayName = alt || name || "User";
  const initials = name ? getInitials(name) : null;
  
  // Determine status indicator size based on avatar size
  const statusSize = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2', 
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  }[size];

  const avatarElement = (
    <div 
      class={avatarClasses} 
      style={style}
      role={interactive ? "button" : "img"}
      aria-label={
        interactive && medicalDeviceMode
          ? `${displayName} - Use Enter or Space to activate`
          : displayName
      }
      tabIndex={interactive ? 0 : undefined}
      onClick$={interactive ? handleClick : undefined}
      onKeyDown$={interactive ? handleKeyDown : undefined}
      onFocus$={interactive ? handleFocus : undefined}
      onBlur$={interactive ? handleBlur : undefined}
      data-medical-device={medicalDeviceMode}
      data-emergency-mode={keyboardState.isEmergencyMode}
      data-purpose={purpose}
      {...rest}
    >
      {src ? (
        <img
          src={src}
          alt={displayName}
          class="w-full h-full object-cover"
          loading="lazy"
          width="50"
          height="50"
        />
      ) : initials ? (
        <span class="select-none leading-none" aria-hidden="true">
          {initials}
        </span>
      ) : (
        <span class="select-none leading-none text-[0.8em] flex items-center justify-center" aria-hidden="true">
          {fallbackIcon || <Icon icon="user" class="w-4 h-4" />}
        </span>
      )}
      
      {/* Status indicator for medical personnel */}
      {status && (
        <div 
          class={`absolute -bottom-0.5 -right-0.5 ${statusSize} ${statusColors[status]} border-2 border-white rounded-full`}
          aria-label={`Status: ${status}`}
          title={`Status: ${status}`}
        />
      )}
      
      {/* Emergency mode indicator */}
      {keyboardState.isEmergencyMode && (
        <div class="absolute -top-1 -left-1 w-3 h-3 bg-warning-normal rounded-full border-2 border-white animate-pulse">
          <span class="sr-only">Emergency mode active</span>
        </div>
      )}
      
      {/* Medical device keyboard shortcut indicator */}
      {interactive && medicalDeviceMode && keyboardState.shortcutPressed && (
        <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-info-lighter text-primary-darker px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
          Shortcut Active
        </div>
      )}
    </div>
  );

  return (
    <div class="themed-content">
      <div class="relative inline-block">
        {avatarElement}
        
        {/* Medical device keyboard shortcuts help */}
        {interactive && medicalDeviceMode && enableWorkflowShortcuts && keyboardState.hasFocus && (
          <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-neutral-normal whitespace-nowrap bg-white px-2 py-1 rounded shadow-sm border">
            Keys: Enter/Space (activate), Ctrl+E (emergency)
          </div>
        )}
      </div>
    </div>
  );
});
