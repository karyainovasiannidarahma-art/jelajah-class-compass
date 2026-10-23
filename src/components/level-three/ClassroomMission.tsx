import { lazy, Suspense, useCallback, useState } from 'react';
import { ClientOnly } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, Check, RotateCcw, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { SelfAssess } from '@/components/SelfAssess';
import { HelperBot } from '@/components/HelperBot';
import { recordActivity } from '@/lib/user';
import { celebrate } from '@/lib/fx';
import { BrokenRulerLesson } from './BrokenRulerLesson';
import { BrokenRuler } from './BrokenRuler';
import { avatars, bonus, classroomObjects, canFinishMission, canOpenBonus, lengthOf, readAnswer, type AvatarId, type ClassroomObject } from './mission';

const ClassroomScene = lazy(() => import('./ClassroomScene'));

export function ClassroomMission() {
  const [stage, setStage] = useState<'lesson' | 'avatar' | 'mission'>('lesson');
  const [avatar, setAvatar] = useState<AvatarId>('leaf');
  const [done, setDone] = useState<string[]>([]);
  const [moving, setMoving] = useState<ClassroomObject | null>(null);
  const [selected, setSelected] = useState<ClassroomObject | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [correct, setCorrect] = useState(false);
  const [hint, setHint] = useState(false);
  const [bonusAnswer, setBonusAnswer] = useState('');
  const [bonusChecked, setBonusChecked] = useState(false);
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [attempts, setAttempts] = useState(0);
  const arrive = useCallback((item: ClassroomObject) => { setMoving(null); setSelected(item); setAnswer(''); setCorrect(false); setFeedback(''); setHint(false); }, []);
  const pick = (item: ClassroomObject) => { if (!moving && !selected && !done.includes(item.id)) setMoving(item); };
  const submit = () => {
    if (!selected || correct) return;
    setAttempts(v => v + 1);
    if (readAnswer(answer) !== lengthOf(selected)) { setFeedback(`Panjangnya bukan angka ${selected.end} saja. Baca kedua ujung, lalu kurangi angka kanan dengan angka kiri.`); return; }
    setCorrect(true); setDone(prev => [...prev, selected.id]); setFeedback(`Tepat! ${selected.end} − ${selected.start} = ${lengthOf(selected)} cm.`); celebrate(false);
  };
  const finish = async () => {
    setBonusChecked(true);
    if (!canFinishMission(done, bonusAnswer) || saved === 'saving' || saved === 'saved') return;
    setSaved('saving');
    try { await recordActivity('level-3', 11, { info: 'Penggaris patah: 10 benda kelas dan bonus papan tulis', avatar, attempts, measurements: classroomObjects.map(o => ({ name: o.name, start: o.start, end: o.end, length: lengthOf(o), unit: 'cm' })), bonus: readAnswer(bonusAnswer) }, true); setSaved('saved'); celebrate(true); } catch { setSaved('error'); }
  };
  return <div className="space-y-6 pb-24">
    <div className="flex flex-wrap gap-2 text-sm font-bold"><span className={stage === 'lesson' ? 'text-primary' : 'text-muted-foreground'}>1. Bekal mengukur</span><span aria-hidden="true">→</span><span className={stage === 'avatar' ? 'text-primary' : 'text-muted-foreground'}>2. Avatar</span><span aria-hidden="true">→</span><span className={stage === 'mission' ? 'text-primary' : 'text-muted-foreground'}>3. Jelajah kelas</span></div>
    {stage === 'lesson' && <BrokenRulerLesson onReady={() => setStage('avatar')}/>}
    {stage === 'avatar' && <section className="space-y-5"><h2 className="text-2xl font-bold">Siapa penjelajahmu?</h2><div className="grid grid-cols-3 gap-2" role="group" aria-label="Pilih avatar">{avatars.map(a => <Button key={a.id} variant={avatar === a.id ? 'secondary' : 'outline'} className="h-auto flex-col gap-3 whitespace-normal py-5" aria-pressed={avatar === a.id} onClick={() => setAvatar(a.id)}><span className={`avatar-preview avatar-${a.id}`} aria-hidden="true"><span className="avatar-head"/><span className="avatar-body"/><span className="avatar-legs"/></span><span className="font-display font-bold">{a.emoji} {a.name}</span>{avatar === a.id && <Check/>}</Button>)}</div><div className="flex flex-wrap gap-2"><Button variant="ghost" onClick={() => setStage('lesson')}><ArrowLeft/>Materi</Button><Button onClick={() => setStage('mission')}>Masuk kelas<ArrowRight/></Button></div></section>}
    {stage === 'mission' && <>
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-bold">Jelajah Kelas 3D</h2><p className="text-muted-foreground">Misi penggaris patah · semua panjang dalam cm</p></div><span className="rounded-full bg-sun-soft px-4 py-2 font-display font-bold">⭐ {done.length} / 10 benda</span></div>
      <ClientOnly fallback={<div className="classroom-canvas grid place-items-center bg-sky-soft">Membuka pintu kelas…</div>}><Suspense fallback={<div className="classroom-canvas grid place-items-center bg-sky-soft">Membuka pintu kelas…</div>}><ClassroomScene avatar={avatar} done={done} moving={moving} onPick={pick} onArrive={arrive}/></Suspense></ClientOnly>
      <div className="flex flex-wrap gap-2"><Button variant="ghost" onClick={() => setStage('lesson')} disabled={Boolean(moving)}><ArrowLeft/>Baca materi lagi</Button><Button variant="ghost" onClick={() => setStage('avatar')} disabled={Boolean(moving)}>Ganti avatar</Button></div>
      <section className="space-y-3"><h3 className="text-xl font-bold">🎒 Temuan di kelas</h3><ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">{classroomObjects.map(item => <li key={item.id} className="min-w-0 rounded-lg border border-border bg-card p-3"><span className="block text-2xl" aria-hidden="true">{item.emoji}</span><span className="block font-bold">{item.name}</span><span className="text-xs text-muted-foreground">{done.includes(item.id) ? `✓ ${lengthOf(item)} cm` : 'Belum diukur'}</span></li>)}</ul></section>
      {canOpenBonus(done) && <section className="space-y-4 border-t border-border pt-6"><h2 className="text-2xl font-bold">🌟 Bonus: papan tulis!</h2><p>Papan tulis biasanya diukur dalam meter. Kali ini gunakan sentimeter. Ujung kiri pada 40 cm, ujung kanan pada 240 cm. Berapa panjang papan tulis?</p><BrokenRuler start={bonus.start} end={bonus.end} name="Papan tulis" large reveal={saved === 'saved'}/><form onSubmit={e => { e.preventDefault(); void finish(); }} className="space-y-3"><label htmlFor="bonus-answer" className="block font-bold">Panjang papan tulis</label><div className="flex flex-wrap items-center gap-2"><input id="bonus-answer" className="field-fun max-w-36" inputMode="numeric" value={bonusAnswer} disabled={saved === 'saved'} onChange={e => { setBonusAnswer(e.target.value); setBonusChecked(false); }}/><span>cm</span><Button type="submit" disabled={saved === 'saving' || saved === 'saved'}><Star/>{saved === 'saving' ? 'Menyimpan…' : saved === 'saved' ? 'Misi selesai!' : 'Selesaikan misi'}</Button></div></form>{bonusChecked && !canFinishMission(done, bonusAnswer) && <p role="status" className="text-destructive">Kurangi 240 dengan 40. Jawab dengan satuan cm, ya!</p>}{saved === 'error' && <p role="alert" className="text-destructive">Hasil belum tersimpan. Coba selesaikan misi sekali lagi.</p>}{saved === 'saved' && <p role="status" className="font-bold text-primary">🎉 Sepuluh benda dan bonus selesai! Nilaimu 11 dari 11, sudah tersimpan.</p>}</section>}
      {saved === 'saved' && canFinishMission(done, bonusAnswer) && <SelfAssess from="level-3" options={['Membaca kedua ujung benda', 'Mengukur dengan penggaris patah', 'Mengurangi angka kanan dengan angka kiri', 'Mengukur benda besar dalam cm']} nextTo="/modul-b" nextLabel="Lanjut ke Modul B"/>}
      <Button variant="ghost" disabled={Boolean(moving) || saved === 'saving'} onClick={() => { setStage('lesson'); setDone([]); setBonusAnswer(''); setBonusChecked(false); setSaved('idle'); setAttempts(0); }}><RotateCcw/>Mulai ulang petualangan</Button>
    </>}
    <Dialog open={Boolean(selected)} onOpenChange={open => { if (!open) setSelected(null); }}><DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto"><DialogTitle>{selected?.emoji} Ukur {selected?.name}</DialogTitle><DialogDescription>Penggarisnya tidak mulai dari 0. Baca kedua ujung benda.</DialogDescription>{selected && <><BrokenRuler start={selected.start} end={selected.end} name={selected.name} item={selected} reveal={correct}/><form onSubmit={e => { e.preventDefault(); submit(); }} className="space-y-3"><label htmlFor="object-answer" className="block font-bold">Berapa panjang benda?</label><div className="flex items-center gap-2"><input id="object-answer" className="field-fun min-w-0" inputMode="numeric" value={answer} disabled={correct} onChange={e => { setAnswer(e.target.value); setFeedback(''); }}/><span>cm</span></div>{feedback && <p role="status" className={correct ? 'font-bold text-primary' : 'text-destructive'}>{feedback}</p>}{correct ? <Button type="button" onClick={() => setSelected(null)}>Kembali ke kelas<ArrowRight/></Button> : <Button type="submit"><Check/>Periksa panjang</Button>}</form>{!correct && <><Button variant="ghost" onClick={() => setHint(!hint)}>💡 {hint ? 'Tutup petunjuk' : 'Butuh petunjuk?'}</Button>{hint && <p className="bg-sun-soft p-3">Ujung kanan: {selected.end} cm. Ujung kiri: {selected.start} cm. Hitung {selected.end} − {selected.start}.</p>}</>}</>}</DialogContent></Dialog>
    <HelperBot tips={['Penggaris patah tetap bisa dipakai. Baca angka di kedua ujung.', 'Panjang benda = angka kanan dikurangi angka kiri.', 'Semua jawaban di kelas ini memakai cm.', 'Setelah sepuluh benda terukur, ada satu bonus papan tulis.']}/>
  </div>;
}