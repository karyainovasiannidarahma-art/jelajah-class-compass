export const classroomObjects = [
  { id: 'pencil', name: 'Pensil', emoji: '✏️', start: 3, end: 17, position: [-3.5, 1.15, 2] },
  { id: 'eraser', name: 'Penghapus', emoji: '🧽', start: 4, end: 9, position: [-1.5, 1.15, 2] },
  { id: 'book', name: 'Buku tulis', emoji: '📘', start: 2, end: 22, position: [1, 1.15, 2] },
  { id: 'pen', name: 'Pulpen', emoji: '🖊️', start: 5, end: 18, position: [3.5, 1.15, 2] },
  { id: 'crayon', name: 'Krayon', emoji: '🖍️', start: 2, end: 10, position: [-3.5, 1.15, -0.5] },
  { id: 'scissors', name: 'Gunting', emoji: '✂️', start: 3, end: 18, position: [-1.5, 1.15, -0.5] },
  { id: 'glue', name: 'Lem stik', emoji: '🧴', start: 6, end: 16, position: [1, 1.15, -0.5] },
  { id: 'case', name: 'Kotak pensil', emoji: '👝', start: 4, end: 24, position: [3.5, 1.15, -0.5] },
  { id: 'brush', name: 'Kuas', emoji: '🖌️', start: 5, end: 23, position: [-4, 1.15, -3] },
  { id: 'bottle', name: 'Botol minum', emoji: '🍶', start: 3, end: 25, position: [3.5, 1.15, -3] },
] as const;
export type ClassroomObject = typeof classroomObjects[number];
export const avatars = [
  { id: 'leaf', name: 'Rimba', token: 'primary', emoji: '🌿' },
  { id: 'sun', name: 'Surya', token: 'box-red', emoji: '☀️' },
  { id: 'sky', name: 'Biru', token: 'sky', emoji: '🦋' },
] as const;
export type AvatarId = typeof avatars[number]['id'];
export const bonus = { name: 'Papan tulis', start: 40, end: 240, answer: 200 } as const;
export function readAnswer(value: string) { return /^\d+$/.test(value.trim()) ? Number(value.trim()) : NaN; }
export function lengthOf(item: { start: number; end: number }) { return item.end - item.start; }
export function canOpenBonus(done: readonly string[]) { return classroomObjects.every(item => done.includes(item.id)); }
export function canFinishMission(done: readonly string[], answer: string) { return canOpenBonus(done) && readAnswer(answer) === bonus.answer; }