import { Type } from '@angular/core';

/**
 * TabLazyComponentMap
 * --------------------
 * Maps tab IDs to dynamic component loaders for lazy-loaded tab components.
 * Used by TabComponent to load components dynamically when a tab is activated.
 */
export const TabLazyComponentMap: Record<string, () => Promise<Type<any>>> = {
  'page-header': () =>
    import('../shared/components/page-header/page-header.component').then(
      (m) => m.PageHeaderComponent,
    ),
  'filled-button': () =>
    import('../shared/components/filled-button/filled-button.component').then(
      (m) => m.FilledButtonComponent,
    ),
};
