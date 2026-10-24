import cat from "@/assets/game/av-cat.png";
import rabbit from "@/assets/game/av-rabbit.png";
import panda from "@/assets/game/av-panda.png";
import kid from "@/assets/game/av-kid.png";
import owl from "@/assets/game/av-owl.png";

export const AVATARS = [
  { id: "cat", name: "Kucing", src: cat },
  { id: "rabbit", name: "Kelinci", src: rabbit },
  { id: "panda", name: "Panda", src: panda },
  { id: "kid", name: "Si Kacamata", src: kid },
  { id: "owl", name: "Burung Hantu", src: owl },
] as const;

export type AvatarId = (typeof AVATARS)[number]["id"];
export const avatarSrc = (id: string | null | undefined) => (AVATARS.find((a) => a.id === id) ?? AVATARS[0]).src;
