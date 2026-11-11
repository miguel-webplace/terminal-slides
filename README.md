# terminal-slides

Markdown-driven presentations that look like a Linux terminal. Every slide is
"run" as a command, typed out with an animation.

## Run
Put the folder anywhere and **double-click `index.html`**. No server, no Node, no install.

```
terminal-slides/
├── index.html   ← the slides' Markdown lives inside this file
├── style.css
├── app.js
└── assets/      ← your images (relative paths)
```

Edit the slides: open `index.html` in a text editor and change the Markdown inside
`<script type="text/markdown" id="slides-md"> … </script>`, then refresh.
Or drag any `.md` file onto the browser window to present it instantly
(images in it resolve relative to `index.html`).

Fonts (Sora, JetBrains Mono) load from Google Fonts when online; offline it falls
back to system fonts. To be 100% offline-identical, download the font files into the
folder and replace the `<link>` in `index.html` with `@font-face` rules.

## Keys
`→` `Space` `Enter` next · `←` `Backspace` previous · `Home` / `End` · click = next.
Any key while typing finishes the command instantly. `#N` in the URL opens slide N.

## Commands
| Command | When |
|---|---|
| `cat file.md` | any regular slide |
| `tree` | `@layout: summary` — folder tree of all topics and slides |
| `cd topic` / `cd ../topic` / `cd ~` | whenever `@topic` changes between slides |

## Notation
```
@title / @user / @host / @root     global settings (first block, no @layout)
---                                slide separator
@layout: text | images | big | summary
@topic:  Name                      groups slides into a folder
@file:   name.md                   file name used by cat
```
Body: `# title`, `## subtitle`, paragraphs, `- bullets`, `**bold**`, `*italic*`, `` `code` ``,
`![caption](assets/img.svg)` (max 2 per images slide). On `big` slides the `#` line is the
giant text and the paragraph is its label.

Colors and fonts are CSS variables at the top of `style.css`.
