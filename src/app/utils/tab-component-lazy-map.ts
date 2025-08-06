import { Type } from '@angular/core';

/**
 * tabLazyComponentMap
 * --------------------
 * Maps tab IDs to dynamic component loaders for lazy-loaded tab components.
 * Used by TabComponent to load components dynamically when a tab is activated.
 */
export const tabLazyComponentMap: Record<string, () => Promise<Type<unknown>>> = {
  'page-header': () =>
    import('../shared/components/page-header/page-header.component').then(
      (m) => m.PageHeaderComponent,
    ),
  'filled-button': () =>
    import('../shared/components/filled-button/filled-button.component').then(
      (m) => m.FilledButtonComponent,
    ),
  'login-form': () =>
    import('../core/auth/components/login/login.component').then((m) => m.LoginComponent),
  'register-form': () =>
    import('../core/auth/components/register/register.component').then((m) => m.RegisterComponent),
};
