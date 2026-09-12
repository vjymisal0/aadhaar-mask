export type AadhaarValidationErrorCode =
  | 'INVALID_TYPE'
  | 'EMPTY_INPUT'
  | 'INVALID_LENGTH'
  | 'CONTAINS_NON_DIGITS'
  | 'RESERVED_PREFIX'
  | 'REPEATING_DIGITS'
  | 'INVALID_CHECKSUM'
  | 'INVALID_MASK_CHAR';

export class AadhaarValidationError extends Error {
  readonly code: AadhaarValidationErrorCode;

  constructor(message: string, code: AadhaarValidationErrorCode) {
    super(message);
    this.name = 'AadhaarValidationError';
    this.code = code;

    // Maintain prototype chain in transpiled environments
    Object.setPrototypeOf(this, AadhaarValidationError.prototype);
  }
}
