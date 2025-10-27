import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function noPastDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = new Date(control.value);
  if (selectedDate < today) {
    return { noPastDate: true };
  }
  return null;
}

export function afterStartDateValidator(startDateControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control.parent;
    if (!formGroup) return null;

    const startDate = formGroup.get(startDateControlName)?.value;
    const endDate = control.value;

    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);

    return end >= start ? null : { afterStartDate: true };
  };
}

export function afterCurrentStartDateValidator(previousDate: Date): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || !previousDate) return null;

    const previous = new Date(previousDate);
    const current = new Date(control.value);

    // Strip time → set both to midnight
    previous.setHours(0, 0, 0, 0);
    current.setHours(0, 0, 0, 0);

    return current >= previous ? null : { afterCurrentStartDate: true };
  };
}
