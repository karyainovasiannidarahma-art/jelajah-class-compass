export const PRAYERS = [
  {
    id: "islam", label: "Islam",
    text: "رَبِّ زِدْنِي عِلْمًا",
    transliteration: "Rabbi zidnii ‘ilmaa.",
    meaning: "Ya Tuhanku, tambahkanlah ilmu kepadaku.",
  },
  {
    id: "kristen", label: "Kristen",
    text: "Tuhan Yesus, terima kasih atas kesempatan belajar hari ini. Bimbinglah aku agar dapat memahami pelajaran dan menggunakan ilmuku untuk kebaikan. Amin.",
  },
  {
    id: "katolik", label: "Katolik",
    text: "Allah Bapa yang baik, terangilah pikiran dan hatiku saat belajar. Bantulah aku menjadi anak yang tekun, jujur, dan penuh kasih. Demi Kristus, Tuhan kami. Amin.",
  },
  {
    id: "hindu", label: "Hindu",
    text: "Om Awighnam Astu Namo Siddham.",
    meaning: "Semoga tiada halangan dan semoga berhasil. Semoga aku belajar dengan pikiran jernih dan menggunakan ilmu untuk kebaikan.",
  },
  {
    id: "buddha", label: "Buddha",
    text: "Semoga pikiranku tenang dan penuh perhatian saat belajar. Semoga pengetahuanku bertambah dan bermanfaat bagi semua makhluk. Semoga semua makhluk berbahagia.",
  },
  {
    id: "khonghucu", label: "Khonghucu",
    text: "Tian, Tuhan Yang Maha Esa, bimbinglah aku dalam belajar. Semoga aku tekun mencari ilmu, berbudi baik, dan menggunakan pengetahuanku untuk kebaikan sesama.",
  },
] as const;

export type ReligionId = (typeof PRAYERS)[number]["id"];
export const DEFAULT_RELIGION: ReligionId = "islam";

export function getPrayer(id: ReligionId) {
  return PRAYERS.find((prayer) => prayer.id === id) ?? PRAYERS[0];
}