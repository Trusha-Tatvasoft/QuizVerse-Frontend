/**
 * Interface for dynamic form field configurations
 */
export interface DynamicFormField {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  validators: unknown[];
  options?: { value: unknown; label: string }[];
  icon?: string;
  validationMessages?: { [key: string]: string };
}
