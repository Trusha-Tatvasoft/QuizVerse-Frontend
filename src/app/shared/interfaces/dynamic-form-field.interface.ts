/**
 * Interface for dynamic form field configurations
 */
export interface DynamicFormField {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  validators: any[];
  options?: { value: any; label: string }[];
}
