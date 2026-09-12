import { AadhaarValidationError } from './errors';

/**
 * Dihedral group D5 multiplication table.
 */
export const D5_TABLE: readonly (readonly number[])[] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
] as const;

/**
 * Permutation table p(pos, num).
 */
export const PERMUTATION_TABLE: readonly (readonly number[])[] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
] as const;

/**
 * Inverse table inv[j] where d[j][inv[j]] = 0.
 */
export const INVERSE_TABLE: readonly number[] = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9] as const;

/**
 * Validates a number string using the Verhoeff checksum algorithm.
 * Returns true if the string of digits is valid according to the Verhoeff algorithm.
 *
 * @param numStr - Numeric string (e.g. 12-digit Aadhaar number)
 * @returns boolean indicating validity
 */
export function validateVerhoeff(numStr: string): boolean {
  if (typeof numStr !== 'string' || numStr.length === 0 || !/^\d+$/.test(numStr)) {
    return false;
  }

  let c = 0;
  const len = numStr.length;

  for (let i = 0; i < len; i++) {
    // Read from right to left (index 0 is rightmost digit)
    const charCode = numStr.charCodeAt(len - 1 - i);
    const digit = charCode - 48; // '0' is 48
    const permuted = PERMUTATION_TABLE[i % 8]![digit]!;
    c = D5_TABLE[c]![permuted]!;
  }

  return c === 0;
}

/**
 * Generates the Verhoeff check digit for a given base number string.
 *
 * @param numStr - Numeric string without the check digit (e.g. 11 digits of an Aadhaar number)
 * @returns The check digit (number between 0 and 9)
 * @throws {AadhaarValidationError} if input is empty or contains non-digits
 */
export function generateVerhoeffCheckDigit(numStr: string): number {
  if (typeof numStr !== 'string' || numStr.length === 0) {
    throw new AadhaarValidationError(
      'Input must be a non-empty string of digits',
      'EMPTY_INPUT'
    );
  }

  if (!/^\d+$/.test(numStr)) {
    throw new AadhaarValidationError(
      'Input must contain only numeric digits',
      'CONTAINS_NON_DIGITS'
    );
  }

  let c = 0;
  const len = numStr.length;

  for (let i = 0; i < len; i++) {
    const charCode = numStr.charCodeAt(len - 1 - i);
    const digit = charCode - 48;
    const permuted = PERMUTATION_TABLE[(i + 1) % 8]![digit]!;
    c = D5_TABLE[c]![permuted]!;
  }

  return INVERSE_TABLE[c]!;
}

/**
 * Appends the Verhoeff check digit to the given numeric string.
 *
 * @param numStr - Base numeric string
 * @returns Complete numeric string with check digit appended
 */
export function appendVerhoeffCheckDigit(numStr: string): string {
  const checkDigit = generateVerhoeffCheckDigit(numStr);
  return `${numStr}${checkDigit}`;
}
