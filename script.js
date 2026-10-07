// Project filters (cards bounce in when switching tabs)
var buttons = document.querySelectorAll('.filters button');
var cards = document.querySelectorAll('.card');
var calmMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var filterTimer = null;
buttons.forEach(function (btn) {
  btn.addEventListener('click', function () {
    if (btn.getAttribute('aria-pressed') === 'true') return;
    var f = btn.getAttribute('data-filter');
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });

    function showMatches() {
      var i = 0;
      cards.forEach(function (c) {
        var cat = c.getAttribute('data-cat');
        c.classList.remove('card-out', 'card-in');
        c.hidden = !(f === 'all' || cat === f);
        if (!c.hidden && !calmMotion) {
          void c.offsetWidth;                 // restart the animation
          c.style.animationDelay = (i * 0.08) + 's';
          c.classList.add('card-in');
          i++;
        }
      });
    }
    if (calmMotion) { showMatches(); return; }

    // quick shrink-away for the current cards, then bounce the new ones in
    clearTimeout(filterTimer);
    cards.forEach(function (c) {
      if (!c.hidden) { c.style.animationDelay = '0s'; c.classList.remove('card-in'); c.classList.add('card-out'); }
    });
    filterTimer = setTimeout(showMatches, 180);
  });
});
cards.forEach(function (c) {
  c.addEventListener('animationend', function () { c.classList.remove('card-in'); c.style.animationDelay = ''; });
});

// Contact form: opens the visitor's email app with the message filled in
// Cute custom form checks (replaces the browser's default pop-up)
var formFields = [
  { input: document.getElementById('c-name'), error: document.getElementById('err-name'),
    check: function (v) { return v ? '' : 'Oops! What should I call you?'; } },
  { input: document.getElementById('c-email'), error: document.getElementById('err-email'),
    check: function (v) {
      if (!v) return 'I need your email so I can reply!';
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : "Hmm, that email doesn't look quite right.";
    } },
  { input: document.getElementById('c-msg'), error: document.getElementById('err-msg'),
    check: function (v) { return v ? '' : 'A little project info would help!! hahaha'; } }
];
function showFieldError(f, msg) {
  f.error.textContent = msg;
  f.error.hidden = !msg;
  if (msg) { f.input.setAttribute('aria-invalid', 'true'); } else { f.input.removeAttribute('aria-invalid'); }
}
formFields.forEach(function (f) {
  f.input.addEventListener('input', function () {
    if (f.input.getAttribute('aria-invalid')) showFieldError(f, f.check(f.input.value.trim()));
  });
});

document.getElementById('contact-form').addEventListener('submit', function (e) {
  e.preventDefault();
  var firstBad = null;
  formFields.forEach(function (f) {
    var msg = f.check(f.input.value.trim());
    showFieldError(f, msg);
    if (msg && !firstBad) firstBad = f.input;
  });
  if (firstBad) { firstBad.focus(); return; }
  var name = document.getElementById('c-name').value.trim();
  var email = document.getElementById('c-email').value.trim();
  var msg = document.getElementById('c-msg').value.trim();
  sendMessage(name, email, msg);
});

// ---------- Sending messages straight to Jade's inbox (via Web3Forms) ----------
var WEB3FORMS_KEY = '5ed5688b-c311-4b7f-a608-e68ec8441e45';   // get a free key at web3forms.com
var sendBtn = document.getElementById('send-btn');
var formNote = document.getElementById('form-note');

function sendMessage(name, email, msg) {
  // no key yet? fall back to opening the visitor's email app
  if (WEB3FORMS_KEY.indexOf('PASTE') === 0) {
    var body = msg + '\n\nFrom: ' + name + '\nEmail: ' + email;
    window.location.href = 'mailto:jadeng444@gmail.com?subject=' + encodeURIComponent('Website enquiry from ' + name) + '&body=' + encodeURIComponent(body);
    return;
  }
  // hide the form and show the "sent" message straight away, then send quietly in the background
  var form = document.getElementById('contact-form');
  var isBot = document.getElementById('botcheck').checked;
  form.reset();
  formNote.classList.remove('is-error');
  formNote.textContent = '';
  form.classList.add('is-sent');
  document.getElementById('sent-title').focus();
  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject: 'New website enquiry from ' + name,
      from_name: 'Jade portfolio site',
      name: name,
      email: email,
      message: msg,
      botcheck: isBot
    })
  })
    .then(function (res) { return res.json(); })
    .then(function (data) { if (!data.success) throw new Error(data.message || 'failed'); })
    .catch(function () {
      // bring the form back with their words, so nothing is lost
      document.getElementById('contact-form').classList.remove('is-sent');
      document.getElementById('c-name').value = name;
      document.getElementById('c-email').value = email;
      document.getElementById('c-msg').value = msg;
      formNote.classList.remove('is-sent');
      formNote.classList.add('is-error');
      formNote.innerHTML = 'Oh no, that didn\'t go through. Please try again, or email me at <a href="mailto:jadeng444@gmail.com">jadeng444@gmail.com</a>.';
    });
}

document.getElementById('year').textContent = new Date().getFullYear();

// Fade sections in as they scroll into view
var revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(function (el) { observer.observe(el); });
} else {
  revealEls.forEach(function (el) { el.classList.add('is-visible'); });
}

// Swap in project screenshots when the image files exist
document.querySelectorAll('.shot').forEach(function (img) {
  var mini = img.closest('.mini');
  function show() { if (img.naturalWidth > 0) mini.classList.add('has-shot'); }
  if (img.complete) { show(); } else { img.addEventListener('load', show); }
  img.addEventListener('error', function () { img.remove(); });
});

// Bunny chat button: pops up after a moment, opens WhatsApp / Telegram options
var bunny = document.getElementById('bunny');
var bunnyBtn = document.getElementById('bunny-btn');
var bunnyMenu = document.getElementById('bunny-menu');
setTimeout(function () { bunny.classList.add('is-in'); }, 1200);

function setBunny(open) {
  bunnyMenu.hidden = !open;
  bunnyBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
}
bunnyBtn.addEventListener('click', function (e) {
  e.stopPropagation();
  setBunny(bunnyMenu.hidden);
});
document.addEventListener('click', function (e) {
  if (!bunny.contains(e.target)) setBunny(false);
});
bunny.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') { setBunny(false); bunnyBtn.focus(); }
});

// Scroll progress bar
var progressBar = document.getElementById('progress-bar');
var ticking = false;
function updateProgress() {
  var max = document.documentElement.scrollHeight - window.innerHeight;
  var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
  progressBar.style.width = pct + '%';
  ticking = false;
}
window.addEventListener('scroll', function () {
  if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
}, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();

// Twinkling stars for night mode
var starBox = document.getElementById('stars');
for (var i = 0; i < 50; i++) {
  var s = document.createElement('span');
  var size = 2 + Math.random() * 3;
  s.className = 'star';
  s.style.width = size + 'px';
  s.style.height = size + 'px';
  s.style.top = (Math.random() * 100) + '%';
  s.style.left = (Math.random() * 100) + '%';
  s.style.animationDelay = (-Math.random() * 3) + 's';
  s.style.animationDuration = (2 + Math.random() * 3) + 's';
  starBox.appendChild(s);
}

// Night mode toggle (remembers the visitor's choice)
var themeBtn = document.getElementById('theme-toggle');
function applyTheme(dark) {
  if (dark) { document.documentElement.setAttribute('data-theme', 'dark'); }
  else { document.documentElement.removeAttribute('data-theme'); }
  themeBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
  try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
}
themeBtn.setAttribute('aria-pressed', document.documentElement.getAttribute('data-theme') === 'dark' ? 'true' : 'false');
themeBtn.addEventListener('click', function () {
  applyTheme(document.documentElement.getAttribute('data-theme') !== 'dark');
});

// ---------- Sticker sounds (Jade's own recordings in /sounds) ----------
var soundOn = true;
try { soundOn = localStorage.getItem('stickerSound') !== 'off'; } catch (e) {}
var pasteSound = new Audio('sounds/paste.mp3');
pasteSound.preload = 'auto';
function playSound(base) {
  if (!soundOn) return;
  var s = base.cloneNode();   // a fresh copy so quick drags can overlap
  s.volume = 0.8;
  var p = s.play();
  if (p && p.catch) p.catch(function () {});
}
function playPeel() {}  // peel sound removed; only the paste sound plays
function playThump() { playSound(pasteSound); }
var soundBtn = document.getElementById('sound-btn');
soundBtn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
soundBtn.addEventListener('click', function () {
  soundOn = !soundOn;
  soundBtn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
  try { localStorage.setItem('stickerSound', soundOn ? 'on' : 'off'); } catch (e) {}
});

// ---------- Sticker journal ----------
var STICKERS = {
  heart: '<path d="M24 42s-15-9-19-18C2.4 17.6 6.4 10 13.2 10c4.2 0 7.2 2.4 8.8 5.2.4.6 1.6.6 2 0C25.6 12.4 28.6 10 32.8 10 39.6 10 43.6 17.6 41 24 37 33 24 42 24 42z" fill="#FF9EC0"/><ellipse cx="13" cy="18" rx="3" ry="4.5" fill="#FFFFFF" opacity="0.7" transform="rotate(-30 13 18)"/>',
  star: '<polygon points="24,5 29.5,17.5 43,18.5 32.6,27.4 36,41 24,33.8 12,41 15.4,27.4 5,18.5 18.5,17.5" fill="#FFD67A" stroke="#FFD67A" stroke-width="4" stroke-linejoin="round"/><circle cx="20" cy="24" r="1.8" fill="#3B2E5A"/><circle cx="28" cy="24" r="1.8" fill="#3B2E5A"/><path d="M21.5 28q2.5 2.5 5 0" fill="none" stroke="#3B2E5A" stroke-width="1.8" stroke-linecap="round"/>',
  boba: '<rect x="25" y="2" width="5" height="16" rx="2.5" fill="#FF9EC0" transform="rotate(14 27 10)"/><path d="M11 16h26l-3 25.5A3 3 0 0 1 31 44H17a3 3 0 0 1-3-2.5z" fill="#E3B58A"/><rect x="9" y="13" width="30" height="5" rx="2.5" fill="#FFFFFF"/><circle cx="19" cy="38" r="2.4" fill="#3B2E5A"/><circle cx="25" cy="39.5" r="2.4" fill="#3B2E5A"/><circle cx="30" cy="37" r="2.4" fill="#3B2E5A"/><circle cx="21.5" cy="33.5" r="2.4" fill="#3B2E5A"/><circle cx="27.5" cy="33" r="2.4" fill="#3B2E5A"/><circle cx="20" cy="25" r="1.5" fill="#3B2E5A"/><circle cx="28" cy="25" r="1.5" fill="#3B2E5A"/><path d="M22.5 27.5q1.5 1.5 3 0" fill="none" stroke="#3B2E5A" stroke-width="1.5" stroke-linecap="round"/>',
  bunny: '<ellipse cx="17" cy="14" rx="5.5" ry="12" fill="#FFFFFF" stroke="#3B2E5A" stroke-width="2"/><ellipse cx="17" cy="15" rx="2.4" ry="7.5" fill="#FFD6E5"/><ellipse cx="31" cy="14" rx="5.5" ry="12" fill="#FFFFFF" stroke="#3B2E5A" stroke-width="2" transform="rotate(12 31 24)"/><ellipse cx="31" cy="15" rx="2.4" ry="7.5" fill="#FFD6E5" transform="rotate(12 31 24)"/><ellipse cx="24" cy="32" rx="16" ry="13" fill="#FFFFFF" stroke="#3B2E5A" stroke-width="2"/><circle cx="18.5" cy="31" r="2" fill="#3B2E5A"/><circle cx="29.5" cy="31" r="2" fill="#3B2E5A"/><ellipse cx="14.5" cy="35.5" rx="2.8" ry="1.7" fill="#FFB8D2"/><ellipse cx="33.5" cy="35.5" rx="2.8" ry="1.7" fill="#FFB8D2"/><path d="M22.5 34h3l-1.5 1.6z" fill="#FF9EC0"/>',
  flower: '<g fill="#FFB8D2"><circle cx="24" cy="12" r="8"/><circle cx="35.4" cy="20.3" r="8"/><circle cx="31" cy="33.7" r="8"/><circle cx="17" cy="33.7" r="8"/><circle cx="12.6" cy="20.3" r="8"/></g><circle cx="24" cy="24" r="7" fill="#FFD67A"/><circle cx="21.5" cy="23" r="1.2" fill="#3B2E5A"/><circle cx="26.5" cy="23" r="1.2" fill="#3B2E5A"/><path d="M22.5 26q1.5 1.3 3 0" fill="none" stroke="#3B2E5A" stroke-width="1.3" stroke-linecap="round"/>',
  cloud: '<path d="M13 37h23a8 8 0 0 0 1.2-15.9A11 11 0 0 0 16 19a9 9 0 0 0-3 18z" fill="#BFE0FF"/><circle cx="20" cy="28" r="1.8" fill="#3B2E5A"/><circle cx="29" cy="28" r="1.8" fill="#3B2E5A"/><path d="M22.5 31q2 2 4 0" fill="none" stroke="#3B2E5A" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="17" cy="31" rx="2.2" ry="1.3" fill="#FFB8D2"/><ellipse cx="32" cy="31" rx="2.2" ry="1.3" fill="#FFB8D2"/>',
  cherry: '<path d="M16 30C18 18 24 10 32 6M32 30c-1-10 0-18 0-24" fill="none" stroke="#5DBB8A" stroke-width="2.5" stroke-linecap="round"/><path d="M32 6c4-3 9-2 11 1-4 3-8 3-11-1z" fill="#8FDDB8"/><circle cx="15" cy="34" r="8.5" fill="#FF7A9A"/><circle cx="32" cy="35" r="8.5" fill="#FF7A9A"/><ellipse cx="12" cy="31" rx="2" ry="3" fill="#FFFFFF" opacity="0.7"/><ellipse cx="29" cy="32" rx="2" ry="3" fill="#FFFFFF" opacity="0.7"/>',
  rainbow: '<g fill="none" stroke-linecap="round" stroke-width="5"><path d="M7 34a17 17 0 0 1 34 0" stroke="#FF9EC0"/><path d="M13 34a11 11 0 0 1 22 0" stroke="#FFD67A"/><path d="M19 34a5 5 0 0 1 10 0" stroke="#8FDDB8"/></g><circle cx="7" cy="37" r="5" fill="#FFFFFF"/><circle cx="12" cy="38" r="4" fill="#FFFFFF"/><circle cx="41" cy="37" r="5" fill="#FFFFFF"/><circle cx="36" cy="38" r="4" fill="#FFFFFF"/>'
};

var stickerSection = document.querySelector('.currently');
var stickerLayer = document.getElementById('sticker-layer');
var sheet = document.getElementById('sticker-sheet');
var sheetGrid = document.getElementById('sheet-grid');
var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var placedStickers = [];

function stickerSvg(type) {
  return '<svg class="sticker-svg" viewBox="0 0 48 48" aria-hidden="true">' + STICKERS[type] + '</svg>';
}
function saveStickers() {
  try { localStorage.setItem('stickers', JSON.stringify(placedStickers.map(function (s) { return s.data; }))); } catch (e) {}
}
function overSheet(x, y) {
  var r = sheet.getBoundingClientRect();
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}
function sizeOf(el) { return el.offsetWidth || 68; }

// position a sticker element from its stored percentages
function positionSticker(item) {
  var w = stickerSection.clientWidth, h = stickerSection.clientHeight, s = sizeOf(item.el);
  item.el.style.left = Math.max(0, Math.min(w - s, item.data.x * w - s / 2)) + 'px';
  item.el.style.top = Math.max(0, Math.min(h - s, item.data.y * h - s / 2)) + 'px';
}

function moveTo(item, clientX, clientY) {
  var rect = stickerSection.getBoundingClientRect();
  item.data.x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  item.data.y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
  positionSticker(item);
}

function peel(item) {
  placedStickers = placedStickers.filter(function (s) { return s !== item; });
  saveStickers();
  if (reduceMotion) { item.el.remove(); return; }
  item.el.classList.add('peeling');
  item.el.addEventListener('animationend', function () { item.el.remove(); });
}

function makeSticker(data) {
  var el = document.createElement('div');
  el.className = 'placed';
  el.style.setProperty('--r', data.r + 'deg');
  el.innerHTML = stickerSvg(data.type);
  stickerLayer.appendChild(el);
  var item = { el: el, data: data };
  placedStickers.push(item);
  if (placedStickers.length > 40) peel(placedStickers[0]);
  positionSticker(item);
  enableDrag(item);
  return item;
}

function enableDrag(item) {
  item.el.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    item.el.setPointerCapture(e.pointerId);
    item.el.classList.add('dragging');
    playPeel();
    function move(ev) {
      moveTo(item, ev.clientX, ev.clientY);
      sheet.classList.toggle('drop-target', overSheet(ev.clientX, ev.clientY));
    }
    function up(ev) {
      item.el.classList.remove('dragging');
      sheet.classList.remove('drop-target');
      item.el.removeEventListener('pointermove', move);
      item.el.removeEventListener('pointerup', up);
      item.el.removeEventListener('pointercancel', up);
      if (overSheet(ev.clientX, ev.clientY)) { peel(item); } else { playThump(); saveStickers(); }
    }
    item.el.addEventListener('pointermove', move);
    item.el.addEventListener('pointerup', up);
    item.el.addEventListener('pointercancel', up);
  });
}

// random spot around the note, used when tapping or using the keyboard
function addAtRandomSpot(type) {
  var note = document.querySelector('.note').getBoundingClientRect();
  var x = note.left + note.width * (0.05 + Math.random() * 0.9);
  var y = note.top + note.height * (Math.random() < 0.5 ? Math.random() * 0.25 : 0.75 + Math.random() * 0.3);
  var item = makeSticker({ type: type, x: 0, y: 0, r: Math.round(Math.random() * 30 - 15) });
  moveTo(item, x, y);
  saveStickers();
  playThump();
}

Object.keys(STICKERS).forEach(function (type) {
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'sheet-sticker';
  btn.setAttribute('aria-label', 'Add a ' + type + ' sticker');
  btn.innerHTML = stickerSvg(type);
  sheetGrid.appendChild(btn);

  btn.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    btn.setPointerCapture(e.pointerId);
    var startX = e.clientX, startY = e.clientY, item = null;
    function move(ev) {
      if (!item && Math.hypot(ev.clientX - startX, ev.clientY - startY) > 6) {
        item = makeSticker({ type: type, x: 0, y: 0, r: Math.round(Math.random() * 30 - 15) });
        item.el.classList.add('dragging');
        playPeel();
      }
      if (item) moveTo(item, ev.clientX, ev.clientY);
    }
    function up(ev) {
      btn.removeEventListener('pointermove', move);
      btn.removeEventListener('pointerup', up);
      btn.removeEventListener('pointercancel', up);
      if (!item) { addAtRandomSpot(type); return; }
      item.el.classList.remove('dragging');
      if (overSheet(ev.clientX, ev.clientY)) { peel(item); } else { playThump(); saveStickers(); }
    }
    btn.addEventListener('pointermove', move);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
  });
  // keyboard: Enter or Space adds a sticker
  btn.addEventListener('click', function (e) { if (e.detail === 0) addAtRandomSpot(type); });
});

document.getElementById('peel-all').addEventListener('click', function () {
  placedStickers.slice().forEach(peel);
});

// bring back this visitor's stickers from last time
try {
  var savedStickers = JSON.parse(localStorage.getItem('stickers') || '[]');
  savedStickers.forEach(function (d) { if (STICKERS[d.type]) makeSticker(d); });
} catch (e) {}
window.addEventListener('resize', function () { placedStickers.forEach(positionSticker); });
window.addEventListener('load', function () { placedStickers.forEach(positionSticker); });

// ---------- Soft background music ----------
var MUSIC_VOLUME = 0.1;   // the file itself is already softened; lower this number for quieter music
var music = new Audio('sounds/bg-music.mp3');
music.loop = true;
music.preload = 'auto';
music.volume = 0;
var musicBtn = document.getElementById('music-toggle');
var musicWanted = true;
try { musicWanted = localStorage.getItem('music') !== 'off'; } catch (e) {}

function fadeMusicIn() {
  music.volume = 0;
  var v = 0;
  var fade = setInterval(function () {
    v = Math.min(MUSIC_VOLUME, v + MUSIC_VOLUME / 20);
    music.volume = v;
    if (v >= MUSIC_VOLUME) clearInterval(fade);
  }, 100);
}
function startMusic() {
  var p = music.play();
  if (p && p.then) { p.then(fadeMusicIn).catch(function () {}); } else { fadeMusicIn(); }
}
music.addEventListener('play', function () { musicBtn.setAttribute('aria-pressed', 'true'); });
music.addEventListener('pause', function () { musicBtn.setAttribute('aria-pressed', 'false'); });

musicBtn.addEventListener('click', function () {
  if (music.paused) { musicWanted = true; startMusic(); }
  else { musicWanted = false; music.pause(); }
  try { localStorage.setItem('music', musicWanted ? 'on' : 'off'); } catch (e) {}
});

// Browsers block sound until the visitor interacts, so try now and again on their first tap or key press
function firstInteraction(e) {
  if (e.target.closest && e.target.closest('#music-toggle')) return;
  document.removeEventListener('pointerdown', firstInteraction);
  document.removeEventListener('keydown', firstInteraction);
  if (musicWanted && music.paused) startMusic();
}
if (musicWanted) {
  startMusic();
  document.addEventListener('pointerdown', firstInteraction);
  document.addEventListener('keydown', firstInteraction);
}

document.getElementById('send-another').addEventListener('click', function () {
  document.getElementById('contact-form').classList.remove('is-sent');
  formNote.classList.remove('is-sent', 'is-error');
  formNote.textContent = '';
  document.getElementById('c-name').focus();
});

// ---------- Autumn leaves drifting across the white sections ----------
var LEAF_SHAPES = [
  // oak leaf
  '<svg viewBox="0 0 40 24"><path d="M3 12C5 7 9 9 10 6c2-3 5 0 7-2 3-2 5 2 8 1s4 3 7 3 4 3 5 4c-1 1-2 4-5 4s-4 4-7 3-5 3-8 1-5 1-7-2c-1-3-5-1-7-6z" fill="#D98C95" stroke="#7A4A55" stroke-width="0.9" stroke-linejoin="round"/><path d="M1 12h35" stroke="#7A4A55" stroke-width="0.9" stroke-linecap="round"/></svg>',
  // simple oval leaf
  '<svg viewBox="0 0 40 24"><path d="M4 12C10 3 28 3 36 12 28 21 10 21 4 12z" fill="#F2A984" stroke="#9A5E44" stroke-width="0.9"/><path d="M2 12h32" stroke="#9A5E44" stroke-width="0.9" stroke-linecap="round"/></svg>'
];
// a wavy path across the page: each leaf gets its own ups and downs and an overall rise or fall
function wavyPath(w, h) {
  var r = function (n) { return Math.round(n * 10) / 10; };
  var rnd = function (lo, hi) { return lo + Math.random() * (hi - lo); };
  var A1 = rnd(15, 110), f1 = rnd(0.5, 2.6), p1 = rnd(0, 6.28);
  var A2 = rnd(4, 30), f2 = rnd(2.5, 6), p2 = rnd(0, 6.28);
  var A3 = rnd(0, 14), f3 = rnd(6, 10), p3 = rnd(0, 6.28);
  var slope = rnd(-170, 170), mid = h * rnd(0.3, 0.7);
  var pts = [], n = 70, i;
  for (i = 0; i <= n; i++) {
    var t = i / n;
    var y = mid + slope * (t - 0.5) + A1 * Math.sin(6.283 * f1 * t + p1) +
      A2 * Math.sin(6.283 * f2 * t + p2) + A3 * Math.sin(6.283 * f3 * t + p3);
    pts.push([-80 + (w + 160) * t, Math.max(15, Math.min(h - 15, y))]);
  }
  var d = 'M ' + r(pts[0][0]) + ' ' + r(pts[0][1]);
  for (i = 0; i < n; i++) {
    var a0 = pts[Math.max(i - 1, 0)], a1 = pts[i], a2 = pts[i + 1], a3 = pts[Math.min(i + 2, n)];
    d += ' C ' + r(a1[0] + (a2[0] - a0[0]) / 6) + ' ' + r(a1[1] + (a2[1] - a0[1]) / 6) + ', ' +
      r(a2[0] - (a3[0] - a1[0]) / 6) + ' ' + r(a2[1] - (a3[1] - a1[1]) / 6) + ', ' + r(a2[0]) + ' ' + r(a2[1]);
  }
  return d;
}

(function () {
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canFly = 'offsetPath' in document.body.style && !!Element.prototype.animate;
  document.querySelectorAll('.drift[data-leaves]').forEach(function (layer) {
    var n = parseInt(layer.getAttribute('data-leaves'), 10) || 3;
    for (var i = 0; i < n; i++) {
      var box = document.createElement('div');
      box.className = 'wave-box';
      var leaf = document.createElement('div');
      leaf.className = 'wave-leaf';
      box.appendChild(leaf);
      layer.appendChild(box);
      if (!calm && canFly) trip(box, leaf, true);
    }
  });

  // one trip across the page with a fresh random route, then pick a new one
  function trip(box, leaf, first) {
    box.style.top = (Math.random() * 60) + '%';
    leaf.style.setProperty('--spin', (0.9 + Math.random() * 2.2) + 's');
    leaf.style.setProperty('--size', (16 + Math.random() * 22) + 'px');
    leaf.innerHTML = '<div class="spin">' + LEAF_SHAPES[Math.floor(Math.random() * LEAF_SHAPES.length)] + '</div>';
    leaf.style.offsetPath = 'path("' + wavyPath(box.clientWidth || 1200, box.clientHeight || 360) + '")';
    var dur = 8000 + Math.random() * 12000;                 // 8 to 20 seconds per trip
    var anim = leaf.animate([{ offsetDistance: '0%' }, { offsetDistance: '100%' }],
      { duration: dur, easing: Math.random() < 0.5 ? 'linear' : 'cubic-bezier(0.3, 0.1, 0.7, 0.9)', fill: 'both',
        delay: first ? 0 : Math.random() * 4000 });            // little random pause between trips
    if (first) anim.currentTime = Math.random() * dur;        // start somewhere mid-trip so they're spread out
    anim.onfinish = function () { trip(box, leaf, false); };
  }
})();

// ---------- Now and then, a single leaf gets blown in with a big, flowy swirl ----------
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var layers = document.querySelectorAll('.drift[data-leaves]');
  if (!layers.length || !('offsetPath' in document.body.style) || !Element.prototype.animate) return;
  var r = function (n) { return Math.round(n * 10) / 10; };

  // a gentle wave across the page with one big round loop: the loop is built like a
  // rolling circle, so the path flows smoothly in and out of it
  function swirlPlan(w) {
    var rnd = function (lo, hi) { return lo + Math.random() * (hi - lo); };
    var small = w < 700;
    var loops = (!small && Math.random() < 0.35) ? 2 : 1;      // sometimes a double loop
    var up = Math.random() < 0.6 ? -1 : 1;
    var ly = up < 0 ? 350 : 80;
    var v = w + 160;
    var wins = [], x = w * rnd(0.15, loops === 2 ? 0.3 : 0.6);
    for (var L = 0; L < loops; L++) {
      var R = (small ? 65 : 120) * rnd(0.6, 1.25) * (L ? 0.75 : 1);
      var dir = up;
      var t0 = (x + 70) / v, dt = (R * 1.05) / v;
      wins.push({ t0: t0, dt: dt, R: R, up: dir });
      x += R * 2.4 + w * rnd(0.08, 0.2);
    }
    var amp = rnd(12, 48), ph = Math.random(), freq = rnd(0.6, 2.2), slope = rnd(-70, 70);
    var ts = [], i, k;
    for (i = 0; i <= 160; i++) {
      var tt = i / 160, inside = false;
      wins.forEach(function (wn) { if (tt > wn.t0 && tt < wn.t0 + wn.dt) inside = true; });
      if (!inside) ts.push(tt);
    }
    wins.forEach(function (wn) { for (var q = 0; q <= 48; q++) ts.push(wn.t0 + wn.dt * q / 48); });
    ts.sort(function (p, q) { return p - q; });
    var pts = ts.map(function (t) {
      var px = -70 + v * t, py = ly + slope * (t - wins[0].t0) + amp * Math.sin(2 * Math.PI * (t * freq + ph));
      wins.forEach(function (wn) {
        if (t > wn.t0 && t < wn.t0 + wn.dt) {
          var f = 2 * Math.PI * (t - wn.t0) / wn.dt;
          px += wn.R * Math.sin(f);
          py += wn.up * wn.R * (1 - Math.cos(f));
        }
      });
      return [px, py, t];
    });
    var d = 'M ' + r(pts[0][0]) + ' ' + r(pts[0][1]), len = 0;
    var marks = wins.map(function () { return [0, 0]; });
    for (i = 0; i < pts.length - 1; i++) {
      var p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, pts.length - 1)];
      d += ' C ' + r(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + r(p1[1] + (p2[1] - p0[1]) / 6) + ', ' +
        r(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + r(p2[1] - (p3[1] - p1[1]) / 6) + ', ' + r(p2[0]) + ' ' + r(p2[1]);
      len += Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
      for (k = 0; k < wins.length; k++) {
        if (p2[2] <= wins[k].t0) marks[k][0] = len;
        if (p2[2] <= wins[k].t0 + wins[k].dt) marks[k][1] = len;
      }
    }
    return { d: d, loops: marks.map(function (m) { return [m[0] / len, m[1] / len]; }) };
  }

  function spawnSwirl() {
    {
      var layer = layers[Math.floor(Math.random() * layers.length)];
      var box = document.createElement('div');
      box.className = 'swirl-box';
      box.style.top = Math.max(0, Math.random() * (layer.clientHeight - 440)) + 'px';
      var leaf = document.createElement('div');
      leaf.className = 'swirl-leaf';
      leaf.style.setProperty('--size', (16 + Math.random() * 20) + 'px');
      leaf.style.setProperty('--spin', (0.6 + Math.random() * 1.2) + 's');
      leaf.innerHTML = '<div class="spin">' + LEAF_SHAPES[Math.floor(Math.random() * LEAF_SHAPES.length)] + '</div>';
      box.appendChild(leaf);
      layer.appendChild(box);
      var plan = swirlPlan(box.clientWidth || layer.clientWidth);
      leaf.style.offsetPath = 'path("' + plan.d + '")';
      // smooth speed: cruising in, easing a little slower around the loop, cruising out (never stopping)
      var frames = [], steps = 50, tAcc = 0, times = [0];
      for (var k = 1; k <= steps; k++) {
        var s = (k - 0.5) / steps, dip = 0;
        plan.loops.forEach(function (lp) {
          var mid = (lp[0] + lp[1]) / 2, half = (lp[1] - lp[0]) / 2 + 0.05, z = (s - mid) / half;
          dip = Math.max(dip, Math.exp(-z * z * 1.6));
        });
        var speed = 1 - 0.45 * dip;                           // dips gently around each loop, never to zero
        tAcc += (1 / steps) / speed;
        times.push(tAcc);
      }
      for (k = 0; k <= steps; k++) {
        frames.push({ offsetDistance: (k / steps * 100).toFixed(2) + '%', offset: times[k] / tAcc });
      }
      var anim = leaf.animate(frames, { duration: (3600 + Math.random() * 2600) * (plan.loops.length > 1 ? 1.25 : 1), easing: 'linear', fill: 'forwards' });
      anim.onfinish = function () { box.remove(); };
    }
  }
  function blowOne() {
    if (!document.hidden) {
      spawnSwirl();
      if (Math.random() < 0.25) setTimeout(spawnSwirl, 200 + Math.random() * 700);   // sometimes a pair
    }
    setTimeout(blowOne, 2500 + Math.random() * 9000);   // next one in 2.5 to 11.5 seconds
  }
  setTimeout(blowOne, 1500 + Math.random() * 3000);
})();
