# NAMWAAOK portfolio

Personal portfolio of Waritnun Anupat, MD (FETP, Bangkok): health apps, outbreak tools, agentic AI and research.

Static site: HTML, CSS and vanilla JavaScript with GSAP (CDN). No build step.

## Run locally

Double-click `start.bat` (Windows), or run `py -m http.server 8080` and open http://localhost:8080.
Add `?motion=on` to the URL to preview full animation when the OS "reduce motion" setting is on.

## Edit the content

- `data/site.json`: name, tagline, bio, skills, email, social links, collaboration topics.
- `data/projects.json`: projects, videos and papers. Required: `title`, `type`, and `link` or `video`.
  Optional: `description`, `year`, `featured`, `tags`, `image`, `logo`, `poster`, `fullTitle`.
