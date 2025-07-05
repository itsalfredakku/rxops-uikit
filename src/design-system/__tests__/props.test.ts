import { describe, it, expect } from 'vitest';
import { mergeClasses } from '../props';

describe('mergeClasses utility', () => {
  describe('basic functionality', () => {
    it('merges multiple class strings', () => {
      expect(mergeClasses('class1', 'class2', 'class3')).toBe('class1 class2 class3');
    });

    it('handles empty input', () => {
      expect(mergeClasses()).toBe('');
    });

    it('handles single class', () => {
      expect(mergeClasses('single')).toBe('single');
    });
  });

  describe('edge case handling', () => {
    it('handles undefined values', () => {
      expect(mergeClasses('class1', undefined, 'class2')).toBe('class1 class2');
    });

    it('handles null values', () => {
      expect(mergeClasses('class1', null, 'class2')).toBe('class1 class2');
    });

    it('handles false values', () => {
      expect(mergeClasses('class1', false, 'class2')).toBe('class1 class2');
    });

    it('handles empty strings', () => {
      expect(mergeClasses('class1', '', 'class2')).toBe('class1 class2');
    });

    it('handles mixed falsy values', () => {
      expect(mergeClasses('class1', undefined, null, false, '', 'class2')).toBe('class1 class2');
    });
  });

  describe('conditional classes', () => {
    it('supports conditional class patterns', () => {
      const condition = true;
      expect(mergeClasses('base', condition && 'conditional')).toBe('base conditional');
    });

    it('filters out false conditionals', () => {
      const condition = false;
      expect(mergeClasses('base', condition && 'conditional')).toBe('base');
    });

    it('handles multiple conditionals', () => {
      const isActive = true;
      const isDisabled = false;
      expect(mergeClasses(
        'base',
        isActive && 'active',
        isDisabled && 'disabled'
      )).toBe('base active');
    });
  });

  describe('array support', () => {
    it('handles arrays of classes', () => {
      expect(mergeClasses(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
    });

    it('handles nested arrays', () => {
      expect(mergeClasses(['class1', ['class2', 'class3']], 'class4')).toBe('class1 class2 class3 class4');
    });

    it('handles arrays with conditionals', () => {
      const condition = true;
      expect(mergeClasses(['class1', condition && 'class2'], 'class3')).toBe('class1 class2 class3');
    });
  });

  describe('class string splitting', () => {
    it('splits space-separated classes', () => {
      expect(mergeClasses('class1 class2', 'class3 class4')).toBe('class1 class2 class3 class4');
    });

    it('handles mixed single and multiple classes', () => {
      expect(mergeClasses('single', 'class1 class2', 'another')).toBe('single class1 class2 another');
    });

    it('handles multiple spaces between classes', () => {
      expect(mergeClasses('class1  class2', 'class3   class4')).toBe('class1 class2 class3 class4');
    });
  });

  describe('deduplication and precedence', () => {
    it('removes duplicate classes', () => {
      expect(mergeClasses('class1', 'class2', 'class1')).toBe('class2 class1');
    });

    it('maintains order with last occurrence taking precedence', () => {
      expect(mergeClasses('base active', 'base disabled')).toBe('active base disabled');
    });

    it('handles complex duplication patterns', () => {
      expect(mergeClasses(
        'bg-primary-normal text-white',
        'bg-error-normal',
        'bg-primary-normal font-bold'
      )).toBe('text-white bg-error-normal bg-primary-normal font-bold');
    });

    it('preserves CSS cascade order', () => {
      // Later classes should override earlier ones
      expect(mergeClasses('bg-primary-normal', 'bg-error-normal')).toBe('bg-primary-normal bg-error-normal');
    });
  });

  describe('performance scenarios', () => {
    it('handles large class lists efficiently', () => {
      const largeClassList = Array.from({ length: 100 }, (_, i) => `class-${i}`);
      const result = mergeClasses(...largeClassList);
      expect(result).toBe(largeClassList.join(' '));
    });

    it('handles large class lists with duplicates', () => {
      const classesWithDuplicates = [
        'base',
        ...Array.from({ length: 50 }, (_, i) => `class-${i}`),
        'base', // duplicate
        ...Array.from({ length: 50 }, (_, i) => `class-${i + 50}`),
        'base' // another duplicate
      ];
      const result = mergeClasses(...classesWithDuplicates);
      
      // Should contain base only once at the end
      expect(result).toContain('base');
      expect(result.split(' ').filter((cls: string) => cls === 'base')).toHaveLength(1);
      expect(result.endsWith('base')).toBe(true);
    });
  });

  describe('real-world usage patterns', () => {
    it('handles typical component class merging', () => {
      const baseClasses = 'px-4 py-2 rounded';
      const variantClasses = 'bg-primary-normal text-white';
      const customClasses = 'shadow-lg hover:bg-primary-dark';
      
      expect(mergeClasses(baseClasses, variantClasses, customClasses))
        .toBe('px-4 py-2 rounded bg-primary-normal text-white shadow-lg hover:bg-primary-dark');
    });

    it('handles Tailwind CSS class merging with overrides', () => {
      const baseClasses = 'bg-neutral-lighter text-neutral-darker p-4';
      const overrideClasses = 'bg-error-normal text-white';
      
      // The function preserves order and removes duplicates when they repeat later
      // Later classes with same prefix don't remove earlier ones, just get deduplicated
      expect(mergeClasses(baseClasses, overrideClasses))
        .toBe('bg-neutral-lighter text-neutral-darker p-4 bg-error-normal text-white');
    });

    it('handles component prop patterns', () => {
      const qwikClass = 'qwik-specific-class';
      const className = 'react-compatible-class';
      const conditionalClass = 'conditional-active';
      
      expect(mergeClasses(qwikClass, className, conditionalClass))
        .toBe('qwik-specific-class react-compatible-class conditional-active');
    });
  });

  describe('edge cases and error handling', () => {
    it('handles all falsy values', () => {
      expect(mergeClasses(false, null, undefined, '')).toBe('');
    });

    it('handles deeply nested arrays', () => {
      expect(mergeClasses([[[['deeply', 'nested']]]], 'flat')).toBe('deeply nested flat');
    });

    it('handles mixed types in arrays', () => {
      expect(mergeClasses(['valid', false, 'class', null, undefined])).toBe('valid class');
    });
  });
});
