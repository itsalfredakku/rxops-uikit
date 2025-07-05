/**
 * ProductCard Component
 * 
 * E-commerce product card for medicines, health devices, and supplements.
 * Includes pricing, ratings, authenticity badges, and cart actions.
 */

import { component$, type QRL } from '@builder.io/qwik';
import { BaseComponentProps, mergeClasses } from '../../../design-system/props';
import { Button } from '../../../core/atoms/button/button';
import { Badge } from '../../../core/atoms/badge/index';
import { Text } from '../../../core/atoms/text/text';
import { Icon } from '../../../core/atoms/icon/index';

export interface ProductData {
  id: string;
  name: string;
  manufacturer: string;
  genericName?: string;
  mrp: number;
  discountedPrice: number;
  discountPercentage: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  prescriptionRequired: boolean;
  image: string;
  badges?: ('authentic' | 'bestseller' | 'recommended' | '1mg-choice')[];
  form?: 'tablet' | 'syrup' | 'injection' | 'cream' | 'capsule' | 'drops';
  packSize?: string;
  strength?: string;
  fastDelivery?: boolean;
  freeDelivery?: boolean;
}

export interface ProductCardProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
  /** Product information */
  product: ProductData;
  /** Card display variant */
  variant?: 'default' | 'compact' | 'detailed';
  /** Card size */
  size?: 'sm' | 'md' | 'lg';
  /** Show quick actions */
  showQuickActions?: boolean;
  /** Show comparison checkbox */
  showCompare?: boolean;
  /** Test ID for testing */
  'data-testid'?: string;
  /** Event handlers */
  onAddToCart$?: QRL<(productId: string) => void>;
  onWishlist$?: QRL<(productId: string) => void>;
  onCompare$?: QRL<(productId: string, selected: boolean) => void>;
  onQuickView$?: QRL<(productId: string) => void>;
  onClick$?: QRL<(productId: string) => void>;
}

export const ProductCard = component$<ProductCardProps>(({
  product,
  variant = 'default',
  size = 'md',
  showQuickActions = true,
  showCompare = false,
  onAddToCart$,
  onWishlist$,
  onCompare$,
  onQuickView$,
  onClick$,
  'data-testid': testId,
  class: qwikClass,
  className,
  style,
  ...rest
}) => {
  const cardClasses = mergeClasses(
    'product-card',
    'bg-white rounded-lg border border-neutral-lighter',
    'hover:shadow-lg hover:border-primary-200',
    'transition-all duration-200',
    'relative overflow-hidden',
    size === 'sm' && 'p-3',
    size === 'md' && 'p-4',
    size === 'lg' && 'p-6',
    variant === 'compact' && 'flex flex-row space-x-3',
    !product.inStock && 'opacity-75',
    qwikClass,
    className
  );

  const discountSavings = product.mrp - product.discountedPrice;
  const formattedRating = product.rating.toFixed(1);

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'authentic': return 'success';
      case 'bestseller': return 'warning';
      case 'recommended': return 'info';
      case '1mg-choice': return 'primary';
      default: return 'secondary';
    }
  };

  return (
    <div 
      class={cardClasses}
      style={style}
      data-testid={testId}
      onClick$={() => onClick$?.(product.id)}
      {...rest}
    >
      {/* Badges */}
      {product.badges && product.badges.length > 0 && (
        <div class="absolute top-2 left-2 z-10 flex flex-wrap gap-1">
          {product.badges.map((badge) => (
            <Badge
              key={badge}
              color={getBadgeColor(badge)}
              size="sm"
              class="text-xs font-medium"
            >
              {badge.replace('-', ' ').toUpperCase()}
            </Badge>
          ))}
        </div>
      )}

      {/* Wishlist & Compare Actions */}
      <div class="absolute top-2 right-2 z-10 flex flex-col gap-1">
        {showCompare && (
          <button
            class="p-1 bg-white rounded-md shadow-sm border border-neutral-lighter transition-colors duration-200 hover:bg-neutral-lightest"
            onClick$={(e) => {
              e.stopPropagation();
              const target = e.target as HTMLInputElement;
              onCompare$?.(product.id, target.checked);
            }}
          >
            <input type="checkbox" class="w-3 h-3" />
          </button>
        )}
        <button
          class="p-1 bg-white rounded-md shadow-sm border border-neutral-lighter transition-colors duration-200 hover:bg-error-lightest hover:text-error"
          onClick$={(e) => {
            e.stopPropagation();
            onWishlist$?.(product.id);
          }}
        >
          <Icon icon="heart" class="w-4 h-4" />
        </button>
      </div>

      {/* Product Image */}
      <div class={[
        'product-image',
        variant === 'compact' ? 'w-20 h-20 flex-shrink-0' : 'w-full h-40 mb-3',
        'bg-neutral-50 rounded-md overflow-hidden',
        'flex items-center justify-center'
      ].join(' ')}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            class="w-full h-full object-contain"
            loading="lazy"
            width="200"
            height="200"
          />
        ) : (
          <Icon icon="pill" class="w-8 h-8 text-neutral-400" />
        )}
      </div>

      {/* Product Content */}
      <div class={variant === 'compact' ? 'flex-1 min-w-0' : 'w-full'}>
        {/* Product Name & Details */}
        <div class="mb-2">
          <Text 
            as="h3" 
            weight="medium" 
            color="gray-900" 
            class={[
              'line-clamp-2',
              size === 'sm' ? 'text-sm' : 'text-base'
            ].join(' ')}
          >
            {product.name}
          </Text>
          
          {product.genericName && (
            <Text as="p" size="xs" color="gray-500" class="mt-1">
              Generic: {product.genericName}
            </Text>
          )}
          
          <div class="flex items-center gap-2 mt-1 text-xs text-neutral-500">
            <span>{product.manufacturer}</span>
            {product.strength && <span>• {product.strength}</span>}
            {product.packSize && <span>• {product.packSize}</span>}
          </div>
        </div>

        {/* Rating & Reviews */}
        {product.rating > 0 && (
          <div class="flex items-center gap-1 mb-2">
            <div class="flex items-center gap-1 px-2 py-1 bg-success-100 rounded text-xs">
              <Icon icon="trending-up" class="w-3 h-3 text-success-600 fill-current" />
              <span class="font-medium text-success-800">{formattedRating}</span>
            </div>
            <span class="text-xs text-neutral-500">({product.reviewCount} reviews)</span>
          </div>
        )}

        {/* Pricing */}
        <div class="mb-3">
          <div class="flex items-center gap-2">
            <span class={[
              'font-semibold text-neutral-900',
              size === 'sm' ? 'text-sm' : 'text-lg'
            ].join(' ')}>
              ₹{product.discountedPrice.toLocaleString()}
            </span>
            {product.discountPercentage > 0 && (
              <>
                <span class="text-sm text-neutral-500 line-through">
                  ₹{product.mrp.toLocaleString()}
                </span>
                <span class="text-xs font-medium text-success-600">
                  {product.discountPercentage}% OFF
                </span>
              </>
            )}
          </div>
          
          {product.discountPercentage > 0 && (
            <Text as="p" size="xs" color="gray-600" class="mt-1">
              You save ₹{discountSavings.toLocaleString()}
            </Text>
          )}
        </div>

        {/* Delivery Info */}
        {(product.fastDelivery || product.freeDelivery) && (
          <div class="flex flex-wrap gap-1 mb-3">
            {product.fastDelivery && (
              <Badge color="info" size="sm">
                Fast Delivery
              </Badge>
            )}
            {product.freeDelivery && (
              <Badge color="success" size="sm">
                Free Delivery
              </Badge>
            )}
          </div>
        )}

        {/* Prescription Required */}
        {product.prescriptionRequired && (
          <div class="flex items-center gap-1 mb-3 text-xs text-orange-600">
            <Icon icon="file-text" class="w-3 h-3" />
            <span>Prescription Required</span>
          </div>
        )}

        {/* Actions */}
        <div class="flex gap-2">
          {product.inStock ? (
            <>
              <Button
                variant="elevated"
                color="primary"
                size={size === 'sm' ? 'xs' : 'sm'}
                class="flex-1"
                onClick$={() => onAddToCart$?.(product.id)}
              >
                Add to Cart
              </Button>
              {showQuickActions && (
                <Button
                  variant="outlined"
                  size={size === 'sm' ? 'xs' : 'sm'}
                  onClick$={() => onQuickView$?.(product.id)}
                >
                  Quick View
                </Button>
              )}
            </>
          ) : (
            <Button
              variant="outlined"
              size={size === 'sm' ? 'xs' : 'sm'}
              disabled
              class="flex-1"
            >
              Out of Stock
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
