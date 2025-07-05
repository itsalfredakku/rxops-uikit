import { component$, Slot, $, type QRL } from "@builder.io/qwik";
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
}

export const Tag = component$<TagProps>((props) => {
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
        low: 'bg-success-100 text-success-800 border-green-200',
        medium: 'bg-warning-100 text-warning-800 border-yellow-200',
        high: 'bg-orange-100 text-orange-800 border-orange-200',
        critical: 'bg-error-100 text-error-800 border-red-200 animate-pulse'
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
        outlined: 'border border-green-600 text-success-600 hover:bg-success-50',
        soft: 'bg-success-100 text-success-700 hover:bg-success-200',
        flat: 'bg-success-50 text-success-600',
        medical: 'bg-success-50 text-success-700 border border-green-200'
      },
      warning: {
        solid: 'bg-warning-600 text-white hover:bg-warning-700',
        outlined: 'border border-yellow-600 text-warning-600 hover:bg-warning-50',
        soft: 'bg-warning-100 text-warning-700 hover:bg-warning-200',
        flat: 'bg-warning-50 text-warning-600',
        medical: 'bg-warning-50 text-warning-700 border border-yellow-200'
      },
      error: {
        solid: 'bg-error-600 text-white hover:bg-error-700',
        outlined: 'border border-red-600 text-error-600 hover:bg-error-50',
        soft: 'bg-error-100 text-error-700 hover:bg-error-200',
        flat: 'bg-error-50 text-error-600',
        medical: 'bg-error-50 text-error-700 border border-red-200'
      },
      info: {
        solid: 'bg-primary-600 text-white hover:bg-primary-700',
        outlined: 'border border-primary-600 text-primary-600 hover:bg-primary-50',
        soft: 'bg-primary-100 text-primary-700 hover:bg-primary-200',
        flat: 'bg-primary-50 text-primary-600',
        medical: 'bg-primary-50 text-primary-700 border border-primary-200'
      },
      neutral: {
        solid: 'bg-neutral-600 text-white hover:bg-neutral-700',
        outlined: 'border border-neutral-600 text-neutral-600 hover:bg-neutral-50',
        soft: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
        flat: 'bg-neutral-50 text-neutral-600',
        medical: 'bg-neutral-50 text-neutral-700 border border-neutral-200'
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

  return (
    <Component
      type={props.clickable ? 'button' : undefined}
      class={mergeClasses(
        getVariantClasses(),
        sizeClasses[props.size || 'md'],
        props.clickable && !props.disabled ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50' : '',
        props.disabled ? 'opacity-50 cursor-not-allowed' : '',
        props.class
      )}
      onClick$={props.clickable ? handleClick : undefined}
      disabled={props.disabled}
      aria-label={props.label}
      data-healthcare-element="tag"
      data-healthcare-size={props.size || 'md'}
      {...props}
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
            "flex-shrink-0"
          )}
          onClick$={handleRemove}
          aria-label={`Remove ${props.label || 'tag'}`}
        >
          <Icon 
            icon="x" 
            size={getIconSize() - 2}
          />
        </button>
      )}
    </Component>
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
}

export const TagGroup = component$<TagGroupProps>((props) => {
  const visibleTags = props.maxVisible ? 
    props.tags?.slice(0, props.maxVisible) : 
    props.tags;
  
  const hiddenCount = props.maxVisible && props.tags ? 
    Math.max(0, props.tags.length - props.maxVisible) : 
    0;

  // Extract custom props that shouldn't be passed to div
  const { tags: _tags, size, wrap, maxVisible: _maxVisible, onRemove$, onTagClick$, class: className, ...divProps } = props;

  return (
    <div 
      class={mergeClasses(
        "tag-group flex gap-2",
        wrap ? "flex-wrap" : "flex-nowrap",
        className
      )}
      {...divProps}
    >
      {props.tags ? (
        <>
          {visibleTags?.map((tag) => (
            <Tag
              key={tag.id}
              label={tag.label}
              icon={tag.icon}
              color={tag.color}
              variant={tag.variant}
              size={size}
              removable={tag.removable}
              clickable={!!onTagClick$}
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
            />
          )}
        </>
      ) : (
        <Slot />
      )}
    </div>
  );
});

export default Tag;
