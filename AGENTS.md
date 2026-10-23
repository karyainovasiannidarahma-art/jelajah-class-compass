<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep Level 2 demonstrations, room interaction, and shared measurement rules in focused modules under `src/components/level-two`; this keeps the route small and the answer rules independently testable.
- Level 2 reuses the shared HelperBot without a separate AI integration, and mission reflection is owned by MeasureRoom using the shared completion predicate; this keeps chat behavior consistent and prevents reflection bypassing the mission.
- Keep Level 3 lesson, mission rules, and classroom scene under `src/components/level-three`; load the React Three Fiber scene lazily behind ClientOnly to keep browser-only rendering out of SSR, and save completion only after all measurements and the bonus pass.
