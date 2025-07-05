import { component$, $ } from "@builder.io/qwik";
import { Button } from "../../atoms/button/button";
import { Text } from "../../atoms/text/text";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import { Stack } from "../../../layouts/stack";

export interface Service {
  id: string;
  title: string;
  description: string;
  icon?: string;
  price?: number;
  duration?: string;
  isPopular?: boolean;
}

export interface ServiceCardProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
  service: Service;
  onBook$?: (serviceId: string) => void;
}

export const ServiceCard = component$<ServiceCardProps>((props) => {
  const {
    service, 
    onBook$,
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  const cardClasses = mergeClasses(
    "ui-service-card bg-white rounded-lg border border-neutral-200 p-6 hover:shadow-lg transition-all hover:border-primary-300 relative",
    service.isPopular && "ring-2 ring-blue-500",
    qwikClass,
    className
  );

  return (
    <div 
      class={cardClasses}
      style={style}
      {...rest}
    >
      {service.isPopular && (
        <div class="absolute -top-2 left-4 bg-primary-500 text-white text-xs px-2 py-1 rounded">
          Popular
        </div>
      )}
      
      <Stack alignItems="center" gap="4" class="text-center">
        {service.icon && (
          <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <span class="text-2xl">{service.icon}</span>
          </div>
        )}
        
        <Stack alignItems="center" gap="2">
          <Text as="h3" weight="semibold" size="xl" class="text-neutral-900">
            {service.title}
          </Text>
          
          <Text as="p" size="sm" class="text-neutral-600 leading-relaxed">
            {service.description}
          </Text>
        </Stack>
        
        <Stack alignItems="center" gap="1">
          {service.price && (
            <Text size="xl" weight="bold" class="text-success-600">
              ₹{service.price}
            </Text>
          )}
          
          {service.duration && (
            <Text size="sm" class="text-neutral-500">
              {service.duration}
            </Text>
          )}
        </Stack>
        
        <Button
          variant="elevated" 
          intent="primary"
          size="md"
          class="w-full"
          onClick$={onBook$ && $(() => onBook$(service.id))}
        >
          Book Now
        </Button>
      </Stack>
    </div>
  );
});
