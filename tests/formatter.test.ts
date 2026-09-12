import { describe, it, expect } from 'vitest';
import { formatAadhaar, unformatAadhaar } from '../src/formatter';
import { AadhaarValidationError } from '../src/errors';

describe('Aadhaar Formatter', () => {
  it('should format 12 digits with spaces by default', () => {
    expect(formatAadhaar('234567891234')).toBe('2345 6789 1234');
  });

  it('should format with custom separator', () => {
    expect(formatAadhaar('234567891234', '-')).toBe('2345-6789-1234');
    expect(formatAadhaar('234567891234', '')).toBe('234567891234');
  });

  it('should reformat already formatted inputs cleanly', () => {
    expect(formatAadhaar('2345-6789-1234', ' ')).toBe('2345 6789 1234');
    expect(formatAadhaar('2345 6789 1234', '-')).toBe('2345-6789-1234');
  });

  it('should throw AadhaarValidationError for invalid inputs', () => {
    expect(() => formatAadhaar('1234')).toThrow(AadhaarValidationError);
    expect(() => formatAadhaar('abcdefghijkl')).toThrow(AadhaarValidationError);
    // @ts-expect-error test non-string
    expect(() => formatAadhaar(123456789012)).toThrow(AadhaarValidationError);
  });

  it('should unformat strings by stripping spaces and hyphens', () => {
    expect(unformatAadhaar('2345 6789 1234')).toBe('234567891234');
    expect(unformatAadhaar('2345-6789-1234')).toBe('234567891234');
    expect(unformatAadhaar('  2345-6789 1234  ')).toBe('234567891234');
    // @ts-expect-error test non-string
    expect(unformatAadhaar(null)).toBe('');
  });
});
