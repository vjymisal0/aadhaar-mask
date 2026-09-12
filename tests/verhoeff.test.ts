import { describe, it, expect } from 'vitest';
import {
  validateVerhoeff,
  generateVerhoeffCheckDigit,
  appendVerhoeffCheckDigit,
  D5_TABLE,
  PERMUTATION_TABLE,
  INVERSE_TABLE,
} from '../src/verhoeff';
import { AadhaarValidationError } from '../src/errors';

describe('Verhoeff Algorithm', () => {
  it('should have standard mathematical table dimensions', () => {
    expect(D5_TABLE).toHaveLength(10);
    expect(D5_TABLE[0]).toHaveLength(10);
    expect(PERMUTATION_TABLE).toHaveLength(8);
    expect(PERMUTATION_TABLE[0]).toHaveLength(10);
    expect(INVERSE_TABLE).toHaveLength(10);
  });

  it('should calculate correct check digit for classic textbook example (236 -> 3)', () => {
    // Standard Verhoeff example: "236" yields check digit 3, giving "2363"
    const checkDigit = generateVerhoeffCheckDigit('236');
    expect(checkDigit).toBe(3);
    expect(validateVerhoeff('2363')).toBe(true);
  });

  it('should append check digit correctly', () => {
    const appended = appendVerhoeffCheckDigit('236');
    expect(appended).toBe('2363');
    expect(validateVerhoeff(appended)).toBe(true);
  });

  it('should detect single-digit transcription errors', () => {
    // Any single digit alteration in 2363 must fail
    expect(validateVerhoeff('2363')).toBe(true);
    for (let i = 0; i <= 9; i++) {
      if (i !== 3) {
        expect(validateVerhoeff(`236${i}`)).toBe(false);
      }
      if (i !== 2) {
        expect(validateVerhoeff(`${i}363`)).toBe(false);
      }
    }
  });

  it('should detect adjacent transposition errors', () => {
    // 2363 -> swapping adjacent digits
    expect(validateVerhoeff('3263')).toBe(false); // swapped 2 and 3
    expect(validateVerhoeff('2633')).toBe(false); // swapped 3 and 6
  });

  it('should return false for invalid strings in validateVerhoeff', () => {
    expect(validateVerhoeff('')).toBe(false);
    expect(validateVerhoeff('abc')).toBe(false);
    expect(validateVerhoeff('123a45')).toBe(false);
    // @ts-expect-error test non-string
    expect(validateVerhoeff(null)).toBe(false);
    // @ts-expect-error test non-string
    expect(validateVerhoeff(undefined)).toBe(false);
  });

  it('should throw AadhaarValidationError for invalid inputs in generateVerhoeffCheckDigit', () => {
    expect(() => generateVerhoeffCheckDigit('')).toThrow(AadhaarValidationError);
    expect(() => generateVerhoeffCheckDigit('abc')).toThrow(AadhaarValidationError);
    // @ts-expect-error test non-string
    expect(() => generateVerhoeffCheckDigit(12345)).toThrow(AadhaarValidationError);
  });
});
