# NAMWAAOK portfolio

Portfolio of **Waritnun Anupat, MD**: a doctor in the Field Epidemiology Training Program (FETP), Bangkok, who builds health apps, analyses data and explores agentic AI and automation. It collects his apps, videos and published outbreak research in one place and invites collaboration. The whole site is available in **English and Thai** with an EN | ไทย switch in the nav.

**Live site: [namwaaok.vercel.app](https://namwaaok.vercel.app)**

![Hero: huge moving type reading NAMWAAOK, Doctor, Builder, Disease detective](assets/readme/hero.jpg)

## What's on the page

| Section | What it shows |
|---|---|
| **Hero** | Three rows of kinetic type that speed up as you scroll, after a short loading counter. |
| **About** | Portrait, bio, project counter, toolkit (AI tools, Python, R, data analytics, video editing), contact links, a "Latest" tile, and YouTube and TikTok tiles that describe each channel. |
| **Work** | A bento grid of apps, one card that holds the three animated explainer videos (arrows, dots, swipe and auto-advance) and three first-author papers, with filter tabs (All, App, Video, Research). Clicking a video opens it in a pop-up player. |
| **Collaborate** | One-click, pre-filled emails for health apps, outbreak and epi tools, agentic AI, research, simple websites, and job opportunities. |

![About section with portrait, bio, toolkit and links](assets/readme/about.jpg)

![Work grid: Plathong, leptospirosis animation, Dog-Bite-Me, Episignal, MantaSlide and three research papers](assets/readme/work.jpg)

![Collaborate section with six topic cards](assets/readme/collaborate.jpg)

## Featured work

- **Plathong**: a LINE chatbot for home blood-pressure tracking. Send a photo of the monitor and AI reads it, charts the trend and reminds you of appointments.
- **Dog-Bite-Me**: an offline-first rabies guide in Thai, English and Burmese.
- **Episignal**: open global outbreak intelligence with every event linked to its source.
- **MantaSlide**: control PowerPoint from your phone over Wi-Fi.
- **Research**: norovirus (OSIR 2025), human rabies deaths (Discover Public Health 2026) and scarlet fever (JDH 2026) outbreak investigations.
- **Animations** (in Thai): leptospirosis and flood water, why a sore throat doesn't need antibiotics, and why mosquitoes pick some people.

## Tech

Static site, no build step: HTML, CSS and vanilla JavaScript (ES modules) with [GSAP](https://gsap.com) and ScrollTrigger loaded from a CDN. Fonts are Anton, Space Grotesk and JetBrains Mono from Google Fonts. Brand icons come from [Simple Icons](https://simpleicons.org) (CC0).

Good to know:

- Content lives in two JSON files and never touches the code.
- Bilingual: every visible text exists in English and Thai. The switch re-renders the page instantly and remembers the choice.
- Motion is on by default, even if the visitor's OS has "reduce motion" turned on. A pause button (⏸) in the nav switches every animation, loop and auto-advance off (marquees stay still, reveals become simple fades) and remembers the choice in the browser. `?motion=off` or `?motion=on` in the URL forces either state.
- If GSAP fails to load, the page still shows all content. If the data files fail to load, visitors see a friendly fallback with a YouTube link.
- Layout adapts from phone to desktop.

## Performance and video

The first load is about 0.8 MB (images plus code). Videos never load on their own:

- Each video tile shows a small poster image. The full video (`preload="none"`, about 4-5 MB) downloads only when someone clicks play, and starts playing before it has fully downloaded (`faststart`).
- Each video can also have a 4-second silent preview loop (60-150 KB, 480 px wide). The carousel plays the loop of the slide that is showing; it has no `src` until the card is on screen, pauses when it is scrolled away or the tab is hidden, and is skipped entirely (as is auto-advance) when motion is paused or the visitor uses data saver. A single standalone video tile loops on hover instead.
- Files under `assets/` are cached by the browser for a day (see `vercel.json`).

All projects with a `video` are grouped into one carousel card automatically (it sits where the first video is listed); the slide order follows `data/projects.json`. To add a video, put the files in `assets/video/` and add an entry to `data/projects.json` with `"type": "Video"`, `video`, `poster` and optionally `preview`. Make them with ffmpeg:

```bash
# full video: 720 px, quick start, light audio
ffmpeg -i source.mp4 -vf scale=720:-2 -c:v libx264 -crf 28 -c:a aac -b:a 64k -movflags +faststart name.mp4
# poster frame
ffmpeg -ss 1 -i name.mp4 -frames:v 1 -q:v 4 name.jpg
# 4-second silent preview loop
ffmpeg -ss 1 -t 4 -i name.mp4 -an -vf scale=480:-2,fps=24 -c:v libx264 -crf 31 -pix_fmt yuv420p -movflags +faststart name-loop.mp4
```

For long videos, link to YouTube instead of hosting the file, to stay within Vercel's bandwidth limits.

## Run locally

```bash
py -m http.server 8080
```

Then open http://localhost:8080. On Windows you can also double-click `start.bat`. (Opening `index.html` straight from disk won't work, because browsers block the JSON requests.)

## Edit the content

- `data/site.json`: name, tagline, hero line, bio, skills, photo, email, which project is "Latest", social links, the YouTube/TikTok channel descriptions (`channels`, each with `en` and `th` text) and the collaboration cards.
- Text fields can be a plain string or `{ "en": "...", "th": "..." }`. A missing Thai value falls back to English.
- Fixed interface text (nav, headings, labels, button text, email templates) lives in `js/i18n.js`.

## Language

The page opens in Thai if the visitor's browser prefers Thai, otherwise English. The EN | ไทย switch overrides that and is remembered in the browser. Adding `?lang=th` or `?lang=en` to the URL forces a language, which is handy for previews.
- `data/projects.json`: one block per project, video or paper. Required: `title`, `type`, and `link` (or `video`). Optional: `description`, `year`, `featured`, `tall`, `wide`, `tags`, `image`, `imageFit`, `imagePos`, `coverColor`, `logo`, `poster`, `preview`, `fullTitle`. `featured` makes a 2x2 tile, `wide` a 2x1 tile.

A new `type` automatically gets its own filter tab and colour.

## Deploy

Pushing to `main` redeploys the site on Vercel. Local-only files (planning docs, the unoptimised original photo, these README screenshots) are excluded from the deployment by `.vercelignore`. Keep that file up to date: the Vercel CLI ignores `.gitignore`.

## Rights

The text, photo, videos and project artwork belong to Waritnun Anupat. No open-source licence has been chosen yet, so please ask before reusing them.
