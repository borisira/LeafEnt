# LEAF Entertainment

An editorial entertainment site for news, music charts and conversations. The motto is **Let 'Em All Fly.** Built with React, TypeScript and Vite, with responsive layouts and Poppins typography.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Vite prints the local URL when the development server is ready.

## Checks and production preview

```sh
npm run lint
npm run build
npm run preview
```

## Sections

- Home: rotating featured story and links into current updates.
- Charts: Top 10 local songs, Top 10 global albums and International Top 10 songs.
- News: local entertainment, international stories and sports.
- Podcast: The LEAF XTRA Podcast, with journalist-created episode drafts, editor publishing, YouTube playback and recommendations for other published episodes.
- Contact: FAQs, viewer-opinion form, story-tip form with supporting images, social links and footer note form.
- Dashboard: use the Dashboard link to open sign-in. Admins manage accounts, website settings, viewer opinions and story submissions; Chief Editors can review viewer opinions and story submissions; Journalists manage their own drafts and see feedback on their stories.

Navigation uses hash routes, so the site works on a static host without server-side route configuration.

On first visit, choose English or Kinyarwanda. The choice is saved in this browser and can be changed from the header. English uses the original site; Kinyarwanda opens the current page through Google Translate (`rw`), including its story text. Admins can edit the masthead, Home, Charts, Podcast and Contact copy, plus social media destinations, in Website settings.

## Prototype content

On first use, create the initial Admin account at the dashboard login page. Admin passwords must be at least 10 characters. Admins add employees with a name, username, email, role and initial password from Team Access. Admins can edit employee details and manually set or reset their passwords. Admins can also delete employee accounts; their stories and feedback remain assigned to the Admin who deletes the account.

Journalists can add and edit their own story and podcast drafts but cannot publish or delete them. Story editing includes a title, lead, full body, uploaded image or image URL, image description, and optional YouTube link. Podcast episodes include a title, summary and YouTube URL. Published Podcast episodes recommend the other published episodes. Uploaded images are resized and stored in this browser's local storage. Drafts stay out of public pages until an Admin or Chief Editor publishes them; published News articles show the author and publication date/time. Chief Editors and Admins can edit, publish and delete stories and podcast episodes. All account roles have a My password page and can change only their own password after entering the current password. Admins also manage employee accounts and website settings. The Rwanda chart links directly to Audiomack Charts; four displayed positions are verified from its Rwanda section, and six are editorial samples because a live feed is not connected. Global albums and international songs also show ten sample positions. Reader opinions and story tips are stored separately; story tips can include up to four supporting images. Journalist story feedback remains linked to the story author and is shown only to that journalist, while Chief Editors and Admins see all such feedback.

Accounts, story edits, website settings, submissions, feedback and review state persist in this browser's local storage. Passwords are salted and hashed locally, but this dashboard is still an unauthenticated client-side prototype: local storage and UI role checks are not secure access control and do not sync to a server. Use server-backed authentication and storage before deployment. Submission forms show local confirmation only; they do not deliver email or verify claims/images.

Stories, feedback messages and chart rankings in `src/App.tsx` are editorial sample data. Chart links point to Audiomack and Billboard, but the site does not fetch or synchronize live rankings. Replace the sample arrays with licensed, approved data sources before publishing live charts. The podcast uses example YouTube video IDs; replace them with LEAF episode IDs. Contact forms currently provide local confirmation only and need an email/API integration to deliver submissions. Replace the sample contact address before publishing. Photos and Poppins are loaded from external services, so those assets require an internet connection.
