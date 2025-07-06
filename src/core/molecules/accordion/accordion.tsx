import { component$, useSignal, Slot, $, type QRL } from "@builder.io/qwik";
import { mergeClasses } from "../../../design-system/props";
import { Row } from "../../../layouts/row";
import { Icon, type IconName } from "../../atoms/icon";
import { Text } from "../../atoms/text/text";
import { hipaaAuditor } from "../../../utils/hipaa";

export interface AccordionItemProps {
  /** Unique identifier for the accordion item */
  id: string;
  /** Title text for the accordion header */
  title: string;
  /** Whether this item is initially open */
  defaultOpen?: boolean;
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Custom icon to display instead of the default chevron */
  icon?: IconName;
  /** Badge text to display next to the title */
  badge?: string;
  /** Accessibility label for screen readers */
  ariaLabel?: string;
}

export interface AccordionProps {
  /** Array of accordion items */
  items?: AccordionItemProps[];
  /** Whether multiple items can be open at once */
  multiple?: boolean;
  /** Variant style of the accordion */
  variant?: 'default' | 'flat' | 'bordered' | 'medical';
  /** Size of the accordion */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show dividers between items */
  showDividers?: boolean;
  /** CSS class names to apply */
  class?: string;
  /** Callback when an item is opened/closed */
  onToggle$?: QRL<(id: string, isOpen: boolean) => void>;
  /** HIPAA audit settings for sensitive medical data */
  hipaaAudit?: {
    enabled: boolean;
    category: 'medical-history' | 'patient-records' | 'treatment-plan' | 'general';
    patientId?: string;
  };
}

export const Accordion = component$<AccordionProps>((props) => {
  const openItems = useSignal<Set<string>>(new Set());
  
  // Initialize open items based on defaultOpen
  if (props.items && openItems.value.size === 0) {
    const defaultOpenItems = props.items
      .filter(item => item.defaultOpen)
      .map(item => item.id);
    openItems.value = new Set(defaultOpenItems);
  }

  const toggleItem = $((itemId: string) => {
    const newOpenItems = new Set(openItems.value);
    const isCurrentlyOpen = newOpenItems.has(itemId);
    
    if (isCurrentlyOpen) {
      newOpenItems.delete(itemId);
    } else {
      if (!props.multiple) {
        newOpenItems.clear();
      }
      newOpenItems.add(itemId);
    }
    
    openItems.value = newOpenItems;
    
    // HIPAA audit logging
    if (props.hipaaAudit?.enabled) {
      hipaaAuditor.logAccess({
        action: isCurrentlyOpen ? 'collapse' : 'expand',
        component: 'accordion',
        itemId,
        category: props.hipaaAudit.category,
        patientId: props.hipaaAudit.patientId,
        timestamp: new Date().toISOString()
      });
    }
    
    // Callback
    props.onToggle$?.(itemId, !isCurrentlyOpen);
  });

  const variantClasses = {
    default: "bg-white border border-neutral-light rounded-lg shadow-sm",
    flat: "bg-neutral-lighter",
    bordered: "border border-neutral-light rounded-lg",
    medical: "bg-primary-50 border border-primary-200 rounded-lg shadow-sm"
  };

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base", 
    lg: "text-lg"
  };

  return (
    <div class="themed-content">
      <div
        class={mergeClasses(
          "accordion",
          variantClasses[props.variant || 'default'],
          sizeClasses[props.size || 'md'],
          props.class
        )}
        data-healthcare-element="accordion"
        data-healthcare-size={props.size || 'md'}
      >
      {props.items ? (
        <>
          {props.items.map((item, index) => {
            const isOpen = openItems.value.has(item.id);
            const isLast = index === props.items!.length - 1;
            
            return (
              <div key={item.id} class="accordion-item">
                {/* Header */}
                <button
                  type="button"
                  class={mergeClasses(
                    "accordion-header w-full text-left transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50",
                    "hover:bg-neutral-lighter",
                    props.variant === 'medical' ? "hover:bg-primary-100" : "",
                    item.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                    index === 0 ? "rounded-t-lg" : "",
                    isLast && !isOpen ? "rounded-b-lg" : ""
                  )}
                  onClick$={() => !item.disabled && toggleItem(item.id)}
                  aria-expanded={isOpen}
                  aria-controls={`accordion-content-${item.id}`}
                  aria-label={item.ariaLabel || `Toggle ${item.title}`}
                  disabled={item.disabled}
                >
                  <Row 
                    gap="3" 
                    alignItems="center" 
                    class="p-4"
                  >
                    {/* Custom Icon or Chevron */}
                    <Icon 
                      icon={item.icon || 'chevron-down'}
                      size={16}
                      class={mergeClasses(
                        "transition-transform duration-200 flex-shrink-0",
                        isOpen ? "rotate-180" : ""
                      )}
                    />
                    
                    {/* Title */}
                    <div class="flex-1 min-w-0">
                      <Text 
                        weight="medium"
                        class={mergeClasses(
                          "truncate",
                          props.variant === 'medical' ? "text-primary-700" : ""
                        )}
                      >
                        {item.title}
                      </Text>
                    </div>
                    
                    {/* Badge */}
                    {item.badge && (
                      <span class={mergeClasses(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        "bg-primary-100 text-primary-700"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Row>
                </button>
                
                {/* Content */}
                <div
                  id={`accordion-content-${item.id}`}
                  class={mergeClasses(
                    "accordion-content overflow-hidden transition-all duration-200",
                    isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
                  )}
                  role="region"
                  aria-labelledby={`accordion-header-${item.id}`}
                >
                  <div class="p-4 pt-0">
                    <Slot name={`content-${item.id}`} />
                  </div>
                </div>
                
                {/* Divider */}
                {props.showDividers && !isLast && (
                  <div class="border-b border-neutral-light" />
                )}
              </div>
            );
          })}
        </>
      ) : (
        <Slot />
      )}
      </div>
    </div>
  );
});

// Individual Accordion Item component for manual composition
export interface AccordionItemComponentProps {
  /** Title of the accordion item */
  title: string;
  /** Whether the item is open by default */
  defaultOpen?: boolean;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Custom icon */
  icon?: IconName;
  /** Badge text */
  badge?: string;
  /** CSS class names to apply */
  class?: string;
  /** Callback when toggled */
  onToggle$?: QRL<(isOpen: boolean) => void>;
}

export const AccordionItem = component$<AccordionItemComponentProps>((props) => {
  const isOpen = useSignal(props.defaultOpen || false);
  
  const toggle = $(() => {
    if (!props.disabled) {
      isOpen.value = !isOpen.value;
      props.onToggle$?.(isOpen.value);
    }
  });

  return (
    <div class="themed-content">
      <div class={mergeClasses("accordion-item", props.class)}>
      <button
        type="button"
        class={mergeClasses(
          "accordion-header w-full text-left p-4 transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50",
          "hover:bg-neutral-lighter",
          props.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        )}
        onClick$={toggle}
        aria-expanded={isOpen.value}
        disabled={props.disabled}
      >
        <Row gap="3" alignItems="center">
          <Icon 
            icon={props.icon || 'chevron-down'}
            size={16}
            class={mergeClasses(
              "transition-transform duration-200 flex-shrink-0",
              isOpen.value ? "rotate-180" : ""
            )}
          />
          
          <div class="flex-1 min-w-0">
            <Text weight="medium" class="truncate">
              {props.title}
            </Text>
          </div>
          
          {props.badge && (
            <span class="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
              {props.badge}
            </span>
          )}
        </Row>
      </button>
      
      <div
        class={mergeClasses(
          "accordion-content overflow-hidden transition-all duration-200",
          isOpen.value ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div class="p-4 pt-0">
          <Slot />
        </div>
      </div>
      </div>
    </div>
  );
});

export default Accordion;
