import { formatLength, type MeasureObject } from './measurements';

/** Scaffolding: two bars from 0 so the child can see the extra part (selisih). */
export function DifferenceHelp({ a, b }: { a: MeasureObject; b: MeasureObject }) {
  const [big, small] = a.length >= b.length ? [a, b] : [b, a];
  const pct = (v: number) => `${(v / big.length) * 100}%`;
  return <div className="space-y-2 rounded-lg bg-sky-soft p-3 text-sm">
    {[big, small].map((o, i) => <div key={o.id}>
      <div className="mb-1 flex justify-between font-semibold"><span>{o.emoji} {o.name}</span><span>{formatLength(o.length)} {o.unit}</span></div>
      <div className="relative h-6 rounded-md bg-muted">
        <div className={`h-full rounded-md ${i === 0 ? 'bg-box-red' : 'bg-box-blue'}`} style={{ width: pct(o.length) }} />
        {i === 1 && <div className="absolute inset-y-0 rounded-r-md border-2 border-dashed border-sun bg-sun-soft" style={{ left: pct(small.length), right: 0 }} />}
      </div>
    </div>)}
    <p className="font-semibold">💡 Bagian kuning putus-putus adalah selisihnya. Hitung: panjang yang lebih panjang − panjang yang lebih pendek.</p>
  </div>;
}
