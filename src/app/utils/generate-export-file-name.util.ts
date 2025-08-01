import { EXPORT_FILE_NAME_TEMPLATE } from './constants';

export function generateExportFileName(prefix: string): string {
  const today = new Date().toISOString().split('T')[0];
  return EXPORT_FILE_NAME_TEMPLATE.replace('{prefix}', prefix).replace('{date}', today);
}
