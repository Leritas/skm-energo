import type { AdminSectionId } from '~/constants/admin-sections';

declare module '#app' {
  interface PageMeta {
    adminSection?: AdminSectionId;
    adminStandalone?: boolean;
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    adminSection?: AdminSectionId;
    adminStandalone?: boolean;
  }
}

export {};
