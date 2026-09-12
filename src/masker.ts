import { AadhaarValidationError } from './errors';
import { validateAadhaar } from './validator';

export interface AadhaarMaskOptions {
  /**
   * Separator placed between 4-digit groups.
   * Default: `' '` (space) -> `"XXXX XXXX 1234"`
   * Set to `'-'` for hyphens -> `"XXXX-XXXX-1234"`
   * Set to `''` for no separator -> `"XXXXXXXX1234"`
   */
  separator?: string;

  /**
   * Character used to mask each of the first 8 digits.
   * Must be a single character.
   * Default: `'X'`
   * Example: `'*'` -> `"**** **** 1234"`
   */
  maskChar?: string;

  /**
   * Validation behavior before masking:
   * - `true` | `'strict'`: Validates format, 0/1 prefix, repeating digits, and Verhoeff checksum.
   *   Throws `AadhaarValidationError` if invalid.
   * - `'lenient'`: Validates that the input contains exactly 12 numeric digits, skipping checksum.
   * - `false` | `'none'`: Skips full validation, only requires 12 digits.
   * Default: `true`
   */
  validate?: boolean | 'strict' | 'lenient' | 'none';
}

/**
 * Masks the first 8 digits of a 12-digit Aadhaar number per UIDAI and RBI KYC compliance regulations.
 * Only the final 4 digits remain visible (e.g. "XXXX XXXX 1234").
 *
 * @param aadhaar - The raw or formatted Aadhaar number string
 * @param options - Masking options (separator, maskChar, validate)
 * @returns Masked Aadhaar string
 * @throws {AadhaarValidationError} if validation fails or inputs are invalid
 */
export function maskAadhaar(aadhaar: string, options?: AadhaarMaskOptions): string {
  if (typeof aadhaar !== 'string') {
    throw new AadhaarValidationError('Aadhaar number must be a string', 'INVALID_TYPE');
  }

  const separator = options?.separator !== undefined ? options.separator : ' ';
  const maskChar = options?.maskChar !== undefined ? options.maskChar : 'X';
  const validateMode = options?.validate !== undefined ? options.validate : true;

  if (maskChar.length !== 1) {
    throw new AadhaarValidationError('maskChar must be a single character', 'INVALID_MASK_CHAR');
  }

  const clean = aadhaar.replace(/[\s-]/g, '');

  if (clean.length === 0) {
    throw new AadhaarValidationError('Aadhaar number cannot be empty', 'EMPTY_INPUT');
  }

  if (!/^\d+$/.test(clean)) {
    throw new AadhaarValidationError(
      'Aadhaar number must contain only digits, spaces, or hyphens',
      'CONTAINS_NON_DIGITS'
    );
  }

  if (clean.length !== 12) {
    throw new AadhaarValidationError(
      `Aadhaar number must be exactly 12 digits (received ${clean.length})`,
      'INVALID_LENGTH'
    );
  }

  const isStrict = validateMode === true || validateMode === 'strict';

  if (isStrict) {
    const result = validateAadhaar(clean);
    if (!result.isValid) {
      throw new AadhaarValidationError(
        result.error || 'Invalid Aadhaar number',
        result.code || 'INVALID_CHECKSUM'
      );
    }
  }

  const part1 = maskChar.repeat(4);
  const part2 = maskChar.repeat(4);
  const part3 = clean.slice(8);

  if (separator === '') {
    return `${part1}${part2}${part3}`;
  }

  return `${part1}${separator}${part2}${separator}${part3}`;
}

/**
 * Checks whether a given string is already in masked Aadhaar format.
 * Matches patterns like "XXXX XXXX 1234", "XXXX-XXXX-1234", "XXXXXXXX1234", "**** **** 1234", etc.
 *
 * @param aadhaar - The string to check
 * @returns boolean indicating if the string is masked
 */
export function isAadhaarMasked(aadhaar: string): boolean {
  if (typeof aadhaar !== 'string') {
    return false;
  }

  const trimmed = aadhaar.trim();

  // Pattern 1: 4 masked + sep + 4 masked + sep + 4 digits
  // Separator can be space, hyphen
  const separatedPattern = /^([^0-9\s-]{4})([\s-])([^0-9\s-]{4})\2(\d{4})$/;
  if (separatedPattern.test(trimmed)) {
    return true;
  }

  // Pattern 2: 8 masked without separator + 4 digits
  const compactPattern = /^([^0-9]{8})(\d{4})$/;
  return compactPattern.test(trimmed);
}
