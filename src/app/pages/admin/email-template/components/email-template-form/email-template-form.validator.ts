import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { EmailTemplateType } from '../../../../../shared/enums/email-template.enum';
import { emailTemplatePlaceholdersRequired } from '../../../../../utils/constants';

export function bodyPlaceholdersValidator(
  getTemplateType: () => EmailTemplateType | null,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const bodyValue = control.value || '';
    const templateType = getTemplateType();

    if (!templateType) return null;

    const requiredPlaceholders = emailTemplatePlaceholdersRequired[templateType] || [];
    const missingPlaceholders = requiredPlaceholders.filter((ph) => !bodyValue.includes(ph));

    return missingPlaceholders.length
      ? { missingPlaceholders: missingPlaceholders.join(', ') }
      : null;
  };
}
