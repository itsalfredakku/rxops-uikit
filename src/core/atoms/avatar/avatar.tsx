import { component$ } from '@builder.io/qwik';
import type { ComponentSize } from '../../../design-system/types';
import { BaseComponentProps, mergeClasses } from '../../../design-system/props';
import { Icon } from '../icon';

export type AvatarVariant = "circular" | "rounded" | "square";

export interface AvatarProps extends BaseComponentProps<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: ComponentSize;
  variant?: AvatarVariant;
  name?: string;
  fallbackIcon?: string;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const sizeClasses: Record<ComponentSize, string> = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-xl"
};

const variantClasses: Record<AvatarVariant, string> = {
  circular: "rounded-full",
  rounded: "rounded-md",
  square: "rounded-sm"
};

const getAvatarClasses = (size: ComponentSize, variant: AvatarVariant, className?: string) => {
  return mergeClasses(
    "inline-flex items-center justify-center bg-primary-100 text-primary-700 font-medium overflow-hidden relative flex-shrink-0",
    sizeClasses[size],
    variantClasses[variant],
    className
  );
};

export const Avatar = component$<AvatarProps>((props) => {
  const {
    src,
    alt,
    size = "md",
    variant = "circular",
    name,
    fallbackIcon,
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  const avatarClasses = getAvatarClasses(size, variant, mergeClasses(qwikClass, className));

  const displayName = alt || name || "User";
  const initials = name ? getInitials(name) : null;

  return (
    <div 
      class={avatarClasses} 
      style={style}
      role="img" 
      aria-label={displayName} 
      {...rest}
    >
      {src ? (
        <img
          src={src}
          alt={displayName}
          class="w-full h-full object-cover"
          loading="lazy"
          width="50"
          height="50"
        />
      ) : initials ? (
        <span class="select-none leading-none" aria-hidden="true">
          {initials}
        </span>
      ) : (
        <span class="select-none leading-none text-[0.8em] flex items-center justify-center" aria-hidden="true">
          {fallbackIcon || <Icon icon="user" class="w-4 h-4" />}
        </span>
      )}
    </div>
  );
});
