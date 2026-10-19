import { describe, it, expect } from 'vitest';
import { objects, parseLength, checkMeasurement, challenges } from '@/components/level-two/measurements';

describe('Level 2 measurement rules', () => {
  it('accepts Indonesian half-unit decimals', () => { expect(parseLength('0,5')).toBe(0.5); expect(parseLength('7,5')).toBe(7.5); expect(parseLength('')).toBeNaN(); expect(parseLength('7,5,2')).toBeNaN(); });
  it('contains exactly three cm and three m objects', () => { expect(objects.filter(o => o.unit === 'cm')).toHaveLength(3); expect(objects.filter(o => o.unit === 'm')).toHaveLength(3); expect(objects.map(o => o.id)).toEqual(['pencil', 'book', 'eraser', 'wardrobe', 'bed', 'desk']); });
  it('keeps Find & Measure lengths as whole numbers', () => { expect(objects.every(o => Number.isInteger(o.length))).toBe(true); expect(objects.map(o => o.length)).toEqual([12, 20, 5, 2, 2, 1]); });
  it('requires the correct unit and exact measurement', () => { const pencil = objects[0]; expect(checkMeasurement(pencil, '12', 'cm')).toBe('correct'); expect(checkMeasurement(pencil, '12', 'm')).toBe('unit'); expect(checkMeasurement(pencil, '13', 'cm')).toBe('length'); expect(checkMeasurement(pencil, '', 'cm')).toBe('number'); });
  it('uses whole-number answers for follow-up differences', () => { expect(challenges.map(c => c.answer)).toEqual([8, 1, 17]); expect(objects[1].length - objects[0].length).toBe(challenges[0].answer); expect(objects[4].length - objects[5].length).toBe(challenges[1].answer); expect(objects[0].length + objects[2].length).toBe(challenges[2].answer); });
});
