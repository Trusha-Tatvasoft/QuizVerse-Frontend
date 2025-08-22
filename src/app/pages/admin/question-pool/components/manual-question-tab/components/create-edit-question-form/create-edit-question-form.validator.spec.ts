import { FormGroup, FormControl } from '@angular/forms';
import { uniqueOptionsGroupValidator } from './create-edit-question-form.validator';

describe('uniqueOptionsGroupValidator', () => {
  let group: FormGroup;

  beforeEach(() => {
    group = new FormGroup({});
  });

  it('should clear the notUnique error when the control value becomes unique again', () => {
    const control1 = new FormControl('option1');
    const control2 = new FormControl('option1');
    group.addControl('option1', control1);
    group.addControl('option2', control2);

    const validator = uniqueOptionsGroupValidator(['option1', 'option2']);
    validator(group);

    expect(control1.errors).toEqual({ notUnique: true });
    expect(control2.errors).toEqual({ notUnique: true });
    control2.setValue('option2');
    validator(group);

    expect(control1.errors).toBeNull();
    expect(control2.errors).toBeNull();
  });

  it('should mark both controls as notUnique if they have the same value', () => {
    const control1 = new FormControl('option1');
    const control2 = new FormControl('option1');
    group.addControl('option1', control1);
    group.addControl('option2', control2);

    const validator = uniqueOptionsGroupValidator(['option1', 'option2']);
    validator(group);

    expect(control1.errors).toEqual({ notUnique: true });
    expect(control2.errors).toEqual({ notUnique: true });
  });

  it('should not add a notUnique error when values are unique', () => {
    const control1 = new FormControl('option1');
    const control2 = new FormControl('option2');
    group.addControl('option1', control1);
    group.addControl('option2', control2);

    const validator = uniqueOptionsGroupValidator(['option1', 'option2']);
    validator(group);

    expect(control1.errors).toBeNull();
    expect(control2.errors).toBeNull();
  });

  it('should remove notUnique error when value becomes empty', () => {
    const control1 = new FormControl('option1');
    const control2 = new FormControl('option1');
    group.addControl('option1', control1);
    group.addControl('option2', control2);

    const validator = uniqueOptionsGroupValidator(['option1', 'option2']);
    validator(group);

    expect(control1.errors).toEqual({ notUnique: true });
    expect(control2.errors).toEqual({ notUnique: true });

    control2.setValue('');
    validator(group);

    expect(control1.errors).toBeNull();
    expect(control2.errors).toBeNull();
  });

  it('should clear the notUnique error if no other errors exist', () => {
    const control1 = new FormControl('option1');
    group.addControl('option1', control1);

    const validator = uniqueOptionsGroupValidator(['option1']);
    validator(group);

    expect(control1.errors).toBeNull();

    control1.setErrors({ notUnique: true });
    validator(group);

    expect(control1.errors).toBeNull();
  });

  it('should handle when group.get returns null for a control', () => {
    const control1 = new FormControl('option1');
    group.addControl('option1', control1);

    const validator = uniqueOptionsGroupValidator(['option1', 'option2']);
    validator(group);

    const nonExistentControl = group.get('option2');
    expect(nonExistentControl).toBeNull();
  });
  it('should clear notUnique error and setErrors(null) if no other errors remain', () => {
    const control1 = new FormControl('option1');
    group.addControl('option1', control1);

    control1.setErrors({ notUnique: true });

    const validator = uniqueOptionsGroupValidator(['option1']);
    validator(group);

    expect(control1.errors).toBeNull();
  });

  it('should clear notUnique error but keep other errors', () => {
    const control1 = new FormControl('option1');
    group.addControl('option1', control1);

    control1.setErrors({ notUnique: true, required: true });

    const validator = uniqueOptionsGroupValidator(['option1']);
    validator(group);

    expect(control1.errors).toEqual({ required: true });
  });

  it('should return null if control is not a FormGroup', () => {
    const control = new FormControl('some value');
    const validator = uniqueOptionsGroupValidator(['option1']);

    const result = validator(control);

    expect(result).toBeNull();
  });

  it('should call setErrors(null) when errors become empty (Object.keys({}) path)', () => {
    const control = new FormControl('duplicate');
    const group = new FormGroup({ option1: control });

    control.setErrors({ notUnique: true });

    const setErrorsSpy = jest.spyOn(control, 'setErrors');

    const validator = uniqueOptionsGroupValidator(['option1']);
    validator(group);

    expect(setErrorsSpy).toHaveBeenCalledWith(null);
    expect(control.errors).toBeNull();
  });
});
