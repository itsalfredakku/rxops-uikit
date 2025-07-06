import { component$, Slot } from "@builder.io/qwik";
import { Text } from "../../atoms/text/text";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import { Stack } from "../../../layouts/stack";

export interface FormProps extends BaseComponentProps<HTMLFormElement> {
  layout?: "vertical" | "horizontal" | "inline";
  spacing?: "compact" | "normal" | "relaxed";
}

export const Form = component$<FormProps>((props) => {
  const {
    layout = "vertical",
    spacing = "normal",
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  const formClasses = mergeClasses(
    "form-base",
    `form-layout-${layout}`,
    `form-spacing-${spacing}`,
    qwikClass,
    className
  );

  return (
    <div class="themed-content">
      <form 
        class={formClasses} 
      style={style}
      {...rest}
    >
      <Slot />
    </form>
    </div>
  );
});

export interface FormSectionProps extends BaseComponentProps<HTMLDivElement> {
  title?: string;
  description?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export const FormSection = component$<FormSectionProps>((props) => {
  const {
    title,
    description,
    collapsible = false,
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  const sectionClasses = mergeClasses(
    "form-section",
    collapsible && "form-section-collapsible",
    qwikClass,
    className
  );

  return (
    <Stack
      gap="4"
      class={sectionClasses} 
      style={style}
      {...rest}
    >
      {title && (
        <Stack gap="1" class="form-section-header">
          <Text as="h3" class="form-section-title">{title}</Text>
          {description && (
            <Text size="sm" class="form-section-description text-neutral-normal">{description}</Text>
          )}
        </Stack>
      )}
      
      <div class="form-section-content">
        <Slot />
      </div>
    </Stack>
  );
});
