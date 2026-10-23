import { describe, expect, it } from 'vitest';
import { bonus, canFinishMission, canOpenBonus, classroomObjects, lengthOf } from '../components/level-three/mission';

describe('Level 3 classroom rules', () => {
  it('offers exactly ten familiar objects with integer broken-ruler lengths in cm', () => {
    expect(classroomObjects).toHaveLength(10);
    expect(new Set(classroomObjects.map(o => o.id)).size).toBe(10);
    for (const item of classroomObjects) {
      expect(item.start).toBeGreaterThan(0);
      expect(Number.isInteger(lengthOf(item))).toBe(true);
      expect(lengthOf(item)).toBeGreaterThan(0);
    }
    expect(lengthOf(classroomObjects[0])).toBe(14);
  });
  it('opens the single bonus only after all ten objects are measured', () => {
    const ids = classroomObjects.map(o => o.id);
    expect(canOpenBonus(ids.slice(0, 9))).toBe(false);
    expect(canOpenBonus(Array(10).fill(ids[0]))).toBe(false);
    expect(canOpenBonus(ids)).toBe(true);
  });
  it('requires the 200 cm board bonus after ten measurements to finish', () => {
    expect(bonus.answer).toBe(200);
    expect(canFinishMission([], '200')).toBe(false);
    expect(canFinishMission(classroomObjects.map(o => o.id), '240')).toBe(false);
    expect(canFinishMission(classroomObjects.map(o => o.id), '200')).toBe(true);
  });
});