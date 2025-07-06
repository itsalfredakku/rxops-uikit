import { component$, Slot, $, type QRL, useSignal, useStore } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import { Icon, type IconName } from "../../atoms/icon";
import { Text } from "../../atoms/text/text";
import { hipaaAuditor } from "../../../utils/hipaa";

export interface TagProps extends BaseComponentProps<HTMLSpanElement> {
  /** Visual variant of the tag */
  variant?: 'solid' | 'outlined' | 'soft' | 'flat' | 'medical';
  /** Color scheme */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  /** Size of the tag */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Icon to display before the text */
  icon?: IconName;
  /** Whether the tag can be removed */
  removable?: boolean;
  /** Whether the tag is disabled */
  disabled?: boolean;
  /** Whether the tag is clickable */
  clickable?: boolean;
  /** Text content of the tag */
  label?: string;
  /** Callback when tag is clicked */
  onClick$?: QRL<() => void>;
  /** Callback when tag is removed */
  onRemove$?: QRL<() => void>;
  /** Healthcare-specific props */
  healthcare?: {
    type: 'allergy' | 'medication' | 'condition' | 'procedure' | 'symptom' | 'category';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    patientId?: string;
  };
  /** Medical device keyboard support with enhanced focus indicators */
  medicalDeviceMode?: boolean;
  /** Enable healthcare workflow shortcuts */
  enableWorkflowShortcuts?: boolean;
  /** Tag context for healthcare applications */
  tagContext?: 'allergy' | 'medication' | 'diagnosis' | 'treatment' | 'lab-result' | 'vital-sign' | 'default';
}

export const Tag = component$<TagProps>((props) => {
  const {
    medicalDeviceMode = false,
    enableWorkflowShortcuts = false,
    tagContext = 'default',
    ...rest
  } = props;

  // Enhanced keyboard state for medical devices
  const keyboardState = useStore({
    hasFocus: false,
    shortcutPressed: false,
    confirmingRemoval: false
  });

  // Enhanced keyboard support for medical devices
  const handleKeyDown = $((event: KeyboardEvent) => {
    // Universal Enter/Space activation
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!props.disabled && props.clickable && props.onClick$) {
        handleClick();
      }
    }
    
    // Enhanced removal with confirmation in medical device mode
    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (props.removable && !props.disabled) {
        event.preventDefault();
        if (medicalDeviceMode && tagContext !== 'default') {
          // Show confirmation for medical tags
          keyboardState.confirmingRemoval = true;
          setTimeout(() => keyboardState.confirmingRemoval = false, 2000);
        } else {
          handleRemove(event);
        }
      }
    }

    // Confirm removal on second Delete press
    if ((event.key === 'Delete' || event.key === 'Backspace') && keyboardState.confirmingRemoval) {
      event.preventDefault();
      keyboardState.confirmingRemoval = false;
      handleRemove(event);
    }
    
    // Escape key for quick navigation
    if (event.key === 'Escape') {
      event.preventDefault();
      keyboardState.confirmingRemoval = false;
      (event.target as HTMLElement).blur();
    }

    // Healthcare workflow shortcuts
    if (enableWorkflowShortcuts && (event.ctrlKey || event.metaKey)) {
      switch (event.key.toLowerCase()) {
        case 'c':
          // Copy tag information
          if (medicalDeviceMode && props.label) {
            event.preventDefault();
            keyboardState.shortcutPressed = true;
            setTimeout(() => keyboardState.shortcutPressed = false, 200);
          }
          break;
        case 'i':
          // Toggle tag information
          if (medicalDeviceMode) {
            event.preventDefault();
            keyboardState.shortcutPressed = true;
            setTimeout(() => keyboardState.shortcutPressed = false, 200);
          }
          break;
      }
    }
  });

  const handleFocus = $(() => {
    keyboardState.hasFocus = true;
  });

  const handleBlur = $(() => {
    keyboardState.hasFocus = false;
    keyboardState.confirmingRemoval = false;
  });

  const handleClick = $(() => {
    if (!props.disabled && props.clickable && props.onClick$) {
      // HIPAA audit for healthcare tags
      if (props.healthcare) {
        hipaaAuditor.logAccess({
          action: 'click',
          component: 'tag',
          itemId: props.label || 'unknown',
          category: props.healthcare.type,
          patientId: props.healthcare.patientId,
          timestamp: new Date().toISOString()
        });
      }
      
      props.onClick$();
    }
  });

  const handleRemove = $((e: Event) => {
    e.stopPropagation();
    if (!props.disabled && props.onRemove$) {
      // HIPAA audit for healthcare tags
      if (props.healthcare) {
        hipaaAuditor.logAccess({
          action: 'remove',
          component: 'tag',
          itemId: props.label || 'unknown',
          category: props.healthcare.type,
          patientId: props.healthcare.patientId,
          timestamp: new Date().toISOString()
        });
      }
      
      props.onRemove$();
    }
  });

  // Base size classes
  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-xs gap-1",
    sm: "px-2 py-1 text-xs gap-1.5", 
    md: "px-2.5 py-1.5 text-sm gap-2",
    lg: "px-3 py-2 text-base gap-2.5"
  };

  // Variant and color combinations
  const getVariantClasses = () => {
    const color = props.color || 'neutral';
    const variant = props.variant || 'soft';
    
    const baseClasses = "inline-flex items-center font-medium rounded-full transition-all duration-200";
    
    // Healthcare severity overrides for medical variant
    if (props.variant === 'medical' && props.healthcare?.severity) {
      const severityColors = {
        low: 'bg-success-100 text-success-800 border-success-light',
        medium: 'bg-warning-100 text-warning-800 border-warning-light',
        high: 'bg-warning-lighter text-warning-darker border-warning-light',
        critical: 'bg-error-100 text-error-800 border-error-light animate-pulse'
      };
      return `${baseClasses} border ${severityColors[props.healthcare.severity]}`;
    }
    
    // Standard color mappings
    const colorMap = {
      primary: {
        solid: 'bg-primary-600 text-white hover:bg-primary-700',
        outlined: 'border border-primary-600 text-primary-600 hover:bg-primary-50',
        soft: 'bg-primary-100 text-primary-700 hover:bg-primary-200',
        flat: 'bg-primary-50 text-primary-600',
        medical: 'bg-primary-50 text-primary-700 border border-primary-200'
      },
      secondary: {
        solid: 'bg-secondary-600 text-white hover:bg-secondary-700',
        outlined: 'border border-secondary-600 text-secondary-600 hover:bg-secondary-50',
        soft: 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200',
        flat: 'bg-secondary-50 text-secondary-600',
        medical: 'bg-secondary-50 text-secondary-700 border border-secondary-200'
      },
      success: {
        solid: 'bg-success-600 text-white hover:bg-success-700',
        outlined: 'border border-success-normal text-success-normal hover:bg-success-lighter',
        soft: 'bg-success-100 text-success-700 hover:bg-success-200',
        flat: 'bg-success-50 text-success-normal',
        medical: 'bg-success-50 text-success-700 border border-success-light'
      },
      warning: {
        solid: 'bg-warning-600 text-white hover:bg-warning-700',
        outlined: 'border border-warning-normal text-warning-600 hover:bg-warning-50',
        soft: 'bg-warning-100 text-warning-700 hover:bg-warning-200',
        flat: 'bg-warning-50 text-warning-600',
        medical: 'bg-warning-50 text-warning-700 border border-warning-light'
      },
      error: {
        solid: 'bg-error-600 text-white hover:bg-error-700',
        outlined: 'border border-error-normal text-error-600 hover:bg-error-50',
        soft: 'bg-error-100 text-error-700 hover:bg-error-200',
        flat: 'bg-error-50 text-error-600',
        medical: 'bg-error-50 text-error-700 border border-error-light'
      },
      info: {
        solid: 'bg-primary-600 text-white hover:bg-primary-700',
        outlined: 'border border-primary-600 text-primary-600 hover:bg-primary-50',
        soft: 'bg-primary-100 text-primary-700 hover:bg-primary-200',
        flat: 'bg-primary-50 text-primary-600',
        medical: 'bg-primary-50 text-primary-700 border border-primary-200'
      },
      neutral: {
        solid: 'bg-neutral-dark text-white hover:bg-neutral-darker',
        outlined: 'border border-neutral-dark text-neutral-normal hover:bg-neutral-lighter',
        soft: 'bg-neutral-lighter text-neutral-dark hover:bg-neutral-light',
        flat: 'bg-neutral-lighter text-neutral-normal',
        medical: 'bg-neutral-lighter text-neutral-dark border border-neutral-light'
      }
    };

    return `${baseClasses} ${colorMap[color][variant]}`;
  };

  // Icon size based on tag size
  const getIconSize = () => {
    const sizeMap = {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18
    };
    return sizeMap[props.size || 'md'];
  };

  const Component = props.clickable && !props.disabled ? 'button' : 'span';

  // Enhanced ARIA attributes for medical contexts
  const ariaLabel = medicalDeviceMode 
    ? `${tagContext} tag: ${props.label}${props.removable ? ' - Press Delete to remove' : ''}`
    : props.label;

  const ariaDescription = [
    medicalDeviceMode && 'Medical device mode enabled',
    enableWorkflowShortcuts && 'Ctrl+C copy, Ctrl+I info, Delete to remove',
    keyboardState.confirmingRemoval && 'Press Delete again to confirm removal'
  ].filter(Boolean).join('. ');

  return (
    <div class="themed-content">
      <Component
        type={props.clickable ? 'button' : undefined}
        class={mergeClasses(
          getVariantClasses(),
          sizeClasses[props.size || 'md'],
          props.clickable && !props.disabled ? 'cursor-pointer' : '',
          props.disabled ? 'opacity-50 cursor-not-allowed' : '',
          // Medical device focus indicators
          medicalDeviceMode && [
            'focus:outline-none focus:ring-4 focus:ring-primary-500/50 focus:ring-offset-2',
            'focus:shadow-lg focus:z-10'
          ],
          keyboardState.hasFocus && medicalDeviceMode && [
            'ring-4 ring-primary-200 shadow-lg',
            tagContext !== 'default' && 'ring-info-light'
          ],
          keyboardState.shortcutPressed && 'ring-success-light ring-4',
          keyboardState.confirmingRemoval && 'ring-error-light ring-4 animate-pulse',
          medicalDeviceMode && 'medical-device-tag',
          tagContext !== 'default' && `tag-context-${tagContext}`,
          props.class
        )}
        onClick$={props.clickable ? handleClick : undefined}
        onKeyDown$={medicalDeviceMode ? handleKeyDown : undefined}
        onFocus$={medicalDeviceMode ? handleFocus : undefined}
        onBlur$={medicalDeviceMode ? handleBlur : undefined}
        disabled={props.disabled}
        tabIndex={medicalDeviceMode && (props.clickable || props.removable) ? 0 : undefined}
        role={medicalDeviceMode ? 'button' : undefined}
        aria-label={ariaLabel}
        aria-describedby={ariaDescription ? 'tag-description' : undefined}
        data-medical-device={medicalDeviceMode}
        data-healthcare-element="tag"
        data-healthcare-size={props.size || 'md'}
        {...rest}
      >
      {/* Icon */}
      {props.icon && (
        <Icon 
          icon={props.icon} 
          size={getIconSize()}
          class="flex-shrink-0"
        />
      )}
      
      {/* Content */}
      {props.label ? (
        <Text 
          class="truncate" 
          style="inherit"
        >
          {props.label}
        </Text>
      ) : (
        <Slot />
      )}
      
      {/* Remove Button */}
      {props.removable && !props.disabled && (
        <button
          type="button"
          class={mergeClasses(
            "ml-1 -mr-1 p-0.5 rounded-full transition-colors duration-200",
            "hover:bg-black/10 focus:outline-none focus:bg-black/10",
            "flex-shrink-0",
            medicalDeviceMode && [
              'focus:ring-2 focus:ring-error-normal focus:ring-offset-1',
              keyboardState.confirmingRemoval && 'bg-error-lighter ring-2 ring-error-normal'
            ]
          )}
          onClick$={handleRemove}
          onKeyDown$={medicalDeviceMode ? handleKeyDown : undefined}
          tabIndex={medicalDeviceMode ? 0 : -1}
          aria-label={`Remove ${props.label || 'tag'}${medicalDeviceMode ? ' - Press Delete or click' : ''}`}
          role={medicalDeviceMode ? 'button' : undefined}
        >
          <Icon 
            icon="x" 
            size={getIconSize() - 2}
          />
        </button>
      )}
      
      {/* Medical device shortcuts help */}
      {medicalDeviceMode && enableWorkflowShortcuts && keyboardState.hasFocus && (
        <div 
          id="tag-description" 
          class="sr-only"
          aria-live="polite"
        >
          Tag shortcuts: Ctrl+C copy, Ctrl+I info, Delete to remove
        </div>
      )}

      {/* Removal confirmation indicator */}
      {medicalDeviceMode && keyboardState.confirmingRemoval && (
        <div 
          class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-error-lighter border border-error-light rounded px-2 py-1 text-xs text-error-darker z-10 animate-pulse"
          role="status"
          aria-live="assertive"
        >
          Press Delete again to remove
        </div>
      )}

      {/* Shortcut pressed indicator */}
      {medicalDeviceMode && keyboardState.shortcutPressed && (
        <div 
          class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-success-lighter border border-success-light rounded px-2 py-1 text-xs text-success-darker z-10"
          role="status"
          aria-live="polite"
        >
          Shortcut activated
        </div>
      )}
    </Component>
    </div>
  );
});

// Multi-tag container component for managing collections
export interface TagGroupProps {
  /** Array of tag data */
  tags?: Array<{
    id: string;
    label: string;
    icon?: IconName;
    color?: TagProps['color'];
    variant?: TagProps['variant'];
    removable?: boolean;
  }>;
  /** Size for all tags in the group */
  size?: TagProps['size'];
  /** Whether to wrap tags to multiple lines */
  wrap?: boolean;
  /** Maximum number of tags to show before truncating */
  maxVisible?: number;
  /** CSS class names to apply */
  class?: string;
  /** Callback when a tag is removed */
  onRemove$?: QRL<(tagId: string) => void>;
  /** Callback when a tag is clicked */
  onTagClick$?: QRL<(tagId: string) => void>;
  /** Medical device keyboard support */
  medicalDeviceMode?: boolean;
  /** Enable healthcare workflow shortcuts */
  enableWorkflowShortcuts?: boolean;
  /** Tag context for healthcare applications */
  tagContext?: TagProps['tagContext'];
}

export const TagGroup = component$<TagGroupProps>((props) => {
  const {
    medicalDeviceMode = false,
    enableWorkflowShortcuts = false,
    tagContext = 'default',
    ...rest
  } = props;

  const visibleTags = props.maxVisible ? 
    props.tags?.slice(0, props.maxVisible) : 
    props.tags;
  
  const hiddenCount = props.maxVisible && props.tags ? 
    Math.max(0, props.tags.length - props.maxVisible) : 
    0;

  // Enhanced keyboard state for medical devices
  const keyboardState = useStore({
    focusedTagIndex: -1,
    hasFocus: false
  });

  // Enhanced keyboard support for tag group navigation
  const handleKeyDown = $((event: KeyboardEvent) => {
    if (medicalDeviceMode && props.tags && props.tags.length > 0) {
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          keyboardState.focusedTagIndex = Math.min(props.tags.length - 1, keyboardState.focusedTagIndex + 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          keyboardState.focusedTagIndex = Math.max(0, keyboardState.focusedTagIndex - 1);
          break;
        case 'Home':
          event.preventDefault();
          keyboardState.focusedTagIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          keyboardState.focusedTagIndex = props.tags.length - 1;
          break;
        case 'Escape':
          keyboardState.focusedTagIndex = -1;
          (event.target as HTMLElement).blur();
          break;
      }
    }
  });

  // Extract custom props that shouldn't be passed to div
  const { tags: _tags, size, wrap, maxVisible: _maxVisible, onRemove$, onTagClick$, class: className, ...divProps } = rest;

  return (
    <div class="themed-content">
      <div 
        class={mergeClasses(
          "tag-group flex gap-2",
          wrap ? "flex-wrap" : "flex-nowrap",
          medicalDeviceMode && "medical-device-mode",
          tagContext !== 'default' && `tag-group-context-${tagContext}`,
          className
        )}
        onKeyDown$={medicalDeviceMode ? handleKeyDown : undefined}
        tabIndex={medicalDeviceMode ? 0 : undefined}
        role={medicalDeviceMode ? 'group' : undefined}
        aria-label={medicalDeviceMode 
          ? `${tagContext} tag group - ${props.tags?.length || 0} tags. Use arrow keys to navigate.`
          : undefined
        }
        data-medical-device={medicalDeviceMode}
        {...divProps}
      >
      {props.tags ? (
        <>
          {visibleTags?.map((tag, index) => (
            <Tag
              key={tag.id}
              label={tag.label}
              icon={tag.icon}
              color={tag.color}
              variant={tag.variant}
              size={size}
              removable={tag.removable}
              clickable={!!onTagClick$}
              medicalDeviceMode={medicalDeviceMode}
              enableWorkflowShortcuts={enableWorkflowShortcuts}
              tagContext={tagContext}
              class={keyboardState.focusedTagIndex === index && medicalDeviceMode ? "keyboard-focused" : ""}
              onClick$={() => onTagClick$?.(tag.id)}
              onRemove$={() => onRemove$?.(tag.id)}
            />
          ))}
          
          {hiddenCount > 0 && (
            <Tag
              label={`+${hiddenCount} more`}
              size={size}
              variant="outlined"
              color="neutral"
              medicalDeviceMode={medicalDeviceMode}
              tagContext={tagContext}
            />
          )}
        </>
      ) : (
        <Slot />
      )}
      
      {/* Medical device keyboard shortcuts help */}
      {medicalDeviceMode && enableWorkflowShortcuts && (
        <div 
          class="sr-only"
          aria-live="polite"
        >
          Tag group navigation: Arrow keys to move between tags, Enter to select, Delete to remove
        </div>
      )}
    </div>
    </div>
  );
});

export default Tag;
