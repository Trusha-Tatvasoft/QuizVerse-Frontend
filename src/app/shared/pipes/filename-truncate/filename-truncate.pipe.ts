import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filenameTruncate',
  pure: false,
})
export class FilenameTruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, defaultMaxLength: number = 50): string {
    if (!value) return '';

    let maxLength = defaultMaxLength;

    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 400) {
        maxLength = 14;
      } else if (width < 576) {
        maxLength = 18;
      }
    }

    if (value.length <= maxLength) return value;

    const half = Math.floor((maxLength - 3) / 2);
    const start = value.slice(0, half);
    const end = value.slice(-half);

    return `${start}...${end}`;
  }
}
