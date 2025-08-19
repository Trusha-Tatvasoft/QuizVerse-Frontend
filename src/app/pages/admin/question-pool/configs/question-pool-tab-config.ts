import { LazyTab } from '../../../../shared/interfaces/tab-component.interface';
import { tabLazyComponentMap } from '../../../../utils/tab-component-lazy-map';

export const questionFormDialogTabConfig: LazyTab[] = [
  {
    id: 'manual-question-tab',
    label: 'Manual',
    loadChildren: tabLazyComponentMap['manual-question-tab'],
  },
  {
    id: 'ai-question-tab',
    label: 'Using AI',
    loadChildren: tabLazyComponentMap['ai-question-tab'],
  },
];

export const manualQuestionFormTabConfig: LazyTab[] = [
  {
    id: 'manual-create-new',
    label: 'Create New',
    loadChildren: tabLazyComponentMap['create-edit-question-form'],
  },
  {
    id: 'manual-import-questions',
    label: 'Import CSV/Excel',
    loadChildren: tabLazyComponentMap['import-question-form'],
  },
];

export const aiQuestionFormTabConfig: LazyTab[] = [
  {
    id: 'ai-from-text',
    label: 'From Text',
    loadChildren: tabLazyComponentMap['from-text'],
  },
  {
    id: 'ai-from-pdf',
    label: 'From PDF',
    loadChildren: tabLazyComponentMap['from-pdf'],
  },
  {
    id: 'ai-from-web-page',
    label: 'From Web Page',
    loadChildren: tabLazyComponentMap['from-web-page'],
  },
];
