import { component$ } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";

export interface LogoProps extends BaseComponentProps<HTMLDivElement> {
  /** Logo size variant */
  size?: "sm" | "md" | "lg" | "xl";
  /** Alternative image URL */
  src?: string;
  /** Alternative text for accessibility */
  alt?: string;
  /** Make logo clickable with link */
  href?: string;
  /** Width override */
  width?: number;
  /** Height override */
  height?: number;
}

export const Logo = component$<LogoProps>((props) => {
  const {
    size = "md",
    src = "https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F667ab6c2283d4c4d878fb9083aacc10f",
    alt = "Qwik Logo",
    href = "https://qwik.dev/",
    width,
    height,
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  const sizeClasses = {
    sm: "w-24 h-9",
    md: "w-32 h-12", 
    lg: "w-48 h-18",
    xl: "w-64 h-24"
  };

  const logoClasses = mergeClasses(
    "logo inline-block",
    sizeClasses[size],
    qwikClass,
    className
  );

  const imgProps = {
    alt,
    src,
    class: "w-full h-full object-contain",
    ...(width && { width }),
    ...(height && { height })
  };

  const content = <img {...imgProps} />;

  return (
    <div class="themed-content">
      <div 
        class={logoClasses}
        style={style}
        {...rest}
      >
        {href ? (
          <a href={href} class="block w-full h-full">
            {content}
          </a>
        ) : (
          content
        )}
      </div>
    </div>
  );
});
