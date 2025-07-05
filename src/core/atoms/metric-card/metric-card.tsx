import { component$, type JSXOutput } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import { Text } from "../../atoms/text/text";
import { Stack } from "../../../layouts/stack/index";
import { Icon, type IconName } from "../../atoms/icon/index";

export interface MetricCardProps extends BaseComponentProps<HTMLDivElement> {
  title: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  icon?: IconName | JSXOutput;
  color?: "red" | "green" | "blue" | "yellow" | "purple" | "gray";
}

const colorClasses = {
  red: {
    bg: "bg-error-100",
    text: "text-error-600",
    border: "border-red-200",
  },
  green: {
    bg: "bg-success-100", 
    text: "text-success-600",
    border: "border-green-200",
  },
  blue: {
    bg: "bg-primary-100",
    text: "text-primary-600", 
    border: "border-primary-200",
  },
  yellow: {
    bg: "bg-warning-100",
    text: "text-warning-600",
    border: "border-yellow-200",
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-600",
    border: "border-purple-200",
  },
  gray: {
    bg: "bg-neutral-100",
    text: "text-neutral-600",
    border: "border-neutral-200",
  },
};

const trendIcons = {
  up: "↗",
  down: "↘", 
  stable: "→",
};

export const MetricCard = component$<MetricCardProps>((props) => {
  const {
    title,
    value,
    unit,
    trend,
    trendValue,
    icon,
    color = "blue",
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;
  
  const colors = colorClasses[color as keyof typeof colorClasses];
  
  const metricClasses = mergeClasses(
    "ui-metric-card bg-white rounded-lg border p-4",
    colors.border,
    qwikClass,
    className
  );
  
  return (
    <div 
      class={metricClasses}
      style={style}
      {...rest}
    >
      <Stack direction="row" alignItems="center" justifyContent="between" wrap="wrap" class="mb-3">
        <Text as="h3" weight="medium" size="sm" color="gray-600">
          {title}
        </Text>
        {icon && (
          <div class={[
            "w-8 h-8 rounded-full flex items-center justify-center",
            colors.bg
          ]}>
            <div class={[colors.text]}>
              {typeof icon === 'string' ? (
                <Icon icon={icon as IconName} size={20} />
              ) : (
                icon
              )}
            </div>
          </div>
        )}
      </Stack>
      
      <Stack direction="row" alignItems="baseline" gap="1" wrap="wrap" class="mb-2">
        <span class="text-2xl font-bold text-neutral-900">
          {value}
        </span>
        {unit && (
          <span class="text-sm text-neutral-500">
            {unit}
          </span>
        )}
      </Stack>
      
      {trend && trendValue && (
        <Stack 
          direction="row"
          alignItems="center" 
          wrap="wrap"
          class={`text-xs ${
            trend === "up" && color === "green" ? "text-success-600" : 
            trend === "down" && color === "red" ? "text-error-600" :
            "text-neutral-500"
          }`}
        >
          <span class="mr-1">
            {trendIcons[trend as keyof typeof trendIcons]}
          </span>
          <span>
            {trendValue}
          </span>
        </Stack>
      )}
    </div>
  );
});
