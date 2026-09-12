import { describe, it, expect } from 'vitest';
import { maskAadhaar, isAadhaarMasked } from '../src/masker';
import { generateAadhaar } from '../src/generator';
import { AadhaarValidationError } from '../src/errors';

describe('Aadhaar Masker', () => {
  it('should mask first 8 digits with spaces by default', () => {
    const aadhaar = generateAadhaar();
    const last4 = aadhaar.slice(8);
    const masked = maskAadhaar(aadhaar);
    expect(masked).toBe(`XXXX XXXX ${last4}`);
  });

  it('should support hyphen separator', () => {
    const aadhaar = generateAadhaar();
    const last4 = aadhaar.slice(8);
    const masked = maskAadhaar(aadhaar, { separator: '-' });
    expect(masked).toBe(`XXXX-XXXX-${last4}`);
  });

  it('should support empty separator for compact format', () => {
    const aadhaar = generateAadhaar();
    const last4 = aadhaar.slice(8);
    const masked = maskAadhaar(aadhaar, { separator: '' });
    expect(masked).toBe(`XXXXXXXX${last4}`);
  });

  it('should support custom mask character (* or •)', () => {
    const aadhaar = generateAadhaar();
    const last4 = aadhaar.slice(8);

    const maskedStar = maskAadhaar(aadhaar, { maskChar: '*' });
    expect(maskedStar).toBe(`**** **** ${last4}`);

    const maskedDot = maskAadhaar(aadhaar, { maskChar: '•' });
    expect(maskedDot).toBe(`•••• •••• ${last4}`);
  });

  it('should throw AadhaarValidationError for multi-char maskChar', () => {
    const aadhaar = generateAadhaar();
    expect(() => maskAadhaar(aadhaar, { maskChar: 'XX' })).toThrow(AadhaarValidationError);
  });

  it('should accept inputs that already contain spaces or hyphens', () => {
    const aadhaar = generateAadhaar();
    const last4 = aadhaar.slice(8);
    const formattedInput = `${aadhaar.slice(0, 4)}-${aadhaar.slice(4, 8)}-${last4}`;
    const masked = maskAadhaar(formattedInput);
    expect(masked).toBe(`XXXX XXXX ${last4}`);
  });

  it('should throw when strict validation fails', () => {
    // Starts with 0
    expect(() => maskAadhaar('012345678901')).toThrow(AadhaarValidationError);
    // Invalid checksum
    expect(() => maskAadhaar('234567890123')).toThrow(AadhaarValidationError);
  });

  it('should allow masking invalid checksum when validate: false or lenient', () => {
    // 234567890123 is 12 digits starting with 2, but likely invalid checksum
    const masked = maskAadhaar('234567890123', { validate: 'lenient' });
    expect(masked).toBe('XXXX XXXX 0123');

    const maskedNone = maskAadhaar('234567890123', { validate: false });
    expect(maskedNone).toBe('XXXX XXXX 0123');
  });

  it('should identify masked Aadhaar strings correctly with isAadhaarMasked', () => {
    expect(isAadhaarMasked('XXXX XXXX 1234')).toBe(true);
    expect(isAadhaarMasked('XXXX-XXXX-1234')).toBe(true);
    expect(isAadhaarMasked('XXXXXXXX1234')).toBe(true);
    expect(isAadhaarMasked('**** **** 9876')).toBe(true);
    expect(isAadhaarMasked('•••• •••• 5678')).toBe(true);

    // False cases
    expect(isAadhaarMasked('2345 6789 1234')).toBe(false);
    expect(isAadhaarMasked('XXXX 1234')).toBe(false);
    expect(isAadhaarMasked('XXXX XXXX XXXX')).toBe(false);
    expect(isAadhaarMasked('')).toBe(false);
    // @ts-expect-error test non-string
    expect(isAadhaarMasked(null)).toBe(false);
  });
});
