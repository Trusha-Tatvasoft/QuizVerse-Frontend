import { FormControl } from '@angular/forms';
import { EmailTemplateType } from '../../../../../shared/enums/email-template.enum';
import { emailTemplatePlaceholdersRequired } from '../../../../../utils/constants';
import { bodyPlaceholdersValidator } from './email-template-form.validator';

describe('bodyPlaceholdersValidator', () => {
  it('should return null if templateType is null', () => {
    const validator = bodyPlaceholdersValidator(() => null);
    const control = new FormControl('Some body content');

    const result = validator(control);

    expect(result).toBeNull();
  });

  it('should return null if all required placeholders are present', () => {
    const templateType = EmailTemplateType.ResetPassword;
    const requiredPlaceholders = emailTemplatePlaceholdersRequired[templateType];

    const body = requiredPlaceholders.join(' ') + ' extra content';
    const validator = bodyPlaceholdersValidator(() => templateType);
    const control = new FormControl(body);

    const result = validator(control);

    expect(result).toBeNull();
  });

  it('should return error if some placeholders are missing', () => {
    const templateType = EmailTemplateType.ResetPassword;
    const requiredPlaceholders = emailTemplatePlaceholdersRequired[templateType];

    const body = requiredPlaceholders.slice(1).join(' '); // remove the first placeholder
    const validator = bodyPlaceholdersValidator(() => templateType);
    const control = new FormControl(body);

    const result = validator(control);

    expect(result).toEqual({
      missingPlaceholders: requiredPlaceholders[0],
    });
  });

  it('should return error if all placeholders are missing', () => {
    const templateType = EmailTemplateType.ResetPassword;
    const requiredPlaceholders = emailTemplatePlaceholdersRequired[templateType];

    const body = 'No placeholders here';
    const validator = bodyPlaceholdersValidator(() => templateType);
    const control = new FormControl(body);

    const result = validator(control);

    expect(result).toEqual({
      missingPlaceholders: requiredPlaceholders.join(', '),
    });
  });

  it('should handle empty body gracefully', () => {
    const templateType = EmailTemplateType.ResetPassword;
    const requiredPlaceholders = emailTemplatePlaceholdersRequired[templateType];

    const validator = bodyPlaceholdersValidator(() => templateType);
    const control = new FormControl('');

    const result = validator(control);

    expect(result).toEqual({
      missingPlaceholders: requiredPlaceholders.join(', '),
    });
  });

  it('should return null if templateType is defined but has no required placeholders', () => {
    const templateType = 'DummyTemplate' as unknown as EmailTemplateType;
    const validator = bodyPlaceholdersValidator(() => templateType);
    const control = new FormControl('Any content');

    expect(validator(control)).toBeNull();
  });
});
