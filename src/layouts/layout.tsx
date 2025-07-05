import { component$, Slot } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses } from "../design-system/props";
import { Container } from "../core/organisms/container/container";

/**
 * Layout props - A fully flexible layout system for all application types
 * 
 * @extends BaseComponentProps<HTMLDivElement> - Base component props with div element type
 */
export interface LayoutProps extends BaseComponentProps<HTMLDivElement> {
  /**
   * Whether the sidebar should be shown
   * @default false
   */
  hasSidebar?: boolean;
  
  /**
   * Whether the header should be shown
   * @default true
   */
  hasHeader?: boolean;

  /**
   * Whether the footer should be shown
   * @default false
   */
  hasFooter?: boolean;
  
  /**
   * Whether the breadcrumb area should be shown
   * @default false
   */
  hasBreadcrumbs?: boolean;
  
  /**
   * Whether the sidebar should be collapsible
   * @default false
   */
  collapsibleSidebar?: boolean;
  
  /**
   * Whether the sidebar is collapsed by default
   * @default false
   */
  defaultCollapsed?: boolean;
  
  /**
   * Maximum width for the content container
   * @default "lg"
   */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";

  /**
   * Background color or theme for the layout
   * @default "light"
   */
  background?: "light" | "dark" | "white" | "gray" | "brand" | "none";

  /**
   * Additional CSS classes for specific layout areas
   */
  headerClass?: string;
  sidebarClass?: string;
  mainClass?: string;
  footerClass?: string;
  breadcrumbClass?: string;
}

/**
 * Layout - A completely flexible layout system
 * 
 * This component provides a fully configurable layout foundation with:
 * - Optional header (Slot name="header")
 * - Optional sidebar (Slot name="sidebar")
 * - Main content area (default Slot)
 * - Optional breadcrumbs (Slot name="breadcrumb")
 * - Optional footer (Slot name="footer")
 * 
 * The layout is entirely driven by props and CSS classes, with no hardcoded layout types.
 * This allows for maximum flexibility when creating specialized layouts.
 * 
 * Examples of what can be built (demonstrated in demo project):
 * - Admin dashboards
 * - Public marketing pages
 * - Authentication screens
 * - Provider portals
 * - Patient dashboards
 * - Empty layouts
 */
export const Layout = component$<LayoutProps>((props) => {
  const { 
    class: qwikClass,
    className,
    style,
    hasSidebar = false,
    hasHeader = true,
    hasFooter = false,
    hasBreadcrumbs = false,
    collapsibleSidebar = false,
    defaultCollapsed = false,
    maxWidth = "lg",
    background = "light",
    headerClass,
    sidebarClass,
    mainClass,
    footerClass,
    breadcrumbClass,
    ...rest
  } = props;

  // Build the main layout class
  const layoutClasses = mergeClasses(
    "layout",
    hasSidebar && "layout--with-sidebar",
    hasHeader && "layout--with-header",
    hasFooter && "layout--with-footer",
    background !== "none" && `layout--bg-${background}`,
    collapsibleSidebar && "layout--collapsible-sidebar",
    defaultCollapsed && collapsibleSidebar && "layout--sidebar-collapsed",
    qwikClass,
    className
  );

  // Area-specific classes
  const headerClasses = mergeClasses(
    "layout-header",
    headerClass
  );

  const sidebarClasses = mergeClasses(
    "layout-sidebar",
    sidebarClass
  );

  const mainClasses = mergeClasses(
    "layout-main",
    mainClass
  );

  const footerClasses = mergeClasses(
    "layout-footer",
    footerClass
  );

  const breadcrumbClasses = mergeClasses(
    "layout-breadcrumb",
    breadcrumbClass
  );

  return (
    <div 
      class={layoutClasses}
      style={style}
      data-testid="layout"
      {...rest}
    >
      {hasHeader && (
        <header class={headerClasses} role="banner">
          <Slot name="header" />
        </header>
      )}
      
      <div class="layout-body">
        {hasSidebar && (
          <aside class={sidebarClasses} role="navigation" aria-label="Navigation">
            <Slot name="sidebar" />
          </aside>
        )}
        
        <main class={mainClasses} role="main">
          <Container 
            size={maxWidth} 
            centered 
            padding="8" 
            class="layout-content"
            data-testid="layout-content"
          >
            {hasBreadcrumbs && (
              <Container size="full" padding="4" class={breadcrumbClasses}>
                <Slot name="breadcrumb" />
              </Container>
            )}
            <Slot />
          </Container>
        </main>
      </div>

      {hasFooter && (
        <footer class={footerClasses} role="contentinfo">
          <Slot name="footer" />
        </footer>
      )}
      
      <style>{`
        /* Base layout styles */
        .layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        /* Background variations */
        .layout--bg-light {
          background: var(--gray-50);
        }
        
        .layout--bg-dark {
          background: var(--gray-900);
          color: var(--white);
        }
        
        .layout--bg-white {
          background: var(--white);
        }
        
        .layout--bg-gray {
          background: var(--gray-100);
        }
        
        .layout--bg-brand {
          background: var(--color-primary-lighter);
        }
        
        /* Header styles */
        .layout-header {
          background: var(--white);
          border-bottom: 1px solid var(--gray-200);
          z-index: 40;
          position: sticky;
          top: 0;
          box-shadow: var(--shadow-sm);
          height: 56px;
          display: flex;
          align-items: center;
        }
        
        /* Header can be customized through headerClass prop */
        
        /* Body layout */
        .layout-body {
          flex: 1;
          display: flex;
        }
        
        /* Sidebar styles */
        .layout-sidebar {
          width: 280px;
          background: var(--white);
          border-right: 1px solid var(--gray-200);
          position: sticky;
          top: 56px;
          height: calc(100vh - 56px);
          overflow-y: auto;
          box-shadow: var(--shadow-sm);
          transition: width 0.3s ease;
        }
        
        /* Sidebar can be customized through sidebarClass prop */
        
        /* Collapsible sidebar styles */
        .layout--collapsible-sidebar .layout-sidebar {
          transition: width 0.3s ease, transform 0.3s ease;
        }
        
        .layout--sidebar-collapsed .layout-sidebar {
          width: 80px;
          overflow-x: hidden;
        }
        
        /* Main content area */
        .layout-main {
          flex: 1;
          min-width: 0;
        }
        
        /* Main content can be customized through mainClass prop */
        
        /* Breadcrumb styles */
        .layout-breadcrumb {
          margin-bottom: var(--space-lg);
          border-bottom: 1px solid var(--gray-200);
        }
        
        /* Footer styles */
        .layout-footer {
          background: var(--white);
          border-top: 1px solid var(--gray-200);
          padding: var(--space-lg) 0;
        }
        
        /* Footer can be customized through footerClass prop */
        
        /* Responsive styles */
        @media (max-width: 1024px) {
          .layout-body {
            flex-direction: column;
          }
          
          .layout-sidebar {
            width: 100% !important;
            height: auto;
            position: static;
            border-right: none;
            border-bottom: 1px solid var(--gray-200);
          }
          
          .layout--sidebar-collapsed .layout-sidebar {
            width: 100% !important;
            height: 56px;
            overflow: hidden;
          }
          
          .layout-content {
            padding: var(--space-lg) !important;
          }
        }
        
        @media (max-width: 768px) {
          .layout-content {
            padding: var(--space-md) !important;
          }
          
          .layout-header {
            height: 48px;
          }
          
          .layout-header--public {
            height: 56px;
          }
        }
        
        /* Print styles */
        @media print {
          .layout-sidebar {
            display: none;
          }
          
          .layout-header {
            position: static;
            box-shadow: none;
          }
          
          .layout-content {
            padding: 0 !important;
          }
          
          .layout-breadcrumb {
            display: none;
          }
          
          .layout-footer {
            display: none;
          }
        }
      `}</style>
    </div>
  );
});

export default Layout;
