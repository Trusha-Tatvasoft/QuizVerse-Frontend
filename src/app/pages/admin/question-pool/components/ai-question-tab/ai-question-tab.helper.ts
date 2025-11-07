import { FormGroup } from '@angular/forms';
import { TagInputConfig } from '../../../../../shared/interfaces/tag-component.interface';
import { QuestionGenerationFormat } from '../../interfaces/question-pool-ai-tab.interface';

export function createCategoryTag(category: string): TagInputConfig {
  return {
    id: category,
    label: category,
    type: 'static',
    isSelected: true,
    hasBorder: true,
    backgroundColor: 'yellow',
    textColor: 'lightYellow',
  };
}

export function getTotalQuestions(configs: QuestionGenerationFormat[]): number {
  return configs.reduce((total, group) => {
    return total + group.questionPerQuestionType.reduce((sum, q) => sum + q.noOfQuesitons, 0);
  }, 0);
}

export function resetFormControlsErrors(form: FormGroup): void {
  Object.keys(form.controls).forEach((key) => {
    const control = form.get(key);
    control?.setErrors(null);
    control?.markAsPristine();
    control?.markAsUntouched();
  });
}
