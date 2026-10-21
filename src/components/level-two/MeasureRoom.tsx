import { useEffect, useRef, useState } from 'react';
import { DifferenceHelp } from './DifferenceHelp';
import { createBacksound } from './backsound';
import { Check, Lock, RotateCcw, Star, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { recordActivity } from '@/lib/user';
import { celebrate } from '@/lib/fx';
import { objects, challenges, checkMeasurement, formatLength, parseLength, type MeasureObject } from './measurements';
import roomImg from '@/assets/room-storybook.jpg';
import { MeasurementArt } from './MeasurementArt';
import { SelfAssess } from '@/components/SelfAssess';
import { canReflect } from './measurements';

function RoomScene({ onSelect, done }: { onSelect: (item: MeasureObject) => void; done: string[] }) {
  return <div className="measure-room relative w-full overflow-hidden rounded-lg bg-sky-soft">
    <img src={roomImg} alt="Kamar tidur anak dengan lemari, kasur, meja belajar, pensil, penghapus, dan buku" width={1536} height={1008} className="block h-full w-full object-cover"/>
    {[...objects].reverse().map(item => <Button key={item.id} variant="ghost" className={`room-object room-object-${item.id} absolute h-auto p-0 hover:bg-transparent ${done.includes(item.id) ? 'room-object-done' : ''}`} aria-label={`Ukur ${item.name}`} title={`Ukur ${item.name}`} onClick={() => onSelect(item)}>
      <span className="room-pin absolute left-1/2 top-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-card text-lg shadow-soft" aria-hidden="true">🔍</span>
      <span className="room-object-label absolute -top-5 left-1/2 -translate-x-1/2 rounded-md bg-card px-2 py-1 text-xs font-bold shadow-soft">{done.includes(item.id) ? '✓ ' : ''}{item.name}</span>
      {done.includes(item.id) && <span className="absolute -right-1 -top-1 rounded-full bg-success p-1 text-success-foreground"><Check className="size-3"/></span>}
    </Button>)}
  </div>;
}

export function MeasureRoom() {
  const [selected, setSelected] = useState<MeasureObject | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [feedback, setFeedback] = useState('');
  const [correct, setCorrect] = useState(false);
  const [party, setParty] = useState(false);
  const [answers, setAnswers] = useState(['', '', '']);
  const [checked, setChecked] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [help, setHelp] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const sound = useRef<ReturnType<typeof createBacksound> | null>(null);
  useEffect(() => () => sound.current?.dispose(), []);
  const toggleSound = () => {
    sound.current ??= createBacksound();
    if (soundOn) sound.current.stop(); else sound.current.start();
    setSoundOn(!soundOn);
  };
  const attempts = useRef(0);
  const allDone = done.length === objects.length;
  const select = (item: MeasureObject) => { setSelected(item); setValue(''); setUnit(''); setFeedback(''); setCorrect(false); };
  const submit = () => {
    if (!selected || correct) return;
    attempts.current += 1;
    const result = checkMeasurement(selected, value, unit);
    if (result === 'number') { setFeedback('Tulis angka panjangnya dulu, ya. Untuk koma, tulis misalnya 3,5.'); return; }
    if (result === 'unit') { setFeedback(!unit ? 'Pilih satuan cm atau m dulu, ya!' : selected.unit === 'm' ? `${selected.name} termasuk benda besar. Coba gunakan meter (m)!` : `${selected.name} termasuk benda kecil. Coba gunakan sentimeter (cm)!`); return; }
    if (result === 'length') { setFeedback('Lihat garis merah di ujung benda. Baca angka besarnya dengan teliti, ya!'); return; }
    setCorrect(true);
    setFeedback(`Benar! Panjang ${selected.name.toLowerCase()} = ${formatLength(selected.length)} ${selected.unit}.`);
    if (!done.includes(selected.id)) {
      const next = [...done, selected.id];
      setDone(next);
      celebrate(next.length === objects.length);
      if (next.length === objects.length) setParty(true);
    }
  };
  const finish = async () => {
    setChecked(true);
    if (!allDone || !challenges.every((c, i) => parseLength(answers[i] ?? '') === c.answer)) return;
    setSaveState('saving');
    try {
      await recordActivity('level-2', 9, { info: 'Find & Measure: 6 benda dan 3 soal', measurements: objects.map(o => ({ name: o.name, length: o.length, unit: o.unit })), answers: answers.map(parseLength), attempts: attempts.current }, true);
      setSaveState('saved'); celebrate(true);
    } catch { setSaveState('error'); }
  };
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-bold">🔍 Find & Measure</h2><p className="text-muted-foreground">Misi: ukur enam benda di kamar!</p></div><span className="rounded-full bg-sun-soft px-4 py-2 font-display font-bold">⭐ {done.length} / 6 benda</span></div>
    <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Benda terukur" aria-valuenow={done.length} aria-valuemin={0} aria-valuemax={6}><div className={`measure-progress measure-progress-${done.length} h-full bg-success transition-all`}/></div>
    <div className="relative">
      <RoomScene onSelect={select} done={done}/>
      <Button size="icon" variant="secondary" className="absolute right-3 top-3 z-10 rounded-full shadow-soft" aria-label={soundOn ? 'Matikan musik' : 'Nyalakan musik'} aria-pressed={soundOn} onClick={toggleSound}>{soundOn ? <Volume2/> : <VolumeX/>}</Button>
    </div>
    <h3 className="font-display text-lg font-bold">🧭 Checklist Penjelajah</h3>
    <p className="text-sm text-muted-foreground">Ini benda yang harus kamu temukan. Ketuk tanda 🔍-nya di gambar kamar untuk mengukur.</p>
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {objects.map(item => <li key={item.id} className={`flex items-center gap-3 rounded-lg border border-border p-3 ${done.includes(item.id) ? 'bg-secondary' : ''}`}>{done.includes(item.id) ? <Check className="size-4 shrink-0 text-success"/> : <Lock className="size-4 shrink-0 text-muted-foreground"/>}<span className="text-xl" aria-hidden="true">{item.emoji}</span><span className="min-w-0"><span className="block font-semibold">{item.name}</span><span className={`block text-xs ${done.includes(item.id) ? 'text-success' : 'text-muted-foreground'}`}>{done.includes(item.id) ? `✓ Terukur: ${formatLength(item.length)} ${item.unit}` : 'Cari di kamar…'}</span></span></li>)}
    </ul>
    {allDone && <section className="space-y-4 border-t border-border pt-6">
      <h3 className="text-2xl font-bold">🌟 Tantangan Penjelajah</h3>
      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="mb-2 font-display text-lg font-bold">📋 Catatan Hasil Pengukuranmu</h4>
        <table className="w-full text-left"><tbody>{objects.map(o => <tr key={o.id} className="border-t border-border"><td className="py-1">{o.emoji} {o.name}</td><td className="py-1 text-right font-bold">{formatLength(o.length)} {o.unit}</td></tr>)}</tbody></table>
      </div>
      <p>Gunakan catatan di atas untuk menjawab.</p>
      {challenges.map((c, i) => {
        const a = c.compare ? objects.find(o => o.id === c.compare[0]) : undefined;
        const b = c.compare ? objects.find(o => o.id === c.compare[1]) : undefined;
        return <div key={c.question} className="space-y-2"><label htmlFor={`challenge-${i}`} className="block font-semibold">{i + 1}. {c.question}</label><div className="flex items-center gap-2"><input id={`challenge-${i}`} inputMode="decimal" className="field-fun max-w-36" value={answers[i]} disabled={saveState === 'saved'} onChange={e => { setAnswers(prev => prev.map((v, j) => j === i ? e.target.value : v)); setChecked(false); }}/><span>{c.unit}</span>{checked && <span className={parseLength(answers[i] ?? '') === c.answer ? 'text-success' : 'text-destructive'}>{parseLength(answers[i] ?? '') === c.answer ? '✓ Benar' : 'Coba hitung lagi'}</span>}</div>{c.compare && <Button type="button" variant="ghost" size="sm" onClick={() => setHelp(help === i ? null : i)}>💡 {help === i ? 'Tutup bantuan' : 'Butuh bantuan selisih?'}</Button>}{a && b && help === i && <DifferenceHelp a={a} b={b}/>}</div>;
      })}
      <Button onClick={finish} disabled={saveState === 'saving' || saveState === 'saved'}><Star/>{saveState === 'saving' ? 'Menyimpan…' : saveState === 'saved' ? 'Level 2 selesai!' : 'Periksa & selesaikan'}</Button>
      {saveState === 'saved' && <p role="status" className="font-semibold text-success">🎉 Hebat! Nilaimu 9 dari 9, hasilnya sudah tersimpan.</p>}
      {saveState === 'error' && <p role="alert" className="text-destructive">Hasil belum tersimpan. Coba tekan tombol sekali lagi.</p>}
    </section>}
    <Button variant="ghost" onClick={() => { setDone([]); setAnswers(['', '', '']); setChecked(false); setSaveState('idle'); attempts.current = 0; }}><RotateCcw/>Mulai ulang misi</Button>
    {canReflect(done, answers, saveState === 'saved') && <SelfAssess from="level-2" options={["Cara memakai penggaris", "Mulai dari angka 0", "Membaca angka berkoma (,5)", "Mencari selisih panjang"]} nextTo="/level-3" nextLabel="Lanjut ke Level 3" />}
    <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-lg">
        <DialogTitle className="pr-6 text-2xl">{selected?.emoji} Ukur {selected?.name}</DialogTitle>
        <DialogDescription>Benda dimulai dari 0. Berapa panjangnya pada garis merah?</DialogDescription>
        {selected && <>
          <MeasurementArt id={selected.id} length={selected.length} max={selected.unit === 'm' ? 3 : selected.id === 'book' ? 25 : selected.id === 'pencil' ? 15 : 6} unit={selected.unit} reveal={correct}/>
          <form onSubmit={e => { e.preventDefault(); submit(); }} className="space-y-4">
            <label htmlFor="measure-answer" className="block font-semibold">Hasil pengukuran</label>
            <div className="flex flex-wrap gap-2"><input id="measure-answer" inputMode="decimal" autoComplete="off" placeholder="Tulis angka" className="field-fun min-w-0 flex-1 basis-32" value={value} disabled={correct} onChange={e => { setValue(e.target.value); setFeedback(''); }}/><div className="flex items-center gap-2" role="group" aria-label="Satuan">{['cm', 'm'].map(u => <Button type="button" key={u} variant={unit === u ? 'default' : 'outline'} aria-pressed={unit === u} disabled={correct} onClick={() => { setUnit(u); setFeedback(''); }}>{u}</Button>)}</div></div>
            {feedback && <p role="status" className={`rounded-lg p-3 font-semibold ${correct ? 'bg-sky-soft' : 'bg-sun-soft'}`}>{correct ? '🎉 ' : '💡 '}{feedback}</p>}
            {correct ? <Button type="button" onClick={() => setSelected(null)}>Kembali ke kamar<ArrowRight/></Button> : <Button type="submit"><Check/>Masukkan hasil</Button>}
          </form>
        </>}
      </DialogContent>
    </Dialog>
    <Dialog open={party && selected === null} onOpenChange={setParty}><DialogContent className="w-[calc(100%-2rem)] rounded-lg text-center"><DialogTitle className="text-2xl">🌟 Enam benda berhasil diukur!</DialogTitle><DialogDescription>Kamu penjelajah yang teliti. Sekarang, selesaikan tiga tantangan terakhir.</DialogDescription><div className="text-6xl" aria-hidden="true">🏆</div><Button onClick={() => setParty(false)}>Lanjut ke tantangan<ArrowRight/></Button></DialogContent></Dialog>
  </div>;
}
