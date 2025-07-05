import { component$, Slot } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses, mergeStyles } from "../../../design-system/props";

export type ListVariant = "default" | "ordered" | "unordered" | "none";
export type ListSize = "sm" | "md" | "lg";

export interface ListProps extends Omit<BaseComponentProps<HTMLUListElement>, 'size'> {
  variant?: ListVariant;
  size?: ListSize;
  items?: string[];
}

export const List = component$<ListProps>((props) => {
  const { 
    variant = "default", 
    size = "md", 
    items,
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;
  
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
  
  const listClasses = mergeClasses(
    "ui-list",
    variantClasses[variant],
    sizeClasses[size],
    qwikClass,
    className
  );

  // Merge styles if provided
  const finalStyle = mergeStyles(undefined, style);
  
  return (
    <Tag 
      class={listClasses}
      style={finalStyle}
      {...rest}
    >
      {items ? (
        items.map((item, index) => (
          <li key={index} class="ui-list-item">
            {item}
          </li>
        ))
      ) : (
        <Slot />
      )}
    </Tag>
  );
});

export const ListItem = component$<{ class?: string }>(({ class: className }) => {
  return (
    <li class={["ui-list-item", className]}>
      <Slot />
    </li>
  );
});
