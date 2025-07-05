import { component$, Slot } from '@builder.io/qwik';
import { BaseComponentProps, mergeClasses, mergeStyles } from '../../../design-system/props';
import { Row } from '../../../layouts/row';
import { Column } from '../../../layouts/column';

export interface FooterProps extends BaseComponentProps<HTMLElement> {
  variant?: 'public' | 'simple' | 'minimal';
}

export const Footer = component$<FooterProps>((props) => {
  const { 
    variant = 'public', 
    class: qwikClass,
    className,
    style,
    ...rest 
  } = props;
  
  const baseClasses = 'bg-neutral-900 text-white';
  
  const variantClasses = {
    public: 'py-12',
    simple: 'py-8',
    minimal: 'py-6'
  };

  const footerClasses = mergeClasses(
    baseClasses,
    variantClasses[variant],
    qwikClass,
    className
  );

  // Merge styles if provided
  const finalStyle = mergeStyles(undefined, style);

  return (
    <footer 
      class={footerClasses}
      style={finalStyle}
      {...rest}
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {variant === 'public' && (
          <Row gap="8" class="mb-8">
            {/* Brand Section */}
            <Column size={{ sm: 12, lg: 3 }}>
              <Slot name="brand" />
            </Column>
            
            {/* Content Links */}
            <Column size={{ sm: 12, lg: 6 }}>
              <Row gap="8">
                <Slot name="content" />
              </Row>
            </Column>
            
            {/* Apps and Newsletter */}
            <Column size={{ sm: 12, lg: 3 }} class="space-y-6">
              <Slot name="apps" />
              <Slot name="newsletter" />
            </Column>
          </Row>
        )}
        
        {variant === 'simple' && (
          <div class="space-y-4">
            <Slot />
          </div>
        )}
        
        {variant === 'minimal' && (
          <Slot />
        )}
        
        {/* Bottom Section */}
        <div class={variant === 'public' ? 'pt-8 border-t border-neutral-800' : ''}>
          <Slot name="bottom" />
        </div>
      </div>
    </footer>
  );
});
