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

## Application architecture

- Preserve this project's platform configuration and Git metadata when importing source; repository source imports do not establish Git sync.
- Keep the racing simulation in `src/game/`, React responsible for menus and HUD, and Three.js rendering dynamically loaded; this avoids per-frame React work and server-side browser API execution.
- Serve imported car models and engine audio from `public/game-assets` and retain bundled image imports; this keeps the repository's existing media available on this project's origin.
- Keep the game at `/` with its own page metadata and client-only rendering; the engine depends on browser canvas and audio APIs.
- Traffic vehicles are real-scale CC0 GLBs in `public/game-assets/traffic-*.glb` (textures stripped, meshopt) restyled into a few shared materials in `models3d.ts`; keeps draw calls low on phones.
- Sports traffic (Mustang, BMW) alternates calm/push moods via pure `nextSportMood` in `traffic-rules.ts`; merging cars respect the target lane's leader so lanes never overlap.
- Selectable camera views are pure poses in `src/game/camera-views.ts` applied by render3d; scenery and traffic render far behind the car so the reverse camera never exposes unloaded world.
- Bake road environment reflections once in `road-lighting.ts`; use shared contact textures and local light halos rather than full-screen phone post-processing to limit rendering cost.
