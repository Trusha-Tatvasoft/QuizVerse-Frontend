import { FilenameTruncatePipe } from './filename-truncate.pipe';

describe('FilenameTruncatePipe', () => {
  let pipe: FilenameTruncatePipe;

  beforeEach(() => {
    pipe = new FilenameTruncatePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string when value is null, undefined or empty', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('should not truncate when value length is within maxLength', () => {
    const shortName = 'short.png';
    expect(pipe.transform(shortName)).toBe(shortName);
  });

  it('should truncate when value length exceeds default maxLength (desktop)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });

    const longName = 'averylongfilenameexample1234567890.png';
    const result = pipe.transform(longName, 20);

    expect(result.length).toBeLessThanOrEqual(20);
    expect(result).toContain('...');
  });

  it('should truncate with maxLength = 14 when width < 400', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 399 });

    const longName = 'thisisaverylongfilename.png';
    const result = pipe.transform(longName);

    expect(result.length).toBeLessThanOrEqual(14);
    expect(result).toContain('...');
  });

  it('should truncate with maxLength = 18 when width < 576', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });

    const longName = 'anotherlongfilenameexample.png';
    const result = pipe.transform(longName);

    expect(result.length).toBeLessThanOrEqual(18);
    expect(result).toContain('...');
  });

  it('should respect custom defaultMaxLength parameter', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });

    const longName = 'customlengthfilenameexample.png';
    const result = pipe.transform(longName, 10);

    expect(result.length).toBeLessThanOrEqual(10);
    expect(result).toContain('...');
  });
});
