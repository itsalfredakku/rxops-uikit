// New flexible layout system (primary export)
export { Layout } from "./layout";
export type { LayoutProps } from "./layout";

// Layout variants - pre-configured layouts for common use cases
export { 
  EmptyLayout,
  PublicLayout,
  AuthLayout,
  UserLayout,
  AdminLayout,
  ProviderLayout
} from "./variants";

// Layout components
export { Row } from "./row";
export { Column } from "./column";
export { Stack } from "./stack";

// Layout type definitions
export type LayoutType = 'standard' | 'public' | 'auth' | 'user' | 'admin' | 'provider';
