import pencil from '@/assets/obj-pencil.png';
import book from '@/assets/obj-book.png';
import eraser from '@/assets/obj-eraser.png';
import wardrobe from '@/assets/obj-wardrobe.png';
import bed from '@/assets/obj-bed.png';
import desk from '@/assets/obj-desk.png';
import type { MeasureObject } from './measurements';
import { formatLength } from './measurements';

export const objectImages: Record<MeasureObject['id'], string> = { pencil, book, eraser, wardrobe, bed, desk };

export function ObjectArt({ id }: { id: MeasureObject['id'] }) {
  return <image href={objectImages[id]} x="0" y="0" width="200" height="100" preserveAspectRatio="none"/>;
}

export function MeasurementArt({ length, max, unit, id = 'pencil', reveal = false, magnify = false }: { length: number; max: number; unit: string; id?: MeasureObject['id']; reveal?: boolean; magnify?: boolean }) {
  const scale = 600 / max;
  const end = 30 + length * scale;
  const divisions = unit === 'cm' ? max * 10 : max * 10;
  const labels = unit === 'cm' ? Array.from({ length: max + 1 }, (_, i) => i) : Array.from({ length: max * 2 + 1 }, (_, i) => i / 2);
  const lower = Math.floor(length);
  return <div className="space-y-3">
    <svg viewBox="0 0 660 220" className="measurement-art w-full" role="img" aria-label={`Penggaris ${max} ${unit}${reveal ? `, panjang benda ${formatLength(length)} ${unit}` : ''}`}>
      <svg x="30" y="20" width={length * scale} height="78" viewBox="0 0 200 100" preserveAspectRatio="none"><ObjectArt id={id}/></svg>
      <path d="M30 12V179" stroke="var(--box-blue)" strokeWidth="2" strokeDasharray="5 4"/>
      <rect x="15" y="104" width="630" height="85" rx="7" fill="var(--sun-soft)" stroke="var(--accent-foreground)" strokeWidth="2"/>
      {Array.from({ length: divisions + 1 }, (_, i) => <path key={i} d={`M${30 + i * 600 / divisions} 104v${i % 10 === 0 ? 32 : i % 5 === 0 ? 24 : 13}`} stroke="var(--foreground)" strokeWidth={i % 5 === 0 ? 2 : 1}/>)}
      {labels.map(n => <text key={n} x={30 + n * scale} y="164" textAnchor="middle" fill="var(--foreground)" fontSize="17" fontWeight="700">{formatLength(n)}</text>)}
      <text x="630" y="184" textAnchor="end" fill="var(--accent-foreground)" fontSize="13">{unit}</text>
      <path d={`M${end} 14V178`} stroke="var(--box-red)" strokeWidth="3" strokeDasharray="6 4"/>
      <path d={`M${end - 6} 91L${end} 102L${end + 6} 91Z`} fill="var(--box-red)"/>
      <text x="30" y="212" fill="var(--box-blue)" fontSize="15">Mulai dari 0</text>
      {reveal && <text x="630" y="212" textAnchor="end" fill="var(--box-red)" fontSize="18" fontWeight="700">{formatLength(length)} {unit}</text>}
    </svg>
    {magnify && <div className="flex flex-wrap items-center justify-center gap-4 bg-sky-soft p-3 rounded-lg">
      <svg viewBox="0 0 260 120" className="h-28 w-60 max-w-full" role="img" aria-label={`Pembesaran: lima garis milimeter setelah ${lower} cm adalah ${formatLength(lower + 0.5)} cm`}>
        <rect x="10" y="10" width="240" height="98" rx="8" fill="var(--sun-soft)" stroke="var(--box-blue)" strokeWidth="3"/>
        {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M${25 + i * 21} 20v${i % 5 === 0 ? 36 : 19}`} stroke="var(--foreground)" strokeWidth="2"/>)}
        <path d="M130 8V72" stroke="var(--box-red)" strokeWidth="3" strokeDasharray="4 3"/>
        {[lower, lower + 0.5, lower + 1].map((n, i) => <text key={n} x={25 + i * 105} y="91" textAnchor="middle" fill="var(--foreground)" fontSize="19" fontWeight="700">{formatLength(n)}</text>)}
      </svg>
      <p className="max-w-60 font-semibold">🔎 5 garis kecil = 5 mm = 0,5 cm.<br/>Setengah jalan ke angka berikutnya!</p>
    </div>}
  </div>;
}
