import { describe, it, expect } from 'vitest';
import { validateAadhaar, isValidAadhaar } from '../src/validator';
import { generateAadhaar } from '../src/generator';
import { appendVerhoeffCheckDigit } from '../src/verhoeff';

describe('Aadhaar Validator', () => {
  it('should validate synthetically generated valid Aadhaar numbers', () => {
    for (let i = 0; i < 20; i++) {
      const aadhaar = generateAadhaar();
      const result = validateAadhaar(aadhaar);
      expect(result.isValid).toBe(true);
      expect(result.cleanAadhaar).toBe(aadhaar);
      expect(isValidAadhaar(aadhaar)).toBe(true);
    }
  });

  it('should accept valid Aadhaar numbers formatted with spaces or hyphens', () => {
    const raw = generateAadhaar();
    const withSpaces = `${raw.slice(0, 4)} ${raw.slice(4, 8)} ${raw.slice(8)}`;
    const withHyphens = `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8)}`;

    const res1 = validateAadhaar(withSpaces);
    expect(res1.isValid).toBe(true);
    expect(res1.cleanAadhaar).toBe(raw);

    const res2 = validateAadhaar(withHyphens);
    expect(res2.isValid).toBe(true);
    expect(res2.cleanAadhaar).toBe(raw);
  });

  it('should reject numbers starting with 0 or 1 per UIDAI rules', () => {
    // Generate valid 11 digits starting with 0
    const startWith0 = appendVerhoeffCheckDigit('09876543210');
    const res0 = validateAadhaar(startWith0);
    expect(res0.isValid).toBe(false);
    expect(res0.code).toBe('RESERVED_PREFIX');
    expect(res0.error).toContain("cannot start with '0'");

    // Generate valid 11 digits starting with 1
    const startWith1 = appendVerhoeffCheckDigit('19876543210');
    const res1 = validateAadhaar(startWith1);
    expect(res1.isValid).toBe(false);
    expect(res1.code).toBe('RESERVED_PREFIX');
    expect(res1.error).toContain("cannot start with '1'");
  });

  it('should reject numbers with invalid length', () => {
    const tooShort = validateAadhaar('23456789123'); // 11 digits
    expect(tooShort.isValid).toBe(false);
    expect(tooShort.code).toBe('INVALID_LENGTH');

    const tooLong = validateAadhaar('2345678912345'); // 13 digits
    expect(tooLong.isValid).toBe(false);
    expect(tooLong.code).toBe('INVALID_LENGTH');
  });

  it('should reject repeating identical digits (e.g. 222222222222)', () => {
    // 222222222222, 333333333333, etc.
    for (let d = 2; d <= 9; d++) {
      const repeating = String(d).repeat(12);
      const res = validateAadhaar(repeating);
      expect(res.isValid).toBe(false);
      // It may fail REPEATING_DIGITS or INVALID_CHECKSUM, but if check digit matched, repeating is rejected
      if (res.code === 'REPEATING_DIGITS') {
        expect(res.error).toContain('identical digits');
      }
    }
  });

  it('should reject non-digit characters', () => {
    const res = validateAadhaar('2345-6789-ABCD');
    expect(res.isValid).toBe(false);
    expect(res.code).toBe('CONTAINS_NON_DIGITS');
  });

  it('should reject empty or whitespace-only inputs', () => {
    const res = validateAadhaar('   ');
    expect(res.isValid).toBe(false);
    expect(res.code).toBe('EMPTY_INPUT');
  });

  it('should reject non-string input types', () => {
    // @ts-expect-error test invalid type
    const res = validateAadhaar(123456789012);
    expect(res.isValid).toBe(false);
    expect(res.code).toBe('INVALID_TYPE');
  });

  it('should reject numbers with invalid Verhoeff checksum', () => {
    const valid = generateAadhaar();
    // Tamper the last digit
    const lastDigit = parseInt(valid[11]!, 10);
    const tamperedLast = (lastDigit + 1) % 10;
    const invalid = `${valid.slice(0, 11)}${tamperedLast}`;

    const res = validateAadhaar(invalid);
    expect(res.isValid).toBe(false);
    expect(res.code).toBe('INVALID_CHECKSUM');
  });
});
