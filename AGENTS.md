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
