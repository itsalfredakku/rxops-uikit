import { component$ } from "@builder.io/qwik";
import { createVariantClass } from "../../../design-system/component-base";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import type { ComponentSize } from "../../../design-system/types";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
  current?: boolean;
}

export type BreadcrumbSize = ComponentSize;
export type BreadcrumbVariant = "default" | "pills" | "arrows";

export interface BreadcrumbProps extends BaseComponentProps {
  items: BreadcrumbItem[];
  separator?: string;
  size?: BreadcrumbSize;
  variant?: BreadcrumbVariant;
  testId?: string;
}

// Breadcrumb variant configuration
const breadcrumbVariants = createVariantClass({
  base: "flex items-center space-x-1 text-sm",
  variants: {
    default: "text-neutral-dark",
    pills: "text-neutral-dark", 
    arrows: "text-neutral-dark",
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }
});

const breadcrumbListVariants = createVariantClass({
  base: "flex items-center space-x-1",
  variants: {
    default: "space-x-1",
    pills: "space-x-2",
    arrows: "space-x-0"
  }
});

const breadcrumbItemVariants = createVariantClass({
  base: "flex items-center",
  variants: {
    default: "flex items-center space-x-1",
    pills: "flex items-center space-x-2",
    arrows: "flex items-center"
  }
});

const breadcrumbLinkVariants = createVariantClass({
  base: [
    "inline-flex items-center gap-1.5 font-medium transition-colors duration-200",
    "hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
  ].join(" "),
  variants: {
    default: "text-neutral-dark hover:text-primary-dark",
    pills: [
      "px-2 py-1 bg-neutral-lighter text-neutral-dark rounded-full",
      "hover:bg-primary-lighter hover:text-primary-dark"
    ].join(" "),
    arrows: "text-neutral-dark hover:text-primary-dark"
  }
});

const breadcrumbCurrentVariants = createVariantClass({
  base: "inline-flex items-center gap-1.5 font-medium",
  variants: {
    default: "text-neutral-darker",
    pills: [
      "px-2 py-1 bg-primary-lighter text-primary-darker rounded-full"
    ].join(" "),
    arrows: "text-neutral-darker"
  }
});

const breadcrumbSeparatorVariants = createVariantClass({
  base: "text-neutral-light mx-2",
  variants: {
    default: "mx-2",
    pills: "mx-1",
    arrows: "mx-0"
  }
});

export const Breadcrumb = component$<BreadcrumbProps>(({
  items,
  separator = "›",
  size = "md",
  variant = "default",
  class: qwikClass,
  className,
  style,
  testId,
  ...rest
}) => {
  const breadcrumbClass = mergeClasses(
    breadcrumbVariants({
      [variant]: true,
      [size]: true
    }),
    qwikClass,
    className
  );

  const listClass = breadcrumbListVariants({
    [variant]: true
  });

  const getSeparator = () => {
    if (variant === "arrows") {
      return (
        <svg class="w-4 h-4 text-neutral-light" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      );
    }
    return separator;
  };

  return (
    <div class="themed-content">
      <nav 
        class={breadcrumbClass} 
        style={style}
        aria-label="Breadcrumb"
        data-testid={testId}
        {...rest}
      >
      <ol class={listClass}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCurrent = item.current || isLast;
          
          const itemClass = breadcrumbItemVariants({
            [variant]: true
          });

          return (
            <li key={index} class={itemClass}>
              {item.href && !isCurrent ? (
                <a 
                  href={item.href} 
                  class={breadcrumbLinkVariants({ [variant]: true })}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {item.icon && (
                    <span class="shrink-0" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </a>
              ) : (
                <span 
                  class={breadcrumbCurrentVariants({ [variant]: true })}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {item.icon && (
                    <span class="shrink-0" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </span>
              )}
              
              {!isLast && (
                <span 
                  class={breadcrumbSeparatorVariants({ [variant]: true })}
                  aria-hidden="true"
                >
                  {getSeparator()}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      </nav>
    </div>
  );
});
