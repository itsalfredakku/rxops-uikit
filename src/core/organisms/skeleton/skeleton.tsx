import { component$ } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses, mergeStyles } from "../../../design-system/props";

export interface SkeletonProps extends BaseComponentProps<HTMLDivElement> {
  variant?: "text" | "rectangular" | "circular" | "card";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

const skeletonVariants = {
  text: "h-4 w-full bg-neutral-light rounded animate-pulse",
  rectangular: "w-full h-32 bg-neutral-light rounded animate-pulse",
  circular: "rounded-full w-12 h-12 bg-neutral-light animate-pulse",
  card: "w-full h-48 bg-neutral-light rounded animate-pulse"
};

export const Skeleton = component$<SkeletonProps>((props) => {
  const { 
    variant = "text",
    width,
    height,
    animation = "pulse",
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;
  
  const baseClasses = skeletonVariants[variant];
  const animationClass = animation === "none" ? "" : "";
  
  const dimensionStyle = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height })
  };

  const skeletonClasses = mergeClasses(
    baseClasses,
    animationClass,
    qwikClass,
    className
  );

  // Merge styles if provided
  const finalStyle = mergeStyles(dimensionStyle, style);

  return (
    <div class="themed-content">
      <div 
        class={skeletonClasses}
      style={finalStyle}
      aria-label="Loading..."
      role="status"
      {...rest}
    />
    </div>
  );
});

// Healthcare-specific skeleton components
export const DoctorCardSkeleton = component$(() => (
  <div class="bg-white rounded-lg border border-neutral-light p-4 space-y-4">
    <div class="flex items-start space-x-4">
      <Skeleton variant="circular" width={64} height={64} />
      <div class="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="80%" />
      </div>
    </div>
    <div class="flex justify-between items-center pt-2">
      <Skeleton variant="text" width="30%" />
      <Skeleton variant="rectangular" width={100} height={32} />
    </div>
  </div>
));

export const HealthMetricSkeleton = component$(() => (
  <div class="bg-white rounded-lg border border-neutral-light p-6 space-y-4">
    <div class="flex items-center space-x-3">
      <Skeleton variant="circular" width={48} height={48} />
      <div class="flex-1 space-y-2">
        <Skeleton variant="text" width="50%" />
        <Skeleton variant="text" width="30%" />
      </div>
    </div>
    <Skeleton variant="text" width="70%" />
  </div>
));
