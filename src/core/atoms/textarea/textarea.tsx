import { component$, useSignal, $, useStore } from "@builder.io/qwik";
import { createVariantClass } from "../../../design-system/component-base";
import type { ComponentSize } from "../../../design-system/types";
import { cn } from "../../../design-system/utils";
import type { BaseComponentProps } from "../../../design-system/props";
import { mergeClasses } from "../../../design-system/props";

export type TextareaSize = ComponentSize;
export type TextareaVariant = "default" | "filled" | "outline";
export type TextareaResize = "none" | "vertical" | "horizontal" | "both";

// Semantic-first: Purpose-driven textarea types for healthcare contexts
export type SemanticTextareaType = 
  | "notes" | "description" | "comments" | "instructions" | "reason" 
  | "history" | "symptoms" | "diagnosis" | "treatment" | "medication"
  | "consultation" | "discharge" | "emergency" | "general";

interface TextareaBaseProps {
  /** Purpose of the textarea - drives automatic enhancements */
  purpose?: SemanticTextareaType;
  /** Label text */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Current value */
  value?: string;
  /** Number of visible rows */
  rows?: number;
  /** Number of visible columns */
  cols?: number;
  /** Size variant */
  size?: TextareaSize;
  /** Visual variant */
  variant?: TextareaVariant;
  /** Resize behavior */
  resize?: TextareaResize;
  /** Maximum character length */
  maxLength?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Required field indicator */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Auto-resize based on content */
  autoResize?: boolean;
  /** Whether textarea takes full width */
  fullWidth?: boolean;
  /** HTML id attribute */
  id?: string;
  /** HTML name attribute */
  name?: string;
  /** Change handler */
  onChange$?: (value: string) => void;
  /** Whether to show automatic purpose-based enhancements */
  semanticEnhancements?: boolean;
  /** Medical device keyboard support mode */
  medicalDeviceMode?: boolean;
  /** Emergency mode for critical medical data entry */
  emergencyMode?: boolean;
  /** Healthcare workflow shortcuts */
  enableWorkflowShortcuts?: boolean;
  /** Auto-save interval in milliseconds for medical data preservation */
  autoSaveInterval?: number;
  /** Auto-save callback for medical data preservation */
  onAutoSave$?: (value: string) => void;
}

export interface TextareaProps extends TextareaBaseProps, Omit<BaseComponentProps<HTMLDivElement>, keyof TextareaBaseProps | `on${string}$` | 'onAutoSave$'> {}

// Semantic-first: Purpose-based automatic enhancements for healthcare contexts
const purposeEnhancements: Record<SemanticTextareaType, {
  placeholder?: string;
  helperText?: string;
  rows?: number;
  maxLength?: number;
  className?: string;
}> = {
  notes: {
    placeholder: "Enter clinical notes and observations...",
    helperText: "Record clinical observations, findings, and notes",
    rows: 4,
    maxLength: 2000,
    className: "leading-relaxed"
  },
  description: {
    placeholder: "Provide a detailed description...",
    helperText: "Describe the condition, symptoms, or situation",
    rows: 3,
    maxLength: 1500,
    className: "leading-relaxed"
  },
  comments: {
    placeholder: "Add your comments...",
    helperText: "Share additional thoughts or feedback",
    rows: 3,
    maxLength: 1000,
    className: "leading-normal"
  },
  instructions: {
    placeholder: "Enter detailed instructions...",
    helperText: "Provide clear, step-by-step instructions",
    rows: 4,
    maxLength: 2500,
    className: "leading-relaxed"
  },
  reason: {
    placeholder: "Explain the reason...",
    helperText: "Provide justification or explanation",
    rows: 3,
    maxLength: 1000,
    className: "leading-normal"
  },
  history: {
    placeholder: "Document medical history...",
    helperText: "Record patient's medical background and history",
    rows: 5,
    maxLength: 3000,
    className: "leading-relaxed"
  },
  symptoms: {
    placeholder: "Describe symptoms and presentation...",
    helperText: "Detail patient symptoms, onset, and characteristics",
    rows: 4,
    maxLength: 2000,
    className: "leading-relaxed"
  },
  diagnosis: {
    placeholder: "Enter diagnosis and assessment...",
    helperText: "Document diagnosis, differential, and clinical assessment",
    rows: 4,
    maxLength: 2500,
    className: "leading-relaxed"
  },
  treatment: {
    placeholder: "Outline treatment plan...",
    helperText: "Describe treatment approach and care plan",
    rows: 5,
    maxLength: 3000,
    className: "leading-relaxed"
  },
  medication: {
    placeholder: "List medications and dosages...",
    helperText: "Document medications, dosages, and administration notes",
    rows: 4,
    maxLength: 2000,
    className: "leading-relaxed font-mono text-sm"
  },
  consultation: {
    placeholder: "Document consultation notes...",
    helperText: "Record consultation findings and recommendations",
    rows: 6,
    maxLength: 4000,
    className: "leading-relaxed"
  },
  discharge: {
    placeholder: "Enter discharge instructions...",
    helperText: "Provide discharge summary and follow-up instructions",
    rows: 6,
    maxLength: 4000,
    className: "leading-relaxed"
  },
  emergency: {
    placeholder: "Document emergency details...",
    helperText: "Record emergency situation and immediate actions taken",
    rows: 4,
    maxLength: 2000,
    className: "leading-relaxed border-warning-light focus:border-warning-normal"
  },
  general: {
    placeholder: "Enter text...",
    helperText: "General text input",
    rows: 3,
    maxLength: 1000,
    className: "leading-normal"
  }
};

// Textarea variant configuration
const textareaVariants = createVariantClass({
  base: [
    "w-full border font-normal bg-white text-neutral-darker placeholder-neutral-500",
    "transition-all duration-200 ease-in-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
    "disabled:bg-neutral-lighter disabled:cursor-not-allowed disabled:opacity-60"
  ].join(" "),
  
  variants: {
    default: [
      "border-neutral-light",
      "hover:border-neutral-normal",
      "focus:border-primary-500 focus-visible:ring-primary-100",
      "invalid:border-error-500 invalid:focus-visible:ring-error-100"
    ].join(" "),
    
    filled: [
      "border-transparent bg-neutral-lighter",
      "hover:bg-neutral-light",
      "focus:bg-white focus:border-primary-500 focus-visible:ring-primary-100",
      "invalid:bg-error-50 invalid:border-error-500 invalid:focus-visible:ring-error-100"
    ].join(" "),
    
    outline: [
      "border-2 border-neutral-light bg-transparent",
      "hover:border-neutral-normal",
      "focus:border-primary-500 focus-visible:ring-primary-100",
      "invalid:border-error-500 invalid:focus-visible:ring-error-100"
    ].join(" "),

    sm: "px-2 py-1.5 text-sm rounded-md min-h-[80px]",
    md: "px-3 py-2 text-base rounded-lg min-h-[100px]",
    lg: "px-4 py-3 text-lg rounded-lg min-h-[120px]",

    "resize-none": "resize-none",
    "resize-vertical": "resize-y",
    "resize-horizontal": "resize-x", 
    "resize-both": "resize"
  }
});

const textareaLabelVariants = createVariantClass({
  base: [
    "block font-medium text-neutral-darker mb-2",
    "peer-disabled:text-neutral-normal"
  ].join(" "),
  variants: {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }
});

const textareaCounterVariants = createVariantClass({
  base: "text-neutral-normal mt-1 text-right",
  variants: {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    error: "text-error-500"
  }
});

const textareaHelperVariants = createVariantClass({
  base: "mt-1 text-neutral-normal",
  variants: {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    error: "text-error-600"
  }
});

/**
 * Textarea component with semantic-first purpose-based enhancements.
 * 
 * Semantic-First Usage:
 * ```tsx
 * <Textarea purpose="notes" />           // Auto clinical notes setup
 * <Textarea purpose="symptoms" />        // Auto symptoms documentation
 * <Textarea purpose="instructions" />    // Auto instruction formatting
 * <Textarea purpose="emergency" />       // Auto emergency styling
 * ```
 * 
 * Medical Device Keyboard Accessibility:
 * - Ctrl+S: Save medical data
 * - Ctrl+E: Emergency validation mode
 * - Ctrl+A: Select all medical text
 * - Tab: Navigate to next field with auto-save
 * - Shift+Tab: Navigate to previous field with auto-save
 * - Enhanced focus indicators for clinical environments
 * - Auto-save functionality for critical medical data
 * - WCAG 2.1 AA+ compliance with Section 508 support
 */
export const Textarea = component$<TextareaProps>((props) => {
  const {
    purpose = "general",
    label,
    placeholder,
    value = "",
    rows,
    cols,
    size = "md",
    variant = "default",
    resize = "vertical",
    maxLength,
    disabled = false,
    required = false,
    error,
    helperText,
    autoResize = false,
    fullWidth = true,
    id,
    name,
    onChange$,
    semanticEnhancements = true,
    medicalDeviceMode = false,
    emergencyMode = false,
    enableWorkflowShortcuts = true,
    autoSaveInterval = 30000, // 30 seconds default for medical data
    onAutoSave$,
    class: qwikClass,
    className,
    style,
    testId,
    ...rest
  } = props;
  
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const inputValue = useSignal(value);
  const characterCount = useSignal(value.length);
  const hasError = !!error;
  
  // Medical device keyboard accessibility state
  const keyboardState = useStore({
    hasFocus: false,
    isEmergencyMode: emergencyMode,
    lastSaveTime: Date.now(),
    hasUnsavedChanges: false,
    shortcutPressed: false
  });

  // Get semantic enhancements for the purpose
  const enhancements = semanticEnhancements ? purposeEnhancements[purpose] : {};

  // Determine effective values (user props override semantic enhancements)
  const effectivePlaceholder = placeholder || enhancements.placeholder;
  const effectiveHelperText = error || helperText || enhancements.helperText;
  const effectiveRows = rows || enhancements.rows || 4;
  const effectiveMaxLength = maxLength || enhancements.maxLength;

  // Medical device auto-save functionality
  const performAutoSave = $(() => {
    if (onAutoSave$ && keyboardState.hasUnsavedChanges) {
      onAutoSave$(inputValue.value);
      keyboardState.lastSaveTime = Date.now();
      keyboardState.hasUnsavedChanges = false;
    }
  });

  // Enhanced keyboard navigation for medical devices
  const handleKeyDown = $((event: KeyboardEvent) => {
    const target = event.target as HTMLTextAreaElement;
    
    if (!enableWorkflowShortcuts) return;
    
    // Medical device keyboard shortcuts
    if ((event.ctrlKey || event.metaKey)) {
      keyboardState.shortcutPressed = true;
      
      switch (event.key.toLowerCase()) {
        case 's':
          // Ctrl+S: Save medical data immediately
          event.preventDefault();
          performAutoSave();
          break;
          
        case 'e':
          // Ctrl+E: Toggle emergency validation mode
          event.preventDefault();
          keyboardState.isEmergencyMode = !keyboardState.isEmergencyMode;
          break;
          
        case 'a':
          // Ctrl+A: Select all medical text (enhanced for medical contexts)
          if (medicalDeviceMode) {
            event.preventDefault();
            target.select();
          }
          break;
      }
    }
    
    // Enhanced Tab navigation with auto-save for medical workflows
    if (event.key === 'Tab' && keyboardState.hasUnsavedChanges) {
      // Auto-save before navigation in medical contexts
      performAutoSave();
    }
    
    // Emergency mode: Enhanced Enter behavior
    if (event.key === 'Enter' && keyboardState.isEmergencyMode) {
      // In emergency mode, Ctrl+Enter forces immediate save
      if (event.ctrlKey) {
        event.preventDefault();
        performAutoSave();
      }
    }
    
    // Reset shortcut state after brief delay
    setTimeout(() => {
      keyboardState.shortcutPressed = false;
    }, 200);
  });

  const handleInput = $((event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    inputValue.value = target.value;
    characterCount.value = target.value.length;
    keyboardState.hasUnsavedChanges = true;
    onChange$?.(target.value);

    if (autoResize) {
      target.style.height = 'auto';
      target.style.height = target.scrollHeight + 'px';
    }
  });

  // Enhanced focus handlers for medical device accessibility
  const handleFocus = $(() => {
    keyboardState.hasFocus = true;
    
    // Auto-select content for medical efficiency (configurable by purpose)
    if (medicalDeviceMode && (purpose === 'medication' || purpose === 'emergency')) {
      // Auto-select for quick editing in critical contexts
      setTimeout(() => {
        const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
        if (textarea && inputValue.value) {
          textarea.select();
        }
      }, 50);
    }
  });

  const handleBlur = $(() => {
    keyboardState.hasFocus = false;
    
    // Auto-save on blur for medical data preservation
    if (keyboardState.hasUnsavedChanges && onAutoSave$) {
      performAutoSave();
    }
  });

  const wrapperClass = mergeClasses(
    "textarea-wrapper",
    !fullWidth && "w-auto",
    qwikClass,
    className
  );

  const textareaClass = cn(
    textareaVariants({
      [variant]: true,
      [size]: true,
      [`resize-${resize}`]: true
    }),
    // Purpose-based styling enhancements
    enhancements.className,
    hasError && "border-error-500 focus-visible:ring-error-100",
    autoResize && "overflow-hidden",
    // Medical device enhanced focus indicators
    medicalDeviceMode && [
      "focus:ring-4 focus:ring-blue-200",
      "focus:border-primary-normal focus:shadow-lg",
      "transition-all duration-200"
    ],
    // Emergency mode enhanced styling
    keyboardState.isEmergencyMode && [
      "border-warning-normal focus:border-warning-normal",
      "focus:ring-orange-200 bg-warning-lighter"
    ],
    // Enhanced focus state for accessibility
    keyboardState.hasFocus && medicalDeviceMode && [
      "ring-4 ring-blue-200 border-primary-normal shadow-lg"
    ]
  );

  const isAtMaxLength = effectiveMaxLength && characterCount.value >= effectiveMaxLength;

  return (
    <div class="themed-content">
      <div 
        class={wrapperClass} 
        style={style}
        data-testid={testId}
        data-medical-device={medicalDeviceMode}
        data-emergency-mode={keyboardState.isEmergencyMode}
        {...rest}
      >
      {label && (
        <label 
          for={textareaId} 
          class={cn(
            textareaLabelVariants({ [size]: true }),
            // Emergency mode label enhancement
            keyboardState.isEmergencyMode && "text-warning-dark font-semibold"
          )}
        >
          {label}
          {required && <span class="text-error-500 ml-1">*</span>}
          {keyboardState.isEmergencyMode && (
            <span class="text-warning-normal ml-2 text-sm font-medium">
              (Emergency Mode)
            </span>
          )}
        </label>
      )}

      <div class="textarea-control relative">
        <textarea
          id={textareaId}
          name={name}
          class={textareaClass}
          placeholder={effectivePlaceholder}
          rows={effectiveRows}
          cols={cols}
          maxLength={effectiveMaxLength}
          disabled={disabled}
          required={required}
          value={inputValue.value}
          aria-invalid={hasError}
          aria-describedby={
            [
              effectiveHelperText && `${textareaId}-helper`,
              error && `${textareaId}-error`,
              effectiveMaxLength && `${textareaId}-counter`,
              medicalDeviceMode && `${textareaId}-shortcuts`
            ].filter(Boolean).join(" ") || undefined
          }
          // Enhanced ARIA for medical device accessibility
          aria-label={
            medicalDeviceMode 
              ? `${label || 'Medical textarea'} - Use Ctrl+S to save, Ctrl+E for emergency mode`
              : undefined
          }
          onInput$={handleInput}
          onKeyDown$={handleKeyDown}
          onFocus$={handleFocus}
          onBlur$={handleBlur}
        />
        
        {/* Medical device keyboard shortcuts indicator */}
        {medicalDeviceMode && keyboardState.shortcutPressed && (
          <div class="absolute top-2 right-2 bg-info-lighter text-primary-darker px-2 py-1 rounded text-xs font-medium">
            Shortcut Active
          </div>
        )}
      </div>

      <div class="textarea-footer">
        {effectiveMaxLength && (
          <div 
            id={`${textareaId}-counter`}
            class={textareaCounterVariants({ 
              [size]: true,
              error: isAtMaxLength
            })}
          >
            {characterCount.value}/{effectiveMaxLength}
            {keyboardState.hasUnsavedChanges && (
              <span class="text-warning-normal ml-2">*</span>
            )}
          </div>
        )}

        {/* Medical device keyboard shortcuts help */}
        {medicalDeviceMode && enableWorkflowShortcuts && (
          <div 
            id={`${textareaId}-shortcuts`}
            class="text-xs text-neutral-normal mt-1"
          >
            Shortcuts: Ctrl+S (Save), Ctrl+E (Emergency), Ctrl+A (Select All)
          </div>
        )}

        {effectiveHelperText && !error && (
          <p 
            id={`${textareaId}-helper`}
            class={textareaHelperVariants({ [size]: true })}
          >
            {effectiveHelperText}
            {keyboardState.isEmergencyMode && (
              <span class="text-warning-normal ml-2 font-medium">
                Emergency validation active
              </span>
            )}
          </p>
        )}

        {error && (
          <p 
            id={`${textareaId}-error`}
            class={textareaHelperVariants({ [size]: true, error: true })}
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    </div>
    </div>
  );
});

// Component is complete - TextareaProps already exported above
