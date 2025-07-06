import { component$, Slot, $, useStore, useSignal } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses, mergeStyles } from "../../../design-system/props";

export type ListVariant = "default" | "ordered" | "unordered" | "none";
export type ListSize = "sm" | "md" | "lg";

export interface ListProps extends Omit<BaseComponentProps<HTMLUListElement>, 'size'> {
  variant?: ListVariant;
  size?: ListSize;
  items?: string[];
  /** Medical device keyboard support with enhanced focus indicators */
  medicalDeviceMode?: boolean;
  /** Emergency mode for critical medical lists */
  emergencyMode?: boolean;
  /** List context for healthcare applications */
  listContext?: 'patient-list' | 'medication-list' | 'allergy-list' | 'procedure-list' | 'provider-list' | 'emergency-contacts' | 'default';
  /** Enable healthcare workflow shortcuts */
  enableWorkflowShortcuts?: boolean;
  /** Allow keyboard navigation with arrow keys */
  keyboardNavigable?: boolean;
  /** Multi-selection support for medical workflows */
  multiSelect?: boolean;
  /** Show item numbers for medical reference */
  showItemNumbers?: boolean;
}

export const List = component$<ListProps>((props) => {
  const { 
    variant = "default", 
    size = "md", 
    items,
    medicalDeviceMode = false,
    emergencyMode = false,
    listContext = 'default',
    enableWorkflowShortcuts = false,
    keyboardNavigable = false,
    multiSelect = false,
    showItemNumbers = false,
    class: qwikClass,
    className,
    style,
    onKeyDown$,
    ...rest
  } = props;

  // Enhanced keyboard state for medical devices
  const keyboardState = useStore({
    currentIndex: -1,
    selectedItems: [] as number[],
    emergencyHighlight: false,
    shortcutPressed: false,
    searchQuery: '',
    searchTimeout: null as any
  });

  const listRef = useSignal<HTMLElement>();

  // Enhanced keyboard support for medical devices
  const handleKeyDown = $((event: KeyboardEvent) => {
    if (event.defaultPrevented) return;

    // Quick search functionality for medical lists
    if (medicalDeviceMode && /^[a-zA-Z0-9]$/.test(event.key)) {
      keyboardState.searchQuery += event.key.toLowerCase();
      
      // Clear search after 1 second
      if (keyboardState.searchTimeout) {
        clearTimeout(keyboardState.searchTimeout);
      }
      keyboardState.searchTimeout = setTimeout(() => {
        keyboardState.searchQuery = '';
      }, 1000);

      // Find matching item
      if (items) {
        const matchIndex = items.findIndex((item, index) => 
          index > keyboardState.currentIndex && 
          item.toLowerCase().startsWith(keyboardState.searchQuery)
        );
        if (matchIndex !== -1) {
          keyboardState.currentIndex = matchIndex;
        }
      }
      return;
    }

    // Healthcare workflow shortcuts
    if (enableWorkflowShortcuts) {
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      
      if (isCtrlOrCmd) {
        switch (event.key.toLowerCase()) {
          case 'a':
            // Select all items
            if (multiSelect && items) {
              event.preventDefault();
              keyboardState.selectedItems = items.map((_, index) => index);
              keyboardState.shortcutPressed = true;
              setTimeout(() => keyboardState.shortcutPressed = false, 200);
            }
            break;
          case 'e':
            // Emergency action
            if (emergencyMode) {
              event.preventDefault();
              keyboardState.emergencyHighlight = true;
              setTimeout(() => keyboardState.emergencyHighlight = false, 1000);
            }
            break;
          case 'f':
            // Focus search (for future search implementation)
            event.preventDefault();
            keyboardState.searchQuery = '';
            break;
        }
      }
    }

    // Keyboard navigation for medical devices
    if (keyboardNavigable && items) {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          keyboardState.currentIndex = Math.min(items.length - 1, keyboardState.currentIndex + 1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          keyboardState.currentIndex = Math.max(0, keyboardState.currentIndex - 1);
          break;
        case 'Home':
          event.preventDefault();
          keyboardState.currentIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          keyboardState.currentIndex = items.length - 1;
          break;
        case 'PageDown':
          event.preventDefault();
          keyboardState.currentIndex = Math.min(items.length - 1, keyboardState.currentIndex + 10);
          break;
        case 'PageUp':
          event.preventDefault();
          keyboardState.currentIndex = Math.max(0, keyboardState.currentIndex - 10);
          break;
        case 'Enter':
        case ' ':
          // Select/deselect item
          if (multiSelect && keyboardState.currentIndex >= 0) {
            event.preventDefault();
            const index = keyboardState.currentIndex;
            if (keyboardState.selectedItems.includes(index)) {
              keyboardState.selectedItems = keyboardState.selectedItems.filter(i => i !== index);
            } else {
              keyboardState.selectedItems = [...keyboardState.selectedItems, index];
            }
          }
          break;
        case 'Escape':
          // Clear selection and highlights
          keyboardState.currentIndex = -1;
          keyboardState.selectedItems = [];
          keyboardState.emergencyHighlight = false;
          keyboardState.searchQuery = '';
          break;
      }
    }

    // Context-specific shortcuts
    switch (listContext) {
      case 'emergency-contacts':
        if (event.key === 'F1') {
          event.preventDefault();
          keyboardState.emergencyHighlight = true;
        }
        break;
      case 'medication-list':
        if (event.key === 'F2') {
          event.preventDefault();
          // In real implementation, this would open medication details
          keyboardState.shortcutPressed = true;
        }
        break;
      case 'allergy-list':
        if (event.key === 'F3') {
          event.preventDefault();
          // In real implementation, this would highlight allergies
          keyboardState.emergencyHighlight = true;
        }
        break;
    }
  });
  
  const Tag = variant === "ordered" ? "ol" : "ul";
  
  const variantClasses = {
    default: "list-none",
    ordered: "list-decimal list-inside",
    unordered: "list-disc list-inside", 
    none: "list-none",
  };
  
  const sizeClasses = {
    sm: "text-sm space-y-1",
    md: "text-base space-y-2",
    lg: "text-lg space-y-3",
  };

  const contextClasses = {
    'patient-list': 'medical-patient-list',
    'medication-list': 'medical-medication-list',
    'allergy-list': 'medical-allergy-list',
    'procedure-list': 'medical-procedure-list',
    'provider-list': 'medical-provider-list',
    'emergency-contacts': 'medical-emergency-contacts',
    'default': 'medical-default-list'
  };
  
  const listClasses = mergeClasses(
    "ui-list",
    variantClasses[variant],
    sizeClasses[size],
    medicalDeviceMode && "medical-device-mode",
    emergencyMode && "emergency-mode",
    listContext !== 'default' && contextClasses[listContext],
    keyboardNavigable && "keyboard-navigable",
    multiSelect && "multi-select",
    enableWorkflowShortcuts && "workflow-shortcuts-enabled",
    keyboardState.emergencyHighlight && "emergency-highlight",
    keyboardState.shortcutPressed && "shortcut-pressed",
    qwikClass,
    className
  );

  // Enhanced ARIA attributes for medical contexts
  const listRole = keyboardNavigable ? 'listbox' : 'list';
  const ariaLabel = medicalDeviceMode 
    ? `${listContext} - Medical device mode enabled${multiSelect ? ' - Multi-select' : ''}`
    : undefined;

  const ariaDescription = [
    emergencyMode && 'Emergency list',
    enableWorkflowShortcuts && 'Ctrl+A select all, Ctrl+F search',
    keyboardNavigable && 'Arrow keys to navigate, Enter to select',
    listContext !== 'default' && `${listContext} context`
  ].filter(Boolean).join('. ');

  // Merge styles if provided
  const finalStyle = mergeStyles(undefined, style);
  
  return (
    <div class="themed-content">
      <Tag 
        ref={listRef}
        class={listClasses}
        style={finalStyle}
        onKeyDown$={handleKeyDown}
        role={listRole}
        aria-label={ariaLabel}
        aria-describedby={ariaDescription ? 'list-description' : undefined}
        aria-multiselectable={multiSelect}
        tabIndex={keyboardNavigable && medicalDeviceMode ? 0 : undefined}
        {...rest}
      >
        {items ? (
          items.map((item, index) => (
            <li 
              key={index} 
              class={mergeClasses(
                "ui-list-item",
                keyboardState.currentIndex === index && keyboardNavigable && "keyboard-focused",
                keyboardState.selectedItems.includes(index) && multiSelect && "selected",
                medicalDeviceMode && "medical-device-item"
              )}
              role={keyboardNavigable ? 'option' : undefined}
              aria-selected={multiSelect ? keyboardState.selectedItems.includes(index) : undefined}
              data-index={index}
            >
              {showItemNumbers && (
                <span class="item-number mr-2 text-neutral-normal">
                  {(variant === 'ordered' ? index + 1 : '•')}
                </span>
              )}
              {multiSelect && (
                <span class="selection-indicator mr-2" aria-hidden="true">
                  {keyboardState.selectedItems.includes(index) ? '✓' : '○'}
                </span>
              )}
              {item}
            </li>
          ))
        ) : (
          <Slot />
        )}
      </Tag>

      {/* Search indicator for medical devices */}
      {medicalDeviceMode && keyboardState.searchQuery && (
        <div 
          class="search-indicator absolute top-0 right-0 bg-primary-100 border border-primary-300 rounded px-2 py-1 text-sm"
          role="status"
          aria-live="polite"
        >
          Search: {keyboardState.searchQuery}
        </div>
      )}

      {/* Medical device keyboard shortcuts help */}
      {medicalDeviceMode && enableWorkflowShortcuts && (
        <div 
          id="list-description"
          class="sr-only"
          aria-live="polite"
        >
          {ariaDescription}
        </div>
      )}
    </div>
  );
});

export const ListItem = component$<{ 
  class?: string;
  selected?: boolean;
  disabled?: boolean;
  medicalDeviceMode?: boolean;
  itemContext?: 'medication' | 'allergy' | 'procedure' | 'provider' | 'emergency-contact' | 'default';
}>(({ class: className, selected, disabled, medicalDeviceMode, itemContext = 'default' }) => {
  
  const itemClasses = mergeClasses(
    "ui-list-item",
    selected && "selected",
    disabled && "disabled",
    medicalDeviceMode && "medical-device-item",
    itemContext !== 'default' && `item-context-${itemContext}`,
    className
  );

  return (
    <li 
      class={itemClasses}
      aria-selected={selected}
      aria-disabled={disabled}
      role={medicalDeviceMode ? 'option' : undefined}
    >
      {selected && (
        <span class="selection-indicator mr-2" aria-hidden="true">✓</span>
      )}
      <Slot />
    </li>
  );
});
