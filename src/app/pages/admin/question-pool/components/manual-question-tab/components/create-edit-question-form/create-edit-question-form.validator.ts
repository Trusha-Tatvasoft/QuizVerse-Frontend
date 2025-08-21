import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export function uniqueOptionsGroupValidator(optionKeys: string[]): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    if (!(group instanceof FormGroup)) return null;

    const seen = new Map<string, string>();

    optionKeys.forEach((key) => {
      const ctrl = group.get(key);
      const val = ctrl?.value?.trim();
      if (!ctrl) return;

      const removeNotUnique = () => {
        if (ctrl.errors?.['notUnique']) {
          delete ctrl.errors['notUnique'];
          ctrl.setErrors(Object.keys(ctrl.errors || {}).length ? ctrl.errors : null);
        }
      };

      if (!val) return removeNotUnique();

      if (seen.has(val)) {
        ctrl.setErrors({ ...ctrl.errors, notUnique: true });
        group.get(seen.get(val)!)?.setErrors({ notUnique: true });
      } else {
        seen.set(val, key);
        removeNotUnique();
      }
    });

    return null;
  };
}
