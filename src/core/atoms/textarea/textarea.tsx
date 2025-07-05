import { component$, useSignal, $ } from "@builder.io/qwik";
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
}

export interface TextareaProps extends TextareaBaseProps, Omit<BaseComponentProps<HTMLDivElement>, keyof TextareaBaseProps | `on${string}$`> {}

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
    className: "leading-relaxed border-orange-300 focus:border-orange-500"
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
    "w-full border font-normal bg-white text-neutral-900 placeholder-neutral-500",
    "transition-all duration-200 ease-in-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
    "disabled:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
  ].join(" "),
  
  variants: {
    default: [
      "border-neutral-300",
      "hover:border-neutral-400",
      "focus:border-primary-500 focus-visible:ring-primary-100",
      "invalid:border-error-500 invalid:focus-visible:ring-error-100"
    ].join(" "),
    
    filled: [
      "border-transparent bg-neutral-100",
      "hover:bg-neutral-200",
      "focus:bg-white focus:border-primary-500 focus-visible:ring-primary-100",
      "invalid:bg-error-50 invalid:border-error-500 invalid:focus-visible:ring-error-100"
    ].join(" "),
    
    outline: [
      "border-2 border-neutral-300 bg-transparent",
      "hover:border-neutral-400",
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
    "block font-medium text-neutral-900 mb-2",
    "peer-disabled:text-neutral-500"
  ].join(" "),
  variants: {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }
});

const textareaCounterVariants = createVariantClass({
  base: "text-neutral-500 mt-1 text-right",
  variants: {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    error: "text-error-500"
  }
});

const textareaHelperVariants = createVariantClass({
  base: "mt-1 text-neutral-600",
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

  // Get semantic enhancements for the purpose
  const enhancements = semanticEnhancements ? purposeEnhancements[purpose] : {};

  // Determine effective values (user props override semantic enhancements)
  const effectivePlaceholder = placeholder || enhancements.placeholder;
  const effectiveHelperText = error || helperText || enhancements.helperText;
  const effectiveRows = rows || enhancements.rows || 4;
  const effectiveMaxLength = maxLength || enhancements.maxLength;

  const handleInput = $((event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    inputValue.value = target.value;
    characterCount.value = target.value.length;
    onChange$?.(target.value);

    if (autoResize) {
      target.style.height = 'auto';
      target.style.height = target.scrollHeight + 'px';
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
    autoResize && "overflow-hidden"
  );

  const isAtMaxLength = effectiveMaxLength && characterCount.value >= effectiveMaxLength;

  return (
    <div class="themed-content">
      <div 
        class={wrapperClass} 
        style={style}
        data-testid={testId}
        {...rest}
      >
      {label && (
        <label 
          for={textareaId} 
          class={textareaLabelVariants({ [size]: true })}
        >
          {label}
          {required && <span class="text-error-500 ml-1">*</span>}
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
              effectiveMaxLength && `${textareaId}-counter`
            ].filter(Boolean).join(" ") || undefined
          }
          onInput$={handleInput}
        />
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
          </div>
        )}

        {effectiveHelperText && !error && (
          <p 
            id={`${textareaId}-helper`}
            class={textareaHelperVariants({ [size]: true })}
          >
            {effectiveHelperText}
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
