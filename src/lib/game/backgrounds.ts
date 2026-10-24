import gardenMorning from "@/assets/game/bg-garden.jpg";
import beachSunset from "@/assets/game/bg-beach-sunset.jpg";
import mountainNight from "@/assets/game/bg-mountain-night.jpg";

// Shared by the game and level picker so each atmosphere has a single source.
export const BACKGROUNDS = {
  garden: { src: gardenMorning, label: "Taman · Pagi", alt: "Taman hijau di pagi yang cerah" },
  beach: { src: beachSunset, label: "Pantai · Sore", alt: "Pantai dengan langit jingga dan matahari sore" },
  mountain: { src: mountainNight, label: "Gunung · Malam", alt: "Gunung di bawah bulan dan bintang dengan lentera hangat" },
};

export type BackgroundId = keyof typeof BACKGROUNDS;