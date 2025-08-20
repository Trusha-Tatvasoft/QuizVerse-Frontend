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

  'manual-question-tab': () =>
    import(
      '../pages/admin/question-pool/components/manual-question-tab/manual-question-tab.component'
    ).then((m) => m.ManualQuestionTabComponent),
  'import-question-form': () =>
    import(
      '../pages/admin/question-pool/components/manual-question-tab/components/import-question-form/import-question-form.component'
    ).then((m) => m.ImportQuestionFormComponent),
  'create-edit-question-form': () =>
    import(
      '../pages/admin/question-pool/components/manual-question-tab/components/create-edit-question-form/create-edit-question-form.component'
    ).then((m) => m.CreateEditQuestionFormComponent),

  'ai-question-tab': () =>
    import(
      '../pages/admin/question-pool/components/ai-question-tab/ai-question-tab.component'
    ).then((m) => m.AiQuestionTabComponent),
  'from-text': () =>
    import(
      '../pages/admin/question-pool/components/ai-question-tab/components/from-text/from-text.component'
    ).then((m) => m.FromTextComponent),
  'from-pdf': () =>
    import(
      '../pages/admin/question-pool/components/ai-question-tab/components/from-pdf/from-pdf.component'
    ).then((m) => m.FromPdfComponent),
  'from-web-page': () =>
    import(
      '../pages/admin/question-pool/components/ai-question-tab/components/from-web-page/from-web-page.component'
    ).then((m) => m.FromWebPageComponent),
};
