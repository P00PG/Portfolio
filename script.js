// Project filters
var buttons = document.querySelectorAll('.filters button');
var cards = document.querySelectorAll('.card');
buttons.forEach(function (btn) {
  btn.addEventListener('click', function () {
    var f = btn.getAttribute('data-filter');
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
    cards.forEach(function (c) {
      var cat = c.getAttribute('data-cat');
      c.hidden = !(f === 'all' || cat === f);
    });
  });
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
  sendBtn.disabled = true;
  sendBtn.textContent = 'Sending...';
  formNote.classList.remove('is-error', 'is-sent');
  formNote.textContent = 'Sending your message...';
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
      botcheck: document.getElementById('botcheck').checked
    })
  })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (!data.success) throw new Error(data.message || 'failed');
      document.getElementById('contact-form').reset();
      sendBtn.textContent = 'Sent!';
      formNote.classList.add('is-sent');
      formNote.textContent = "Yay, message sent! I'll reply within a couple of days.";
      setTimeout(function () { sendBtn.textContent = 'Send message'; sendBtn.disabled = false; }, 4000);
    })
    .catch(function () {
      sendBtn.textContent = 'Send message';
      sendBtn.disabled = false;
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
