import { TimeAgoPipe } from './time-ago.pipe';

describe('TimeAgoPipe', () => {
  let pipe: TimeAgoPipe;
  const now = new Date();

  beforeEach(() => {
    pipe = new TimeAgoPipe();
    jest.useFakeTimers().setSystemTime(now);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "just now" for dates within the last few seconds', () => {
    const recentDate = new Date(now.getTime() - 5 * 1000);
    expect(pipe.transform(recentDate)).toBe('Just Now');
  });

  it('should format minutes correctly', () => {
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    expect(pipe.transform(oneMinuteAgo)).toBe('1 min ago');

    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect(pipe.transform(fiveMinutesAgo)).toBe('5 mins ago');
  });

  it('should format hours correctly', () => {
    const oneHourAgo = new Date(now.getTime() - 3600 * 1000);
    expect(pipe.transform(oneHourAgo)).toBe('1 hr ago');

    const threeHoursAgo = new Date(now.getTime() - 3 * 3600 * 1000);
    expect(pipe.transform(threeHoursAgo)).toBe('3 hrs ago');
  });

  it('should format days correctly', () => {
    const yesterday = new Date(now.getTime() - 86400 * 1000);
    expect(pipe.transform(yesterday)).toBe('Yesterday');

    const threeDaysAgo = new Date(now.getTime() - 3 * 86400 * 1000);
    expect(pipe.transform(threeDaysAgo)).toBe('3 Days ago');
  });

  it('should format weeks correctly', () => {
    const lastWeek = new Date(now.getTime() - 7 * 86400 * 1000);
    expect(pipe.transform(lastWeek)).toBe('Last Week');

    const twoWeeksAgo = new Date(now.getTime() - 14 * 86400 * 1000);
    expect(pipe.transform(twoWeeksAgo)).toBe('2 Weeks ago');
  });

  it('should format months correctly', () => {
    const lastMonth = new Date(now.getTime() - 30 * 86400 * 1000);
    expect(pipe.transform(lastMonth)).toBe('Last Month');

    const threeMonthsAgo = new Date(now.getTime() - 90 * 86400 * 1000);
    expect(pipe.transform(threeMonthsAgo)).toBe('3 Months ago');
  });

  it('should format years correctly', () => {
    const oneYearAgo = new Date(now.getTime() - 365 * 86400 * 1000);
    expect(pipe.transform(oneYearAgo)).toBe('1 Year ago');

    const twoYearsAgo = new Date(now.getTime() - 2 * 365 * 86400 * 1000);
    expect(pipe.transform(twoYearsAgo)).toBe('2 Years ago');
  });

  it('should return empty string when value is null/undefined', () => {
    expect(pipe.transform(null as any)).toBe('');
    expect(pipe.transform(undefined as any)).toBe('');
  });
});
