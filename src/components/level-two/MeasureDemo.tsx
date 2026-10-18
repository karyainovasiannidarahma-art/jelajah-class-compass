import { useState } from 'react';
import { Ruler, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MeasurementArt } from './MeasurementArt';
import { formatLength } from './measurements';

export function MeasureDemo() {
  const [decimal, setDecimal] = useState(false);
  const [example, setExample] = useState(0);
  const [reveal, setReveal] = useState(false);
  const lengths = decimal ? [0.5, 3.5, 7.5] : [3, 7, 12];
  const length = lengths[example] ?? lengths[0] ?? 3;
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-2xl font-bold">Membaca Penggaris 📏</h2>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Mode pengukuran">
        {[false, true].map(mode => <Button key={String(mode)} variant={decimal === mode ? 'default' : 'outline'} aria-pressed={decimal === mode} onClick={() => { setDecimal(mode); setExample(0); setReveal(false); }}>{mode ? 'Pakai koma (,5)' : 'Tanpa koma'}</Button>)}
      </div>
    </div>
    <p>Letakkan ujung benda di angka <strong>0</strong>. Baca angka pada garis merah di ujung satunya.</p>
    <div className="flex flex-wrap gap-2" role="group" aria-label="Contoh panjang">
      {lengths.map((n, i) => <Button key={n} variant={example === i ? 'secondary' : 'ghost'} aria-pressed={example === i} onClick={() => { setExample(i); setReveal(false); }}>Contoh {i + 1}</Button>)}
    </div>
    <MeasurementArt length={length} max={decimal ? 10 : 15} unit="cm" reveal={reveal} magnify={decimal}/>
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={() => setReveal(!reveal)}><Ruler/>{reveal ? 'Sembunyikan hasil' : 'Baca hasil'}</Button>
      <Button variant="ghost" size="icon" aria-label="Ulangi demonstrasi" title="Ulangi demonstrasi" onClick={() => setReveal(false)}><RotateCcw/></Button>
      {reveal && <p role="status" className="font-display text-xl font-semibold">Panjangnya <span className="text-primary">{formatLength(length)} cm</span>{decimal ? ` — dibaca “${Math.floor(length)} koma lima”.` : ' — tepat di angka bulat!'}</p>}
    </div>
    <p className="rounded-lg bg-sun-soft p-4 font-semibold">{decimal ? 'Ujung di tengah dua angka? Tambahkan 0,5 cm, bukan dibulatkan ke angka terdekat.' : 'Ujung tepat di garis angka besar? Hasilnya bilangan bulat, tanpa koma.'}</p>
  </div>;
}
