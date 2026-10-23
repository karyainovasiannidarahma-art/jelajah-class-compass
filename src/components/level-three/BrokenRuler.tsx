import type { ClassroomObject } from './mission';

export function BrokenRuler({ start, end, name, item, reveal = false, large = false }: { start: number; end: number; name: string; item?: ClassroomObject; reveal?: boolean; large?: boolean }) {
  const min = large ? 20 : Math.max(1, start - 1);
  const max = large ? 260 : Math.max(end + 2, 26);
  const x = (n: number) => 35 + (n - min) / (max - min) * 630;
  const step = large ? 20 : 1;
  const numbers = Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => min + i * step);
  return <svg viewBox="0 0 700 210" className="w-full" role="img" aria-label={`${name}, ujung kiri di ${start} cm dan ujung kanan di ${end} cm`}>
    <rect x={x(start)} y="26" width={x(end) - x(start)} height="48" rx={item?.id === 'bottle' ? 15 : 4} fill={`var(--${large ? 'primary' : item?.id === 'book' ? 'sky' : item?.id === 'eraser' ? 'pink-soft' : 'wood'})`} stroke="var(--foreground)" strokeWidth="2"/>
    <text x={(x(start) + x(end)) / 2} y="57" textAnchor="middle" fill={`var(--${large ? 'primary-foreground' : 'foreground'})`} fontSize="18" fontWeight="700">{item?.emoji} {name}</text>
    <path d="M25 90 L17 101 L28 112 L17 124 L28 136 L17 149 L28 161 L17 178 H680 V90Z" fill="var(--sun-soft)" stroke="var(--foreground)" strokeWidth="2"/>
    {numbers.map(n => <g key={n}><path d={`M${x(n)} 90v${n % 5 === 0 || large ? 27 : 17}`} stroke="var(--foreground)" strokeWidth="2"/><text x={x(n)} y="151" textAnchor="middle" fontSize={large ? 17 : 15} fill="var(--foreground)" fontWeight="700">{n}</text></g>)}
    {[start, end].map((n, i) => <g key={n}><path d={`M${x(n)} 17V168`} stroke={`var(--${i ? 'box-red' : 'sky'})`} strokeWidth="3" strokeDasharray="5 4"/><text x={x(n)} y="200" textAnchor="middle" fontSize="18" fill="var(--foreground)" fontWeight="700">{n} cm</text></g>)}
    {reveal && <text x="350" y="18" textAnchor="middle" fill="var(--primary)" fontSize="18" fontWeight="700">{end} − {start} = {end - start} cm</text>}
  </svg>;
}