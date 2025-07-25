import { component$, Slot, useSignal, $, type JSXNode } from "@builder.io/qwik";
import type { BaseComponentProps } from "../../../design-system/props";
import { mergeClasses, mergeStyles } from "../../../design-system/props";
import type { Variant, Color, Spacing } from "../../../design-system/types";
import { Row } from "../../../layouts/row";
import { Column } from "../../../layouts/column";

export interface CardProps extends BaseComponentProps<HTMLDivElement> {
  /** Visual variant following design system */
  variant?: Variant;
  /** Semantic color for color theming */
  color?: Color | "default";
  /** Internal padding */
  padding?: Spacing;
  /** Whether card responds to hover */
  hoverable?: boolean;
  /** Whether card is interactive/clickable */
  interactive?: boolean;
}

// Base card classes
const cardBase = [
  "bg-white rounded-lg transition-all duration-200",
  "border border-neutral-light"
].join(" ");

// Variant styling classes with enhanced hover states
const variantClasses: Record<Variant, string> = {
  elevated: "shadow-sm hover:shadow-lg hover:shadow-neutral-200/50 hover:-translate-y-1",
  flat: "shadow-none hover:shadow-sm hover:bg-neutral-lighter",
  outlined: "border-2 border-neutral-light hover:border-neutral-normal hover:bg-neutral-lighter",
  text: "border-transparent bg-transparent hover:bg-neutral-lighter"
};

// Color styling classes with enhanced visual hierarchy
const colorClasses: Record<Color | "default", string> = {
  default: "border-neutral-light bg-white shadow-xs",
  primary: "border-primary-200 bg-primary-25 shadow-sm shadow-primary-100/50",
  secondary: "border-neutral-light bg-neutral-lighter shadow-sm shadow-neutral-100/50", 
  success: "border-success-200 bg-success-25 shadow-sm shadow-success-100/50",
  warning: "border-warning-200 bg-warning-25 shadow-sm shadow-warning-100/50",
  error: "border-error-200 bg-error-25 shadow-sm shadow-error-100/50",
  info: "border-info-200 bg-info-25 shadow-sm shadow-info-100/50"
};

// Padding classes
const paddingClasses: Record<Spacing, string> = {
  "0": "p-0",
  "1": "p-1",
  "2": "p-2", 
  "3": "p-3",
  "4": "p-4",
  "6": "p-6",
  "8": "p-8",
  "12": "p-12",
  "16": "p-16",
  "20": "p-20",
  "24": "p-24"
};

// Compound component types
interface CardComponent {
  (props: CardProps): JSXNode;
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
}

// Main component
const CardBase = component$<CardProps>((props) => {
  const {
    variant = "elevated",
    color = "default",
    padding = "6",
    hoverable = false,
    interactive = false,
    
    // Styling props
    class: qwikClass,
    className,
    style,
    
    // Forward all other HTML attributes
    ...rest
  } = props;

  // Enhanced keyboard event handler for interactive cards
  const handleKeyDown$ = $((event: KeyboardEvent) => {
    if (!interactive) return;
    
    // Enter/Space to activate card (medical workflow navigation)
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // Trigger click event for interactive cards
      (event.target as HTMLElement).click();
    }
    
    // Escape key to blur focus for quick navigation
    if (event.key === 'Escape') {
      event.preventDefault();
      (event.target as HTMLElement).blur();
    }
  });

  // Build component classes with proper precedence
  const cardClasses = mergeClasses(
    // Base component classes
    cardBase,
    
    // Variant classes (visual styling approach)
    variantClasses[variant],
    
    // Color classes (color/purpose)
    colorClasses[color],
    
    // Padding classes
    paddingClasses[padding],
    
    // State classes with enhanced interactivity
    hoverable && "hover:scale-[1.01] hover:-translate-y-1 hover:shadow-lg",
    interactive && "cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/70 focus-visible:ring-offset-2 hover:ring-1 hover:ring-primary-200 active:scale-[0.99]",
    
    // Enhanced focus indicators for clinical environments
    interactive && "focus:ring-4 focus:ring-primary-500/70 focus:ring-offset-2 focus:shadow-lg",
    
    // Custom classes (highest priority)
    qwikClass,
    className
  );

  // Merge styles if provided
  const cardStyle = mergeStyles(undefined, style);

  return (
    <div class="themed-content">
      <div
        class={cardClasses}
        style={cardStyle}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={interactive ? "Interactive card" : undefined}
        onKeyDown$={interactive ? handleKeyDown$ : undefined}
        {...rest}
      >
        <Slot />
      </div>
    </div>
  );
});

// Card sub-components for structured content
export const CardHeader = component$<BaseComponentProps<HTMLDivElement>>((props) => {
  const {
    class: qwikClass,
    className,
    style,
    // Remove potentially conflicting props
    size: _size,
    ...rest
  } = props;

  const headerClasses = mergeClasses(
    "border-b border-neutral-light",
    qwikClass,
    className
  );

  return (
    <Row
      class={headerClasses}
      style={mergeStyles(undefined, style)}
      gap="6"
      {...rest}
    >
      <Column class="px-6 py-4 w-full">
        <Slot />
      </Column>
    </Row>
  );
});

export const CardBody = component$<BaseComponentProps<HTMLDivElement>>((props) => {
  const {
    class: qwikClass,
    className,
    style,
    // Remove potentially conflicting props
    size: _size,
    ...rest
  } = props;

  const bodyClasses = mergeClasses(
    qwikClass,
    className
  );

  return (
    <Column
      class={bodyClasses}
      style={mergeStyles(undefined, style)}
      {...rest}
    >
      <div class="px-6 py-4">
        <Slot />
      </div>
    </Column>
  );
});

export const CardFooter = component$<BaseComponentProps<HTMLDivElement>>((props) => {
  const {
    class: qwikClass,
    className,
    style,
    // Remove potentially conflicting props
    size: _size,
    ...rest
  } = props;

  const footerClasses = mergeClasses(
    "border-t border-neutral-light bg-neutral-lighter",
    qwikClass,
    className
  );

  return (
    <Row
      class={footerClasses}
      style={mergeStyles(undefined, style)}
      {...rest}
    >
      <Column class="px-6 py-4 w-full">
        <Slot />
      </Column>
    </Row>
  );
});

// Create compound component with attached sub-components
export const Card = CardBase as CardComponent;

// Attach sub-components
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
