import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrokenRuler } from './BrokenRuler';
import { readAnswer } from './mission';

export function BrokenRulerLesson({ onReady }: { onReady: () => void }) {
  const [show, setShow] = useState(false);
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const correct = readAnswer(answer) === 8;
  return <section className="space-y-5">
    <div className="flex items-center gap-3"><span className="text-4xl" aria-hidden="true">📏</span><div><p className="text-sm font-bold text-primary">BEKAL PENJELAJAH</p><h2 className="text-2xl font-bold">Penggaris patah? Tetap bisa!</h2></div></div>
    <p>Angka 0 hilang, tetapi garis pada penggaris masih bisa dipakai. Perhatikan kedua ujung pensil.</p>
    <BrokenRuler start={3} end={11} name="Pensil" reveal={show}/>
    <ol className="grid gap-3 sm:grid-cols-3">{['Baca angka di ujung kiri: 3 cm.', 'Baca angka di ujung kanan: 11 cm.', 'Kurangi angka kanan dengan angka kiri.'].map((text, i) => <li key={text} className="flex gap-3 border-l-4 border-primary pl-3"><span className="font-display text-xl font-bold text-primary">{i + 1}</span><span>{text}</span></li>)}</ol>
    <Button variant="secondary" onClick={() => setShow(!show)}>{show ? 'Tutup contoh hitungan' : 'Lihat contoh hitungan'}</Button>
    {show && <p className="bg-sun-soft p-4 font-semibold">11 − 3 = 8 cm. Panjangnya bukan 11 cm, karena pensil tidak mulai dari 0.</p>}
    <form className="space-y-3 border-t border-border pt-5" onSubmit={e => { e.preventDefault(); setChecked(true); }}>
      <label htmlFor="lesson-answer" className="block font-bold">Coba dulu: pita dimulai di 5 cm dan berakhir di 13 cm. Berapa panjangnya?</label>
      <BrokenRuler start={5} end={13} name="Pita"/>
      <div className="flex flex-wrap items-center gap-2"><input id="lesson-answer" className="field-fun max-w-32" inputMode="numeric" value={answer} onChange={e => { setAnswer(e.target.value); setChecked(false); }}/><span>cm</span><Button type="submit"><Check/>Periksa</Button></div>
      {checked && <p role="status" className={correct ? 'font-semibold text-primary' : 'text-destructive'}>{correct ? 'Tepat! 13 − 5 = 8 cm. Kamu siap menjelajah.' : 'Coba kurangi 13 dengan 5, bukan memakai angka ujung kanan saja.'}</p>}
    </form>
    {checked && correct && <Button size="lg" onClick={onReady}>Pilih avatar & masuk kelas<ArrowRight/></Button>}
  </section>;
}