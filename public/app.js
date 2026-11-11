/* terminal-slides — reads slides.md, plays each slide as a shell command. */
const screen = document.getElementById('screen');
const idleEl = document.getElementById('idle');
let config = { title: 'talk', user: 'guest', host: 'slides', root: 'talk' };
let slides = [], idx = -1, cwd = null /* null = project root */, run = 0, busy = false, skip = false;

/* ---------- helpers ---------- */
const sleep = ms => new Promise(r => setTimeout(r, skip ? 0 : ms));
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const slug = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'slide';
const inline = s => esc(s)
  .replace(/`([^`]+)`/g,'<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
  .replace(/(^|[^*])\*([^*]+)\*/g,'$1<em>$2</em>');

/* ---------- markdown parsing ---------- */
function parseMarkdown(md) {
  md = md.replace(/<!--[\s\S]*?-->/g, '');
  for (const block of md.split(/^\s*---\s*$/m)) {
    const meta = {}; const body = [];
    for (const line of block.split('\n')) {
      const m = line.match(/^@(\w+):\s*(.*)$/);
      m ? meta[m[1].toLowerCase()] = m[2].trim() : body.push(line);
    }
    if (!meta.layout) { Object.assign(config, meta); continue; }   // global settings block
    const items = parseBody(body.join('\n'));
    const h1 = items.find(i => i.t === 'h1');
    slides.push({
      layout: meta.layout.toLowerCase(),
      topic: meta.topic || null,
      title: h1 ? h1.x : (meta.file || 'untitled'),
      file: (meta.file || slug(h1 ? h1.x : 'slide')) .replace(/(\.md)?$/, '.md'),
      items
    });
  }
}
function parseBody(body) {
  const items = []; let list = null, m;
  for (const raw of body.split('\n')) {
    const l = raw.trim();
    if (!l) { list = null; continue; }
    if ((m = l.match(/^!\[(.*?)\]\((.+?)\)$/))) { list = null; items.push({ t: 'img', alt: m[1], src: m[2] }); }
    else if ((m = l.match(/^(#{1,2})\s+(.*)$/))) { list = null; items.push({ t: 'h' + m[1].length, x: m[2] }); }
    else if ((m = l.match(/^[-*]\s+(.*)$/))) { if (!list) { list = { t: 'ul', items: [] }; items.push(list); } list.items.push(m[1]); }
    else { list = null; items.push({ t: 'p', x: l }); }
  }
  return items;
}

/* ---------- command planning ---------- */
function pathLabel(dir) { return '~/' + config.root + (dir ? '/' + dir : ''); }
function planCommands(s) {
  if (s.layout === 'summary') {
    const c = []; if (cwd) c.push({ cmd: 'cd ~', cd: null }); c.push({ cmd: 'tree' }); return c;
  }
  const target = s.topic ? slug(s.topic) : null, c = [];
  if (target !== cwd) c.push({ cmd: target === null ? 'cd ~' : (cwd ? `cd ../${target}` : `cd ${target}`), cd: target });
  c.push({ cmd: `cat ${s.file}` });
  return c;
}

/* ---------- prompt + typing ---------- */
function promptHTML(dir) {
  return `<span class="u">${esc(config.user)}@${esc(config.host)}</span><span class="d">:</span><span class="p">${esc(pathLabel(dir))}</span><span class="d">$ </span>`;
}
function newPromptLine() {
  const el = document.createElement('div'); el.className = 'prompt';
  el.innerHTML = promptHTML(cwd) + '<span class="cmd"></span><span class="cursor"></span>';
  screen.appendChild(el); return el;
}
async function typeInto(line, text, my) {
  const out = line.querySelector('.cmd');
  for (const ch of text) {
    if (my !== run) return false;
    out.textContent += ch;
    await sleep(ch === ' ' ? 85 : 38 + Math.random() * 55);
  }
  return my === run;
}
function updateChrome() {
  document.getElementById('title').textContent = `${config.user}@${config.host}: ${pathLabel(cwd)}`;
  document.getElementById('count').textContent = `${idx + 1}/${slides.length}`;
  idleEl.innerHTML = promptHTML(cwd) + '<span class="cursor"></span>';
}

/* ---------- renderers ---------- */
const fade = (html, i) => html.replace('>', ` class="fade" style="--i:${i}">`);
function renderText(s) {
  return '<article class="output text">' + s.items.map((it, i) => {
    if (it.t === 'h1') return fade(`<h1>${inline(it.x)}</h1>`, i);
    if (it.t === 'h2') return fade(`<h2>${inline(it.x)}</h2>`, i);
    if (it.t === 'p')  return fade(`<p>${inline(it.x)}</p>`, i);
    if (it.t === 'ul') return fade(`<ul>${it.items.map(x => `<li>${inline(x)}</li>`).join('')}</ul>`, i);
    return '';
  }).join('') + '</article>';
}
function renderImages(s) {
  const imgs = s.items.filter(i => i.t === 'img').slice(0, 2);          // max two images
  const copy = s.items.filter(i => i.t !== 'img').map((it, i) =>
    it.t === 'h1' ? fade(`<h1>${inline(it.x)}</h1>`, i) : it.t === 'p' ? fade(`<p>${inline(it.x)}</p>`, i) : '').join('');
  const figs = imgs.map((im, i) => `<figure class="fig fade" style="--i:${i + 3}"><div class="frame"><img src="${esc(im.src)}" alt="${esc(im.alt)}"></div>${im.alt ? `<figcaption>${esc(im.alt)}</figcaption>` : ''}</figure>`).join('');
  return `<article class="output images"><div class="copy">${copy}</div><div class="figs n${imgs.length}">${figs}</div></article>`;
}
function renderBig(s) {
  const h1 = s.items.find(i => i.t === 'h1');
  const label = s.items.filter(i => i.t === 'p').map(i => inline(i.x)).join('<br>');
  return `<article class="output big"><div class="num">${inline(h1 ? h1.x : '')}</div><div class="label">${label}</div></article>`;
}
async function renderTree(s, my) {
  // build the directory structure from the topics declared in slides.md
  const entries = [];
  slides.forEach(sl => {
    if (sl.layout !== 'summary' && sl.topic) {
      const name = slug(sl.topic); let d = entries.find(e => e.dir === name);
      if (!d) entries.push(d = { dir: name, label: sl.topic, files: [] });
      d.files.push(sl);
    } else entries.push({ file: sl });
  });
  const lines = [`<span class="dir">${esc(config.root)}/</span>`]; let nd = 0, nf = 0;
  entries.forEach((e, i) => {
    const last = i === entries.length - 1, br = last ? '└── ' : '├── ', pad = last ? '    ' : '│   ';
    if (e.dir) {
      nd++; lines.push(`<span class="br">${br}</span><span class="dir">${esc(e.dir)}/</span>`);
      e.files.forEach((f, j) => { nf++; lines.push(`<span class="br">${pad}${j === e.files.length - 1 ? '└── ' : '├── '}</span><span class="file">${esc(f.file)}</span>  <span class="note">${esc(f.title)}</span>`); });
    } else { nf++; lines.push(`<span class="br">${br}</span><span class="file">${esc(e.file.file)}</span>  <span class="note">${esc(e.file.title)}</span>`); }
  });
  const box = document.createElement('div'); box.className = 'output';
  const pre = document.createElement('div'); pre.className = 'tree'; box.appendChild(pre); screen.appendChild(box);
  for (const l of lines) {
    if (my !== run) return;
    const d = document.createElement('div'); d.className = 'ln'; d.innerHTML = l; pre.appendChild(d); await sleep(70);
  }
  const sum = document.createElement('div'); sum.className = 'ln sum';
  sum.textContent = `${nd} directories, ${nf} files`; pre.appendChild(sum);
}

/* ---------- navigation ---------- */
async function go(n) {
  if (n < 0 || n >= slides.length) return;
  const my = ++run; skip = false; busy = true; idx = n;
  history.replaceState(null, '', '#' + (n + 1));
  screen.innerHTML = ''; updateChrome();
  const s = slides[n];
  for (const c of planCommands(s)) {
    const line = newPromptLine();
    if (!(await typeInto(line, c.cmd, my))) return;
    await sleep(240); if (my !== run) return;
    line.classList.add('done');
    if ('cd' in c) { cwd = c.cd; updateChrome(); await sleep(260); if (my !== run) return; }
  }
  if (s.layout === 'summary') await renderTree(s, my);
  else {
    const html = s.layout === 'big' ? renderBig(s) : s.layout === 'images' ? renderImages(s) : renderText(s);
    screen.insertAdjacentHTML('beforeend', html);
  }
  if (my === run) busy = false;
}
const next = () => busy ? (skip = true) : go(idx + 1);
const prev = () => busy ? (skip = true) : go(idx - 1);

document.addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (busy && !['ArrowLeft', 'PageUp'].includes(e.key)) { skip = true; if (e.key !== 'ArrowRight') return; }
  if (['ArrowRight', 'PageDown', ' ', 'Enter', 'n'].includes(e.key)) { e.preventDefault(); if (!busy) next(); }
  else if (['ArrowLeft', 'PageUp', 'Backspace', 'p'].includes(e.key)) { e.preventDefault(); busy ? go(idx - 1) : prev(); }
  else if (e.key === 'Home') go(0);
  else if (e.key === 'End') go(slides.length - 1);
});
document.getElementById('window').addEventListener('click', () => next());

(async function init() {
  const md = await (await fetch('slides.md', { cache: 'no-store' })).text();
  parseMarkdown(md);
  const start = Math.min(Math.max((parseInt(location.hash.slice(1)) || 1) - 1, 0), slides.length - 1);
  go(start);
})();
