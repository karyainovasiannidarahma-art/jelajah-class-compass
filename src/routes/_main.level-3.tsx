import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "@/components/Fun";
import { meta } from "@/lib/user";
import { ClassroomMission } from "@/components/level-three/ClassroomMission";

export const Route = createFileRoute("/_main/level-3")({
  head: () => meta("Level 3: Jelajah Kelas", "Belajar penggaris patah, memilih avatar, dan mengukur sepuluh benda dalam kelas 3D dengan satuan sentimeter."),
  component: L3,
});

function L3() {
  return (
    <div>
      <PageTitle emoji="👑" title="Level 3: Mahir" sub="Petualangan penggaris patah di kelas!" />
      <ClassroomMission />
    </div>
  );
}
