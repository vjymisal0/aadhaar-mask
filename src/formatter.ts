import { AadhaarValidationError } from './errors';

/**
 * Pretty-formats a 12-digit Aadhaar number into three 4-digit groups (e.g. "XXXX XXXX XXXX").
 *
 * @param aadhaar - Raw or partially formatted Aadhaar number
 * @param separator - Separator between 4-digit groups (default: `' '`)
 * @returns Formatted Aadhaar string (e.g. "2345 6789 1234")
 * @throws {AadhaarValidationError} if input is not 12 numeric digits
 */
export function formatAadhaar(aadhaar: string, separator: string = ' '): string {
  if (typeof aadhaar !== 'string') {
    throw new AadhaarValidationError('Aadhaar number must be a string', 'INVALID_TYPE');
  }

  const clean = unformatAadhaar(aadhaar);

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

  const p1 = clean.slice(0, 4);
  const p2 = clean.slice(4, 8);
  const p3 = clean.slice(8, 12);

  if (separator === '') {
    return clean;
  }

  return `${p1}${separator}${p2}${separator}${p3}`;
}

/**
 * Removes all spaces and hyphens from an Aadhaar string.
 *
 * @param aadhaar - The formatted Aadhaar string
 * @returns Unformatted string containing only the characters excluding spaces and hyphens
 */
export function unformatAadhaar(aadhaar: string): string {
  if (typeof aadhaar !== 'string') {
    return '';
  }
  return aadhaar.replace(/[\s-]/g, '');
}
