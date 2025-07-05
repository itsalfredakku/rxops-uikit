/**
 * HealthPackageCard Component
 * 
 * Healthcare package display card for lab test packages and health checkups.
 * Includes test details, pricing, and booking functionality.
 */

import { component$ } from '@builder.io/qwik';
// import { type QRL } from '@builder.io/qwik';
import { Button } from '../../../core/atoms/button/button';
import { Badge } from '../../../core/atoms/badge/index';
// import { Icon } from '../../../core/atoms/icon/index';
import { Text } from '../../../core/atoms/text/text';
import { Tooltip } from '../../../core/atoms/tooltip/tooltip';
import { List, ListItem } from '../../../core/organisms/list/list';
import { Row, Column, Stack } from '../../../layouts';
import { BaseComponentProps, mergeClasses } from '../../../design-system/props';
// import { VariantProps } from '../../../design-system/props';

export interface HealthPackageData {
  id: string;
  name: string;
  description?: string;
  testsIncluded: number;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  reportDelivery: string; // e.g., "6-24 hours", "Same day"
  homeCollection: boolean;
  fastingRequired: boolean;
  popular?: boolean;
  recommended?: boolean;
  tests: Array<{
    name: string;
    category?: string;
    description?: string;
  }>;
  features?: string[];
  ageGroup?: string;
  gender?: 'male' | 'female' | 'both';
  certification?: string; // e.g., "NABL Certified", "ISO Certified"
}

export interface HealthPackageCardProps extends BaseComponentProps<HTMLDivElement> {
  /** Package information */
  package: HealthPackageData;
  /** Card display variant */
  cardVariant?: 'default' | 'compact' | 'detailed';
  /** Card size */
  size?: 'sm' | 'md' | 'lg';
  /** Show test details */
  showTestDetails?: boolean;
  /** Event handlers */
  onBook?: (packageId: string) => void;
  onViewDetails?: (packageId: string) => void;
  onCompare?: (packageId: string) => void;
}

export const HealthPackageCard = component$<HealthPackageCardProps>((props) => {
  const {
    package: pkg,
    cardVariant = 'default',
    size = 'md',
    showTestDetails = true,
    onBook,
    onViewDetails,
    onCompare,
    class: qwikClass,
    className,
    style,
    testId,
    ...rest
  } = props;
  
  const cardClasses = mergeClasses(
    'health-package-card',
    'bg-white rounded-lg border border-neutral-light',
    'hover:shadow-lg hover:border-primary-light',
    'transition-all duration-normal',
    'relative overflow-hidden',
    size === 'sm' && 'p-3',
    size === 'md' && 'p-4',
    size === 'lg' && 'p-6',
    pkg.popular && 'ring-2 ring-primary-normal',
    qwikClass,
    className
  );

  const discountSavings = pkg.originalPrice - pkg.discountedPrice;

  return (
    <div 
      class={cardClasses}
      style={style}
      data-testid={testId}
      {...rest}
    >
      {/* Popular/Recommended Badge */}
      {(pkg.popular || pkg.recommended) && (
        <div class="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary-normal to-primary-dark text-white text-center py-1">
          <span class="text-xs font-medium">
            {pkg.popular ? '🔥 MOST POPULAR' : '⭐ RECOMMENDED'}
          </span>
        </div>
      )}

      {/* Package Header */}
      <div class={mergeClasses(
        'package-header',
        (pkg.popular || pkg.recommended) ? 'mt-6' : 'mt-0'
      )}>
        <Row alignItems="start" justifyContent="between" class="mb-3">
          <Column class="flex-1">
            <Text 
              as="h3"
              weight="semibold"
              color="neutral-darker"
              size={size === 'sm' ? 'md' : size === 'lg' ? 'xl' : 'lg'}
              lineClamp={2}
            >
              {pkg.name}
            </Text>
            
            {pkg.description && (
              <Text as="p" size="sm" color="muted" class="mt-1 line-clamp-2">
                {pkg.description}
              </Text>
            )}
          </Column>
          
          {onCompare && (
            <Tooltip content="Add to compare">
              <button
                class="p-1 text-neutral hover:text-primary-dark"
                onClick$={() => onCompare?.(pkg.id)}
              >
                <span class="w-5 h-5 block">+</span>
              </button>
            </Tooltip>
          )}
        </Row>

        {/* Test Count & Certification */}
        <Row alignItems="center" justifyContent="between" class="mb-4">
          <Row alignItems="center" gap="3">
            <Badge style="info" size="sm">
              {pkg.testsIncluded} Tests
            </Badge>
            {pkg.certification && (
              <Badge style="success" size="sm">
                {pkg.certification}
              </Badge>
            )}
          </Row>
          
          {(pkg.ageGroup || pkg.gender !== 'both') && (
            <div class="text-xs text-neutral">
              {pkg.ageGroup && <span>{pkg.ageGroup}</span>}
              {pkg.gender && pkg.gender !== 'both' && (
                <span class="ml-1">• {pkg.gender}</span>
              )}
            </div>
          )}
        </Row>
      </div>

      {/* Package Features */}
      <div class="package-features mb-4">
        <Row gap="3">
          <Row alignItems="center" gap="2" class="text-sm">
            <span class={`w-4 h-4 inline-block ${pkg.reportDelivery.includes('Same day') ? 'text-success-dark' : 'text-primary-dark'}`}>
              ⏰
            </span>
            <span class="text-neutral-dark">{pkg.reportDelivery}</span>
          </Row>
          
          <Row alignItems="center" gap="2" class="text-sm">
            <span class={`w-4 h-4 inline-block ${pkg.homeCollection ? 'text-success-dark' : 'text-warning-dark'}`}>
              {pkg.homeCollection ? '🏠' : '📍'}
            </span>
            <span class="text-neutral-dark">
              {pkg.homeCollection ? 'Home Collection' : 'Lab Visit Required'}
            </span>
          </Row>
          
          {pkg.fastingRequired && (
            <Column>
              <Row alignItems="center" gap="2" class="text-sm">
                <span class="w-4 h-4 inline-block text-warning-dark">⚠️</span>
                <span class="text-neutral-dark">Fasting Required</span>
              </Row>
            </Column>
          )}
        </Row>

        {/* Additional Features */}
        {pkg.features && pkg.features.length > 0 && (
          <div class="mt-3">
            <Row wrap gap="1">
              {pkg.features.slice(0, 3).map((feature, index) => (
                <Badge key={index} style="secondary" size="sm">
                  {feature}
                </Badge>
              ))}
              {pkg.features.length > 3 && (
                <Badge style="secondary" size="sm">
                  +{pkg.features.length - 3} more
                </Badge>
              )}
            </Row>
          </div>
        )}
      </div>

      {/* Test Details */}
      {showTestDetails && cardVariant !== 'compact' && (
        <div class="test-details mb-4">
          <Text 
            as="h4"
            size="sm"
            weight="medium"
            color="neutral-darker"
            class="mb-2"
          >
            Tests Included ({pkg.testsIncluded})
          </Text>
          
          <div class="max-h-24 overflow-y-auto">
            <List variant="none">
              {pkg.tests.slice(0, 5).map((test, index) => (
                <ListItem 
                  key={index}
                  class="text-xs py-1"
                >
                  <Row alignItems="center" gap="2" class="w-full">
                    <span class="w-3 h-3 text-success-dark flex-shrink-0">✓</span>
                    <span class="text-neutral-dark truncate flex-1">{test.name}</span>
                    {test.category && (
                      <Badge style="secondary" size="sm">
                        {test.category}
                      </Badge>
                    )}
                  </Row>
                </ListItem>
              ))}
              
              {pkg.tests.length > 5 && (
                <ListItem class="text-xs py-1">
                  <button
                    class="text-primary-dark hover:text-primary-darker font-medium"
                    onClick$={() => onViewDetails?.(pkg.id)}
                  >
                    +{pkg.tests.length - 5} more tests
                  </button>
                </ListItem>
              )}
            </List>
          </div>
        </div>
      )}

      {/* Pricing */}
      <div class="pricing mb-4">
        <Row alignItems="center" gap="2" class="mb-2">
          <span class={[
            'font-bold text-neutral-darker',
            size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl'
          ].join(' ')}>
            ₹{pkg.discountedPrice.toLocaleString()}
          </span>
          
          {pkg.discountPercentage > 0 && (
            <>
              <span class="text-sm text-neutral-light line-through">
                ₹{pkg.originalPrice.toLocaleString()}
              </span>
              <Badge style="danger" size="sm">
                {pkg.discountPercentage}% OFF
              </Badge>
            </>
          )}
        </Row>
        
        {pkg.discountPercentage > 0 && (
          <Text as="p" size="sm" color="success-dark" weight="medium">
            You save ₹{discountSavings.toLocaleString()}
          </Text>
        )}
      </div>

      {/* Action Buttons */}
      <Stack gap="2" class="actions">
        <Button
          variant="elevated"
          color="primary"
          size={size === 'sm' ? 'sm' : 'md'}
          class="w-full"
          onClick$={() => onBook?.(pkg.id)}
        >
          Book Now
        </Button>
        
        {onViewDetails && (
          <Button
            variant="outlined"
            size={size === 'sm' ? 'sm' : 'md'}
            class="w-full"
            onClick$={() => onViewDetails?.(pkg.id)}
          >
            View All Tests
          </Button>
        )}
      </Stack>

      {/* Trust Indicators */}
      <div class="trust-indicators mt-3 pt-3 border-t border-neutral-lighter">
        <Row alignItems="center" justifyContent="between" class="text-xs text-neutral-light">
          <Row alignItems="center" gap="1">
            <span class="w-3 h-3 text-success-dark">🛡️</span>
            <span>100% Safe</span>
          </Row>
          <Row alignItems="center" gap="1">
            <span class="w-3 h-3 text-primary-dark">🏆</span>
            <span>Verified Lab</span>
          </Row>
          <Row alignItems="center" gap="1">
            <span class="w-3 h-3 text-warning-dark">🔄</span>
            <span>Free Repeat</span>
          </Row>
        </Row>
      </div>
    </div>
  );
});

export default HealthPackageCard;
