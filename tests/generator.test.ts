import { describe, it, expect } from 'vitest';
import { generateAadhaar } from '../src/generator';
import { validateAadhaar } from '../src/validator';

describe('Aadhaar Generator', () => {
  it('should generate valid 12-digit Aadhaar numbers', () => {
    for (let i = 0; i < 50; i++) {
      const aadhaar = generateAadhaar();
      expect(aadhaar).toHaveLength(12);
      expect(/^\d{12}$/.test(aadhaar)).toBe(true);

      // Must never start with 0 or 1
      expect(aadhaar[0]).not.toBe('0');
      expect(aadhaar[0]).not.toBe('1');

      // Must be valid according to validateAadhaar
      const validation = validateAadhaar(aadhaar);
      expect(validation.isValid).toBe(true);
      expect(validation.error).toBeUndefined();
    }
  });

  it('should format generated numbers when separator is passed', () => {
    const spaceFormatted = generateAadhaar({ separator: ' ' });
    expect(spaceFormatted).toMatch(/^\d{4} \d{4} \d{4}$/);

    const hyphenFormatted = generateAadhaar({ separator: '-' });
    expect(hyphenFormatted).toMatch(/^\d{4}-\d{4}-\d{4}$/);
  });

  it('should produce distinct random numbers', () => {
    const set = new Set<string>();
    for (let i = 0; i < 50; i++) {
      set.add(generateAadhaar());
    }
    // High probability of distinct numbers
    expect(set.size).toBeGreaterThan(45);
  });
});
