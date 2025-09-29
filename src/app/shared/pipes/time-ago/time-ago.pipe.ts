import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
})
export class TimeAgoPipe implements PipeTransform {
  private readonly intervals: { seconds: number; singular: string; plural: string }[] = [
    { seconds: 31536000, singular: '1 Year ago', plural: 'Years ago' },
    { seconds: 2592000, singular: 'Last Month', plural: 'Months ago' },
    { seconds: 604800, singular: 'Last Week', plural: 'Weeks ago' },
    { seconds: 86400, singular: 'Yesterday', plural: 'Days ago' },
    { seconds: 3600, singular: '1 hr ago', plural: 'hrs ago' },
    { seconds: 60, singular: '1 min ago', plural: 'mins ago' },
  ];

  transform(value: string | Date): string {
    if (!value) return '';

    const date = new Date(value);
    const now = new Date();
    const secondsElapsed = Math.floor((now.getTime() - date.getTime()) / 1000);

    for (const interval of this.intervals) {
      const count = Math.floor(secondsElapsed / interval.seconds);
      if (count >= 1) {
        return count === 1 ? interval.singular : `${count} ${interval.plural}`;
      }
    }

    return 'Just Now';
  }
}
