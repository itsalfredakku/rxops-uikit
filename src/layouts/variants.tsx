import { component$, Slot } from "@builder.io/qwik";
import { Layout, type LayoutProps } from "./layout";
import type { BaseComponentProps } from "../design-system/props";

/**
 * EmptyLayout - Minimal layout with no header, sidebar, or footer
 * Perfect for auth screens, landing pages, or full-screen experiences
 */
export const EmptyLayout = component$<BaseComponentProps<HTMLDivElement>>((props) => {
  return (
    <Layout
      hasHeader={false}
      hasSidebar={false}
      hasFooter={false}
      hasBreadcrumbs={false}
      background="none"
      maxWidth="full"
      {...props}
    >
      <Slot />
    </Layout>
  );
});

/**
 * PublicLayout - Standard public-facing layout with header and footer
 * Ideal for marketing pages, public information, and unauthenticated content
 */
export const PublicLayout = component$<BaseComponentProps<HTMLDivElement>>((props) => {
  return (
    <Layout
      hasHeader={true}
      hasSidebar={false}
      hasFooter={true}
      hasBreadcrumbs={false}
      background="white"
      maxWidth="lg"
      headerClass="layout-header--public"
      {...props}
    >
      <Slot name="header" />
      <Slot name="footer" />
      <Slot />
    </Layout>
  );
});

/**
 * AuthLayout - Authentication and onboarding layout
 * Centered content with minimal distractions for login, signup, and auth flows
 */
export const AuthLayout = component$<BaseComponentProps<HTMLDivElement>>((props) => {
  return (
    <Layout
      hasHeader={false}
      hasSidebar={false}
      hasFooter={false}
      hasBreadcrumbs={false}
      background="light"
      maxWidth="sm"
      mainClass="layout-main--centered"
      {...props}
    >
      <Slot />
    </Layout>
  );
});

/**
 * UserLayout - Standard user dashboard layout with header and optional sidebar
 * For authenticated user experiences like patient dashboards
 */
export const UserLayout = component$<Partial<LayoutProps>>((props) => {
  return (
    <Layout
      hasHeader={true}
      hasSidebar={false}
      hasFooter={false}
      hasBreadcrumbs={true}
      background="light"
      maxWidth="lg"
      headerClass="layout-header--user"
      {...props}
    >
      <Slot name="header" />
      <Slot name="breadcrumb" />
      <Slot />
    </Layout>
  );
});

/**
 * AdminLayout - Full admin dashboard layout with sidebar navigation
 * For administrative interfaces with complex navigation needs
 */
export const AdminLayout = component$<Partial<LayoutProps>>((props) => {
  return (
    <Layout
      hasHeader={true}
      hasSidebar={true}
      hasFooter={false}
      hasBreadcrumbs={true}
      collapsibleSidebar={true}
      defaultCollapsed={false}
      background="light"
      maxWidth="full"
      headerClass="layout-header--admin"
      sidebarClass="layout-sidebar--admin"
      {...props}
    >
      <Slot name="header" />
      <Slot name="sidebar" />
      <Slot name="breadcrumb" />
      <Slot />
    </Layout>
  );
});

/**
 * ProviderLayout - Healthcare provider dashboard layout
 * Optimized for medical professionals with quick access navigation
 */
export const ProviderLayout = component$<Partial<LayoutProps>>((props) => {
  return (
    <Layout
      hasHeader={true}
      hasSidebar={true}
      hasFooter={false}
      hasBreadcrumbs={true}
      collapsibleSidebar={true}
      defaultCollapsed={false}
      background="white"
      maxWidth="xl"
      headerClass="layout-header--provider"
      sidebarClass="layout-sidebar--provider"
      {...props}
    >
      <Slot name="header" />
      <Slot name="sidebar" />
      <Slot name="breadcrumb" />
      <Slot />
    </Layout>
  );
});
