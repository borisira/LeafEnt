# LEAF Entertainment workspace guidance

- Use the existing Vite, React, and TypeScript stack. Keep page navigation compatible with the current hash routes in `src/App.tsx`.
- Keep the white and green editorial palette, Poppins typography, and responsive behavior consistent with `src/App.css` and `src/index.css`.
- Treat chart rankings, news stories, and podcast IDs as sample content unless a real approved data source is connected. Do not describe sample content as live.
- Keep dashboard story edits category-aware and consistent with the public Home and News views. Local storage is prototype persistence, not a server or access-control layer.
- Preserve the Admin, Chief Editor, and Journalist permission boundaries. Journalists own drafts and cannot publish or delete; published content must be changed by an editor role.
- Associate public story feedback with both the story ID and its author ID. Journalists see only their own stories' feedback; Chief Editors and Admins see all feedback.
- Keep viewer opinions and story-news submissions as separate Admin/Chief Editor inbox types; story submissions may include supporting images but are unverified reader material until editors review them.
- Keep viewer opinions separate from reader-submitted story pitches. Story-pitch evidence is reader-provided and does not constitute verification by itself.
- Keep contact and footer forms honest about whether submissions are delivered; a service integration is required for real delivery.
- Run `npm run build` after implementation changes and `npm run lint` when changing TypeScript or styling.