import type { MeasureObject } from './measurements';
import { formatLength } from './measurements';

export function ObjectArt({ id }: { id: MeasureObject['id'] }) {
  const line = { stroke: 'var(--foreground)', strokeWidth: 3, strokeLinejoin: 'round' as const };
  if (id === 'pencil') return <g {...line}><path d="M4 37L30 18H172V62H30Z" fill="var(--sun)"/><path d="M4 37L30 18V62Z" fill="var(--wood)"/><path d="M4 37L14 30V45Z" fill="var(--foreground)"/><path d="M172 18H191Q198 18 198 25V55Q198 62 191 62H172Z" fill="var(--pink-soft)"/><path d="M35 33H165M35 47H165" stroke="var(--accent-foreground)" strokeWidth="2"/></g>;
  if (id === 'book') return <g {...line}><rect x="8" y="10" width="184" height="75" rx="8" fill="var(--box-blue)"/><path d="M22 10V85"/><rect x="44" y="25" width="110" height="40" rx="4" fill="var(--card)"/><path d="M62 38H135M62 50H120" stroke="var(--box-blue)"/><path d="M20 78H183" stroke="var(--card)"/></g>;
  if (id === 'eraser') return <g {...line}><rect x="4" y="20" width="192" height="56" rx="13" fill="var(--pink-soft)"/><path d="M66 20H156V76H66Z" fill="var(--sky)"/><path d="M82 36H137M82 48H126" stroke="var(--card)"/></g>;
  if (id === 'wardrobe') return <g {...line}><rect x="9" y="4" width="182" height="86" rx="5" fill="var(--wood)"/><path d="M100 4V90M24 90V98M174 90V98"/><rect x="22" y="15" width="65" height="62" rx="3" fill="var(--sun-soft)"/><rect x="113" y="15" width="65" height="62" rx="3" fill="var(--sun-soft)"/><circle cx="80" cy="49" r="3" fill="var(--primary)"/><circle cx="120" cy="49" r="3" fill="var(--primary)"/></g>;
  if (id === 'bed') return <g {...line}><rect x="4" y="8" width="36" height="78" rx="5" fill="var(--wood)"/><rect x="16" y="35" width="178" height="46" rx="8" fill="var(--card)"/><rect x="20" y="36" width="42" height="22" rx="8" fill="var(--sky-soft)"/><path d="M70 35H189Q196 35 196 43V75H70Z" fill="var(--primary)"/><path d="M84 36V74M102 36V74M120 36V74M138 36V74M156 36V74M174 36V74" stroke="var(--pink-soft)"/><path d="M12 80H196V88H12ZM20 88V98M185 88V98" fill="var(--wood)"/></g>;
  return <g {...line}><rect x="3" y="8" width="194" height="16" rx="4" fill="var(--wood)"/><path d="M15 24V96H26V24M173 24V96H185V24" fill="var(--wood)"/><rect x="117" y="24" width="55" height="48" rx="3" fill="var(--sky-soft)"/><path d="M117 48H172M139 36H151M139 60H151"/></g>;
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
