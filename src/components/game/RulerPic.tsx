import pencil from "@/assets/game/ruler-pencil.png";
import crayon from "@/assets/game/ruler-crayon.png";
import eraser from "@/assets/game/ruler-eraser.png";
import ribbon from "@/assets/game/ruler-ribbon.png";
import skewer from "@/assets/game/ruler-skewer.png";
import marker from "@/assets/game/ruler-marker.png";

const OBJECTS: Record<string, { src: string; ratio: number }> = {
  pensil: { src: pencil, ratio: 76 / 1282 },
  krayon: { src: crayon, ratio: 104 / 905 },
  penghapus: { src: eraser, ratio: 177 / 658 },
  pita: { src: ribbon, ratio: 91 / 1288 },
  lidi: { src: skewer, ratio: 30 / 1294 },
  spidol: { src: marker, ratio: 132 / 1280 },
};

export function RulerPic({ length, object }: { length: number; object: string; color: string }) {
  const asset = OBJECTS[object];
  if (!asset) return null;
  const max = 16, width = 640, pad = 24, unit = (width - pad * 2) / max;
  const objectWidth = length * unit;
  const objectHeight = Math.min(64, Math.max(10, objectWidth * asset.ratio));
  return (
    <svg viewBox={`0 0 ${width} 170`} role="img" aria-label={`${object} di atas penggaris sentimeter`} className="mx-auto w-full max-w-xl text-foreground">
      <image href={asset.src} x={pad} y={82 - objectHeight} width={objectWidth} height={objectHeight} preserveAspectRatio="none" />
      {[pad, pad + objectWidth].map(x => (
        <line key={x} x1={x} x2={x} y1={84} y2={104} stroke="currentColor" strokeWidth={1.5} strokeDasharray="4 4" opacity={0.55} />
      ))}
      <rect x={8} y={100} width={width - 16} height={60} rx={5} className="ruler-surface" stroke="currentColor" strokeWidth={1.5} />
      {Array.from({ length: max + 1 }).map((_, i) => (
        <g key={i}>
          <line x1={pad + i * unit} x2={pad + i * unit} y1={100} y2={123} stroke="currentColor" strokeWidth={1.5} />
          <text x={pad + i * unit} y={148} fontSize={18} textAnchor="middle" fontWeight={800} fill="currentColor">{i}</text>
          {i < max && Array.from({ length: 9 }).map((_, j) => (
            <line key={j} x1={pad + (i + (j + 1) / 10) * unit} x2={pad + (i + (j + 1) / 10) * unit} y1={100} y2={j === 4 ? 116 : 108} stroke="currentColor" strokeWidth={0.8} />
          ))}
        </g>
      ))}
      <text x={width - pad} y={168} fontSize={14} textAnchor="end" fill="currentColor">cm</text>
    </svg>
  );
}
