import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html, OrbitControls, ContactShadows } from '@react-three/drei';
import { Group, Vector3 } from 'three';
import { Button } from '@/components/ui/button';
import { avatars, classroomObjects, type AvatarId, type ClassroomObject } from './mission';

const paletteTokens = ['background', 'card', 'foreground', 'primary', 'secondary', 'wood', 'sky', 'sky-soft', 'sun', 'box-red', 'pink-soft'] as const;
type Palette = Record<typeof paletteTokens[number], string>;
function readPalette(): Palette {
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) throw new Error('Warna kelas tidak dapat dimuat');
  const css = getComputedStyle(document.documentElement);
  return Object.fromEntries(paletteTokens.map(token => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = css.getPropertyValue(`--${token}`).trim();
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [token, `rgb(${r},${g},${b})`];
  })) as Palette;
}
function Block({ position, size, color }: { position: [number, number, number]; size: [number, number, number]; color: string }) {
  return <mesh position={position} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={0.85}/></mesh>;
}
function ItemModel({ item, palette: p }: { item: ClassroomObject; palette: Palette }) {
  const id = item.id;
  if (['pencil', 'pen', 'crayon', 'brush'].includes(id)) return <group rotation={[0, 0, Math.PI / 2]}><mesh castShadow><cylinderGeometry args={[0.055, 0.055, 0.65, 8]}/><meshStandardMaterial color={p[id === 'crayon' ? 'box-red' : id === 'pen' ? 'sky' : 'wood']}/></mesh><mesh position={[0, 0.37, 0]}><coneGeometry args={[0.055, 0.1, 8]}/><meshStandardMaterial color={p.foreground}/></mesh>{id === 'brush' && <mesh position={[0, -0.4, 0]}><sphereGeometry args={[0.1, 12, 12]}/><meshStandardMaterial color={p.foreground}/></mesh>}</group>;
  if (id === 'bottle' || id === 'glue') return <group><mesh position={[0, 0.15, 0]} castShadow><cylinderGeometry args={[0.13, 0.14, id === 'bottle' ? 0.5 : 0.32, 20]}/><meshStandardMaterial color={p[id === 'bottle' ? 'sky' : 'card']}/></mesh><mesh position={[0, id === 'bottle' ? 0.43 : 0.34, 0]}><cylinderGeometry args={[0.1, 0.1, 0.09, 16]}/><meshStandardMaterial color={p.primary}/></mesh></group>;
  if (id === 'scissors') return <group rotation={[-Math.PI / 2, 0, 0]}>{[-1, 1].map(s => <group key={s}><mesh position={[s * 0.11, 0, 0]}><torusGeometry args={[0.1, 0.035, 8, 16]}/><meshStandardMaterial color={p['box-red']}/></mesh><mesh position={[s * 0.055, 0.25, 0]} rotation={[0, 0, s * -0.2]}><boxGeometry args={[0.045, 0.4, 0.035]}/><meshStandardMaterial color={p.foreground}/></mesh></group>)}</group>;
  return <group><Block position={[0, 0.045, 0]} size={id === 'book' ? [0.5, 0.08, 0.65] : id === 'case' ? [0.65, 0.18, 0.27] : [0.25, 0.12, 0.16]} color={p[id === 'book' ? 'sky' : id === 'case' ? 'primary' : 'pink-soft']}/>{id === 'book' && <Block position={[0, 0.09, 0]} size={[0.3, 0.01, 0.15]} color={p.card}/>}</group>;
}
function Student({ avatar, moving, onArrive, palette: p }: { avatar: AvatarId; moving: ClassroomObject | null; onArrive: (item: ClassroomObject) => void; palette: Palette }) {
  const ref = useRef<Group>(null);
  const legA = useRef<Group>(null);
  const legB = useRef<Group>(null);
  const phase = useRef<'out' | 'back'>('out');
  const [carrying, setCarrying] = useState(false);
  useEffect(() => { phase.current = 'out'; setCarrying(false); }, [moving]);
  useFrame(({ clock }, dt) => {
    const student = ref.current;
    if (!student || !moving) return;
    const [x, , z] = moving.position;
    const target = phase.current === 'out' ? new Vector3(x, 0, z + 0.8) : new Vector3(0, 0, 4);
    const delta = target.clone().sub(student.position);
    if (delta.length() < 0.09) {
      if (phase.current === 'out') { phase.current = 'back'; setCarrying(true); }
      else { setCarrying(false); onArrive(moving); if (legA.current) legA.current.rotation.x = 0; if (legB.current) legB.current.rotation.x = 0; }
      return;
    }
    student.position.add(delta.normalize().multiplyScalar(Math.min(dt * 5, student.position.distanceTo(target))));
    student.rotation.y = Math.atan2(delta.x, delta.z);
    if (legA.current) legA.current.rotation.x = Math.sin(clock.elapsedTime * 12) * 0.45;
    if (legB.current) legB.current.rotation.x = -Math.sin(clock.elapsedTime * 12) * 0.45;
  });
  const color = p[avatars.find(a => a.id === avatar)?.token ?? 'primary'];
  return <group ref={ref} position={[0, 0, 4]}>
    <mesh position={[0, 1.15, 0]} castShadow><sphereGeometry args={[0.23, 24, 24]}/><meshStandardMaterial color={p.wood}/></mesh>
    <mesh position={[0, 1.29, -0.035]}><sphereGeometry args={[0.23, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]}/><meshStandardMaterial color={p.foreground}/></mesh>
    {[-0.08, 0.08].map(x => <mesh key={x} position={[x, 1.18, 0.213]}><sphereGeometry args={[0.023, 8, 8]}/><meshStandardMaterial color={p.foreground}/></mesh>)}
    <Block position={[0, 0.77, 0]} size={[0.4, 0.44, 0.25]} color={color}/>
    {[-1, 1].map(s => <group key={s} ref={s === -1 ? legA : legB} position={[s * 0.11, 0.55, 0]}><Block position={[0, -0.22, 0]} size={[0.14, 0.43, 0.15]} color={p.foreground}/><Block position={[0, -0.45, 0.045]} size={[0.17, 0.09, 0.24]} color={p.wood}/></group>)}
    {[-1, 1].map(s => <Block key={s} position={[s * 0.29, 0.78, carrying ? 0.18 : 0]} size={[0.13, 0.4, 0.13]} color={p.wood}/>)}
    {carrying && moving && <group position={[0, 0.8, 0.4]}><ItemModel item={moving} palette={p}/></group>}
  </group>;
}
export default function ClassroomScene({ avatar, done, moving, onPick, onArrive }: { avatar: AvatarId; done: string[]; moving: ClassroomObject | null; onPick: (item: ClassroomObject) => void; onArrive: (item: ClassroomObject) => void }) {
  const [palette, setPalette] = useState<Palette | null>(null);
  useEffect(() => setPalette(readPalette()), []);
  if (!palette) return <div className="classroom-canvas grid place-items-center bg-sky-soft">Membuka pintu kelas…</div>;
  const p = palette;
  const pick = (e: ThreeEvent<MouseEvent>, item: ClassroomObject) => { e.stopPropagation(); if (!moving && !done.includes(item.id)) onPick(item); };
  return <div className="classroom-canvas relative" aria-label="Ruang kelas 3D">
    <Canvas shadows dpr={[1, 1.5]} camera={{ position: [11, 12, 15], fov: 44 }} gl={{ antialias: true }}>
      <color attach="background" args={[p['sky-soft']]}/><ambientLight intensity={1.3}/><directionalLight position={[-3, 9, 4]} intensity={2} castShadow shadow-mapSize={[1024, 1024]}/>
      <Block position={[0, -0.1, 0]} size={[11, 0.2, 11]} color={p.wood}/>
      {Array.from({ length: 12 }, (_, i) => <Block key={i} position={[-5 + i * 0.9, 0.005, 0]} size={[0.018, 0.01, 11]} color={p.background}/>)}
      <Block position={[0, 1.8, -5.3]} size={[11, 3.6, 0.18]} color={p.background}/>
      <Block position={[0, 2.2, -5.15]} size={[4.8, 1.9, 0.15]} color={p.primary}/>
      <Html position={[0, 2.3, -5]} center transform distanceFactor={7}><span className="font-display text-lg font-bold text-primary-foreground">Kelas Penjelajah · III</span></Html>
      {[-4, 4].map(x => <group key={x}><Block position={[x, 2.3, -5.12]} size={[1.3, 1.8, 0.1]} color={p.sky}/><Block position={[x, 2.3, -5.03]} size={[0.08, 1.8, 0.1]} color={p.card}/><Block position={[x, 2.3, -5.03]} size={[1.3, 0.08, 0.1]} color={p.card}/></group>)}
      {classroomObjects.map(item => { const [x, y, z] = item.position; const measured = done.includes(item.id); return <group key={item.id}>
        <Block position={[x, 1, z]} size={[1.4, 0.15, 1.1]} color={p.wood}/>
        {[-0.5, 0.5].flatMap(dx => [-0.35, 0.35].map(dz => <Block key={`${dx}-${dz}`} position={[x + dx, 0.48, z + dz]} size={[0.08, 0.95, 0.08]} color={p.foreground}/>))}
        <Block position={[x, 0.55, z + 0.9]} size={[0.65, 0.1, 0.6]} color={p.secondary}/><Block position={[x, 0.85, z + 1.2]} size={[0.65, 0.6, 0.1]} color={p.secondary}/>
        {!measured && <group position={[x, y, z]} onClick={e => pick(e, item)}><ItemModel item={item} palette={p}/></group>}
        <Html position={[x, 1.9, z]} center zIndexRange={[20, 0]}><Button variant={measured ? 'secondary' : 'default'} size="icon" className="rounded-full shadow-soft" aria-label={`Ambil ${item.name}`} title={item.name} disabled={Boolean(moving) || measured} onClick={() => onPick(item)}>{measured ? '✓' : item.emoji}</Button></Html>
      </group>; })}
      <Student avatar={avatar} moving={moving} onArrive={onArrive} palette={p}/>
      <ContactShadows position={[0, 0.02, 0]} opacity={0.3} scale={15} blur={2} far={4}/>
      <OrbitControls target={[0, 0.7, 0]} enablePan={false} enableZoom={false} minPolarAngle={0.5} maxPolarAngle={1.1} minAzimuthAngle={-0.3} maxAzimuthAngle={0.8}/>
    </Canvas>
    <p className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-card/90 px-3 py-2 text-sm font-semibold" role="status">{moving ? `${avatars.find(a => a.id === avatar)?.name} mengambil ${moving.name.toLowerCase()}…` : '🏫 Kelas Penjelajah'}</p>
  </div>;
}