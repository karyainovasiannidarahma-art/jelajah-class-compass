export const objects = [
  { id: 'pencil', name: 'Pensil', emoji: '✏️', length: 12.5, unit: 'cm', x: 61, y: 47, w: 19, h: 8 },
  { id: 'book', name: 'Buku', emoji: '📘', length: 20, unit: 'cm', x: 74, y: 35, w: 13, h: 12 },
  { id: 'eraser', name: 'Penghapus', emoji: '🧽', length: 4.5, unit: 'cm', x: 85, y: 49, w: 10, h: 7 },
  { id: 'wardrobe', name: 'Lemari', emoji: '🚪', length: 2, unit: 'm', x: 5, y: 17, w: 24, h: 57 },
  { id: 'bed', name: 'Tempat tidur', emoji: '🛏️', length: 2, unit: 'm', x: 29, y: 57, w: 34, h: 31 },
  { id: 'desk', name: 'Meja belajar', emoji: '🪑', length: 1.5, unit: 'm', x: 64, y: 55, w: 31, h: 25 },
] as const;
export type MeasureObject = (typeof objects)[number];
export function formatLength(n: number) { return String(n).replace('.', ','); }
export function parseLength(value: string) {
  const clean = value.trim().replace(',', '.');
  return /^\d+(\.\d+)?$/.test(clean) ? Number(clean) : NaN;
}
export function checkMeasurement(item: MeasureObject, value: string, unit: string) {
  if (!Number.isFinite(parseLength(value))) return 'number';
  if (unit !== item.unit) return 'unit';
  return parseLength(value) === item.length ? 'correct' : 'length';
}
export const challenges = [
  { question: 'Berapa selisih panjang buku dan pensil?', answer: 7.5, unit: 'cm', compare: ['book', 'pencil'] },
  { question: 'Berapa selisih panjang tempat tidur dan meja belajar?', answer: 0.5, unit: 'm', compare: ['bed', 'desk'] },
  { question: 'Berapa total panjang pensil dan penghapus?', answer: 17, unit: 'cm', compare: null },
] as const;
