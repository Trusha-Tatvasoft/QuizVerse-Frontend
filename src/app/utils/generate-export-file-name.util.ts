import { exportFileNameTemplate } from './constants';

export function generateExportFileName(prefix: string): string {
  const today = new Date().toISOString().split('T')[0];
  return exportFileNameTemplate.replace('{prefix}', prefix).replace('{date}', today);
}
