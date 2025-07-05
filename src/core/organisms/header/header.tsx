import { component$, Slot } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses, mergeStyles } from "../../../design-system/props";
import { Container } from "../container/container";
import { Row } from "../../../layouts/row";

export interface HeaderProps extends BaseComponentProps<HTMLElement> {
  variant?: 'public' | 'admin' | 'user' | 'provider';
  sticky?: boolean;
  transparent?: boolean;
}

/**
 * Reusable Header Component
 * Flexible header that can be customized with slots for different layouts
 */
export const Header = component$<HeaderProps>((props) => {
  const { 
    variant = 'public',
    sticky = true,
    transparent = false,
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  const headerClasses = mergeClasses(
    "header",
    `header-${variant}`,
    sticky && "header-sticky",
    transparent && "header-transparent",
    qwikClass,
    className
  );

  // Merge styles if provided
  const finalStyle = mergeStyles(undefined, style);

  return (
    <header 
      class={headerClasses}
      style={finalStyle}
      {...rest}
    >
      <Container size="xl" padding="4">
        <Row alignItems="center" justifyContent="between" gap="6" class="min-h-14">
          <div class="header-brand flex-shrink-0">
            <Slot name="brand" />
          </div>
          
          <div class="header-nav flex-1 flex justify-center hidden md:flex">
            <Slot name="navigation" />
          </div>
          
          <div class="header-actions flex-shrink-0 flex items-center">
            <Slot name="actions" />
          </div>
          
          <div class="header-mobile-toggle block md:hidden">
            <Slot name="mobile-toggle" />
          </div>
        </Row>
      </Container>
      
      <style>{`
        .header {
          background: var(--white);
          border-bottom: 1px solid var(--gray-200);
          z-index: 1000;
          width: 100%;
        }
        
        .header-sticky {
          position: sticky;
          top: 0;
        }
        
        .header-transparent {
          background: transparent;
          border-bottom: none;
        }
        
        .header-public {
          box-shadow: var(--shadow-sm);
        }
        
        .header-admin {
          background: var(--white);
          box-shadow: var(--shadow-sm);
        }
        
        .header-user {
          background: var(--white);
          border-bottom: 1px solid var(--gray-200);
        }
        
        .header-provider {
          background: var(--white);
          border-bottom: 1px solid var(--gray-200);
        }
      `}</style>
    </header>
  );
});

export default Header;
