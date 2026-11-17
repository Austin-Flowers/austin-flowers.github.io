# austin-flowers.github.io

Source for my portfolio site, served by GitHub Pages at **https://austin-flowers.github.io**.

It's plain HTML, CSS and a small script: no build step, no framework. Pushing to `main` publishes the site within a minute or two.

| Page | File |
|---|---|
| Overview | `index.html` |
| Resume | `resume.html` |
| Projects | `projects.html` |

All three share `assets/style.css`. The header and footer are repeated in each file, so a change to the nav or contact links needs making in all three.

## Adding or updating a project

Every project on the site comes from one file: [`data/projects.json`](data/projects.json). Add an entry to the `projects` list:

```json
{
  "id": "snowflake-pipeline",
  "title": "Telecom data platform on Snowflake",
  "group": "data-engineering",
  "status": "live",
  "featured": true,
  "image": "assets/projects/snowflake-dashboard.png",
  "imageAlt": "Dashboard showing service tickets by region",
  "summary": "One or two sentences on what it is and what it does.",
  "details": "Optional. Shown when someone clicks 'How it works'.",
  "tech": ["Snowflake", "dbt", "Python"],
  "links": [
    { "label": "View the code", "url": "https://github.com/Austin-Flowers/..." },
    { "label": "Live dashboard", "url": "https://..." }
  ]
}
```

| Field | Required | What it does |
|---|---|---|
| `id` | yes | Short unique name, used in the page link (`#project-<id>`) |
| `title` | yes | Project name |
| `group` | yes | Which section it goes in. Must match an `id` in `groups` |
| `status` | no | `live`, `merged`, `in-progress` or `archived` |
| `statusLabel` | no | Overrides the status text, e.g. `"Alpha"` |
| `featured` | no | `true` shows it on the Overview page (first 3 featured projects) |
| `image` | no | Screenshot shown at the top of the tile, e.g. a Tableau dashboard. Put images in `assets/projects/` |
| `imageAlt` | no | One-line description of the image for screen readers |
| `summary` | yes | The line people read first |
| `details` | no | Longer explanation, shown in a pop-up when someone clicks Details |
| `tech` | no | List shown as "Stack: …" |
| `links` | no | Buttons to code, demos or write-ups |
| `hidden` | no | `true` keeps the entry in the file but off the page |

Groups are the filter buttons on the Projects page, defined in the same file under `groups` in display order. A group with no projects doesn't get a button, so **Data engineering** and **Dashboards** stay hidden until their first project goes in.

## Changing experience, skills or contact details

Experience, skills and certifications live in [`resume.html`](resume.html). The overview text and the "What I work on" areas are in [`index.html`](index.html). To add a resume download, put the PDF in `assets/` and uncomment the Download PDF button at the top of `resume.html`.

## Previewing locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` straight from disk won't load the projects, because browsers block reading the JSON file that way.

## Credits

Fonts: [Poppins](https://github.com/itfoundry/Poppins) and [Fira Sans](https://github.com/mozilla/Fira), self-hosted under the SIL Open Font License.
