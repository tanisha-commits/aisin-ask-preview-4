/* Preview 4: Global network map + floating enquiry widget. Self-contained; touches no other section. */
(() => {
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= Global network ================= */
  const root = document.querySelector('[data-gn]');
  const DATA = window.GN_DATA;
  if (root && DATA) {
    const { W, H, N } = DATA.map;
    const svg = root.querySelector('[data-gn-svg]');
    const mapEl = root.querySelector('[data-gn-map]');
    const pinLayer = root.querySelector('[data-gn-pins]');
    const popup = root.querySelector('[data-gn-popup]');
    const popupBody = root.querySelector('[data-gn-popup-body]');
    const NS = 'http://www.w3.org/2000/svg';

    // Dot-matrix land (precomputed grid) + solid land shown when zoomed in
    root.querySelector('[data-gn-land]').setAttribute('d', DATA.land);
    const dotsEl = root.querySelector('[data-gn-dots]');
    const renderDots = (k) => {
      const r = (DATA.dots.step * 0.36 / Math.sqrt(k)).toFixed(2); const pts = DATA.dots.pts; let d = '';
      for (let i = 0; i < pts.length; i += 2) { const x = pts[i] / 10, y = pts[i + 1] / 10; d += `M${(x - r).toFixed(1)} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`; }
      dotsEl.setAttribute('d', d);
    };
    renderDots(1);

    const project = (lat, lon) => [((lon + 180) / 360) * W, ((N - lat) / 360) * W];
    const norm = (v) => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const REGION_LABEL = { 'Central and South America': 'Central & South America' };
    const regionLabel = (r) => REGION_LABEL[r] || r;

    // Companies + locations (companies sharing a city share one marker)
    const companies = DATA.companies.map((c, i) => ({ ...c, i, hay: norm([c.n, c.loc, c.a, c.r].join(' ')) }));
    const locMap = new Map();
    companies.forEach((c) => {
      if (c.lat == null) return;
      if (!locMap.has(c.loc)) {
        const [x, y] = project(c.lat, c.lon);
        locMap.set(c.loc, { key: c.loc, x, y, region: c.r, companies: [] });
      }
      const loc = locMap.get(c.loc);
      loc.companies.push(c);
      c.locRef = loc;
    });
    const locations = [...locMap.values()];
    locations.forEach((l) => {
      let near = Infinity;
      locations.forEach((o) => { if (o !== l) near = Math.min(near, Math.hypot(o.x - l.x, o.y - l.y)); });
      l.near = near;
    });
    const regions = [...new Set(companies.map((c) => c.r))];
    const countries = new Set(companies.filter((c) => c.loc).map((c) => c.loc.split(', ').pop()));
    const stat = (k, v) => { const el = root.querySelector(`[data-gn-stat="${k}"]`); if (el) el.textContent = v; };
    stat('companies', companies.length); stat('locations', locations.length); stat('countries', countries.size); stat('regions', regions.length);

    // Count the stats up from 0 the first time they scroll into view
    const statEls = [...root.querySelectorAll('[data-gn-stat]')];
    const runCounter = (el) => {
      const target = +el.textContent; const t0 = performance.now(); const dur = 1600;
      const tick = (now) => { const t = Math.min(1, (now - t0) / dur); el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))); if (t < 1) requestAnimationFrame(tick); };
      el.textContent = '0'; requestAnimationFrame(tick);
    };
    if (!reduceMotion && 'IntersectionObserver' in window && statEls.length) {
      statEls.forEach((el) => { el.dataset.target = el.textContent; el.textContent = '0'; });
      const io = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        statEls.forEach((el) => { el.textContent = el.dataset.target; runCounter(el); });
      }, { threshold: 0.4 });
      io.observe(root.querySelector('.gn-stats'));
    }

    // ---- Pins
    locations.forEach((l, idx) => {
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'gn-pin');
      g.setAttribute('transform', `translate(${l.x.toFixed(2)} ${l.y.toFixed(2)})`);
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'button');
      g.setAttribute('aria-label', `${l.key}: ${l.companies.length} AISIN Group ${l.companies.length === 1 ? 'company' : 'companies'}`);
      g.innerHTML = `<g class="gn-pin-s"><circle class="gn-hit" r="9"></circle><circle class="gn-pulse" r="3.4" style="animation-delay:${((idx * 0.37) % 2.8).toFixed(2)}s"></circle><circle class="gn-ring" r="6.5"></circle><circle class="gn-dot" r="3.4"></circle><text class="gn-label" x="8" y="4.2">${esc(l.key.split(',')[0])}</text></g>`;
      g.addEventListener('click', (e) => { e.stopPropagation(); if (dragMoved) return; select(l.companies[0], { from: 'pin' }); });
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(l.companies[0], { from: 'pin' }); } });
      pinLayer.appendChild(g);
      l.el = g;
    });

    // ---- View (viewBox) handling
    const FULL = { x: 0, y: 0, w: W, h: H };
    let view = { ...FULL };
    let anim = 0;
    let lastDotK = 1;
    const MAX_K = 10;
    const clampView = (v) => {
      const w = Math.min(W, Math.max(W / MAX_K, v.w));
      const h = w * (H / W);
      const x = Math.min(W - w, Math.max(0, v.x));
      const y = Math.min(H - h, Math.max(0, v.y));
      return { x, y, w, h };
    };
    const applyView = (v) => {
      view = v;
      svg.setAttribute('viewBox', `${v.x.toFixed(3)} ${v.y.toFixed(3)} ${v.w.toFixed(3)} ${v.h.toFixed(3)}`);
      const k = W / v.w;
      // markers + labels keep the same on-screen size at any map width (phone or desktop) and zoom
      const ppu0 = (svg.clientWidth || 1000) / W;
      svg.style.setProperty('--gn-s', ((ppu0 < 0.6 ? 0.8 : 1.05) / (k * Math.max(ppu0, 0.2))).toFixed(4));
      if (Math.abs(k - lastDotK) / lastDotK > 0.25 && k <= 2.6) { lastDotK = k; renderDots(k); }
      mapEl.classList.toggle('is-zoomed', k > 1.02);
      mapEl.classList.toggle('is-deep', k > 2.4); // dots fade to solid land when zoomed in
      positionPopup();
      scheduleLabels();
    };
    // ---- City labels: biggest locations first, skip any label that would collide on screen
    let labelTimer = 0;
    function scheduleLabels() { clearTimeout(labelTimer); labelTimer = setTimeout(layoutLabels, 90); }
    const byWeight = [...locations].sort((a, b) => b.companies.length - a.companies.length);
    function layoutLabels() {
      const rect = svg.getBoundingClientRect(); if (!rect.width) return;
      const ppu = rect.width / view.w;
      const visible = locations.filter((l) => !l.el.classList.contains('is-dim'));
      const scr = (l) => ({ x: (l.x - view.x) * ppu, y: (l.y - view.y) * ppu });
      // every visible marker is an obstacle, so labels never cover a pin
      const boxes = visible.map((l) => { const p = scr(l); return { x: p.x - 6, y: p.y - 6, w: 12, h: 12, owner: l }; });
      const overlaps = (b, l) => boxes.some((o) => o.owner !== l && b.x < o.x + o.w && b.x + b.w > o.x && b.y < o.y + o.h && b.y + b.h > o.y);
      const order = active?.locRef ? [active.locRef, ...byWeight.filter((l) => l !== active.locRef)] : byWeight;
      const shown = new Set();
      order.forEach((l) => {
        if (l.el.classList.contains('is-dim')) return;
        const p = scr(l); const text = l.key.split(',')[0];
        const box = { x: p.x + 7, y: p.y - 9, w: text.length * 7.2 + 4, h: 17, owner: l };
        const inView = p.x > 0 && p.y > 8 && box.x + box.w < rect.width - 44 && p.y < rect.height - 4;
        if (inView && (l === active?.locRef || !overlaps(box, l))) { boxes.push(box); shown.add(l); }
      });
      locations.forEach((l) => l.el.classList.toggle('has-label', shown.has(l)));
    }
    window.addEventListener('resize', () => { applyView(view); });

    const animateTo = (target, duration = 700) => {
      target = clampView(target);
      cancelAnimationFrame(anim);
      if (reduceMotion || duration === 0) { applyView(target); return; }
      const from = { ...view };
      const t0 = performance.now();
      const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      // interpolate zoom geometrically for a smooth "fly" feel
      const step = (now) => {
        const t = Math.min(1, (now - t0) / duration);
        const e = ease(t);
        const w = from.w * Math.pow(target.w / from.w, e);
        const cx = from.x + from.w / 2 + (target.x + target.w / 2 - from.x - from.w / 2) * e;
        const cy = from.y + from.h / 2 + (target.y + target.h / 2 - from.y - from.h / 2) * e;
        const h = w * (H / W);
        applyView({ x: cx - w / 2, y: cy - h / 2, w, h });
        if (t < 1) anim = requestAnimationFrame(step);
      };
      anim = requestAnimationFrame(step);
    };
    const viewAround = (x, y, k, offsetY = 0) => {
      const w = W / k; const h = H / k;
      return { x: x - w / 2, y: y - h / 2 - h * offsetY, w, h };
    };
    const fitLocations = (locs) => {
      if (!locs.length) return animateTo(FULL);
      const xs = locs.map((l) => l.x); const ys = locs.map((l) => l.y);
      const pad = 24;
      let x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad, y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
      let w = Math.max(x1 - x0, (y1 - y0) * (W / H), W / 10);
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      animateTo({ x: cx - w / 2, y: cy - (w * H / W) / 2, w, h: w * H / W });
    };
    const zoomBy = (factor, cx = view.x + view.w / 2, cy = view.y + view.h / 2) => {
      const w = Math.min(W, Math.max(W / MAX_K, view.w / factor));
      const h = w * (H / W);
      const rx = (cx - view.x) / view.w, ry = (cy - view.y) / view.h;
      animateTo({ x: cx - rx * w, y: cy - ry * h, w, h }, 420);
    };
    root.querySelectorAll('[data-gn-zoom]').forEach((b) => b.addEventListener('click', () => {
      const a = b.dataset.gnZoom;
      if (a === 'in') zoomBy(2); else if (a === 'out') zoomBy(0.5); else { closePopup(); animateTo(FULL); }
    }));

    // pointer → svg coordinates
    const toSvg = (clientX, clientY) => {
      const pt = svg.createSVGPoint(); pt.x = clientX; pt.y = clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    };
    const toScreen = (x, y) => {
      const pt = svg.createSVGPoint(); pt.x = x; pt.y = y;
      const p = pt.matrixTransform(svg.getScreenCTM());
      const r = mapEl.getBoundingClientRect();
      return { x: p.x - r.left, y: p.y - r.top };
    };

    // drag to pan
    let drag = null; let dragMoved = false;
    svg.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      dragMoved = false;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, view: { ...view }, scale: view.w / svg.getBoundingClientRect().width };
    });
    svg.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!dragMoved && Math.hypot(dx, dy) < 5) return;
      if (W / view.w <= 1.02) return; // nothing to pan at world view
      if (!dragMoved) { dragMoved = true; svg.setPointerCapture(e.pointerId); mapEl.classList.add('is-dragging'); cancelAnimationFrame(anim); }
      applyView(clampView({ ...drag.view, x: drag.view.x - dx * drag.scale, y: drag.view.y - dy * drag.scale }));
    });
    const endDrag = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      mapEl.classList.remove('is-dragging');
      drag = null;
      setTimeout(() => { dragMoved = false; }, 0);
    };
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);
    svg.addEventListener('click', () => { if (!dragMoved) closePopup(); });
    svg.addEventListener('dblclick', (e) => { e.preventDefault(); const p = toSvg(e.clientX, e.clientY); zoomBy(2, p.x, p.y); });
    svg.addEventListener('wheel', (e) => {
      if (!(e.ctrlKey || e.metaKey)) return; // keep normal page scrolling; ctrl/⌘ + wheel (and trackpad pinch) zooms
      e.preventDefault();
      const p = toSvg(e.clientX, e.clientY);
      zoomBy(e.deltaY < 0 ? 1.5 : 1 / 1.5, p.x, p.y);
    }, { passive: false });

    // ---- Selection + popup
    let active = null; // company
    const setActivePin = (loc) => {
      locations.forEach((l) => l.el.classList.toggle('is-active', l === loc));
      if (loc) pinLayer.appendChild(loc.el); // raise above neighbours
    };
    const renderPopup = (c) => {
      const loc = c.locRef;
      const others = loc ? loc.companies.filter((o) => o !== c) : [];
      const url = /^https?:\/\//i.test(c.u) ? c.u : '';
      const host = url ? url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/.*$/, '') : '';
      popupBody.innerHTML = `
        <p class="gn-pop-loc"><i class="fa-solid fa-location-dot" aria-hidden="true"></i><span>${esc(c.loc || regionLabel(c.r) + ' · location not published')}</span></p>
        <h3 id="gn-popup-title">${esc(c.n)}</h3>
        <dl class="gn-pop-dl">
          ${c.a ? `<div><dt>Address</dt><dd>${esc(c.a)}</dd></div>` : ''}
          ${c.b ? `<div><dt>Business</dt><dd class="is-clamped" title="${esc(c.b)}">${esc(c.b)}</dd></div>` : ''}
        </dl>
        ${url ? `<a class="gn-pop-link" href="${esc(url)}" target="_blank" rel="noopener">${esc(host)} <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>` : ''}
        ${others.length ? `<div class="gn-pop-more"><p>Also at this location (${others.length})</p><ul>${others.map((o) => `<li><button type="button" data-gn-company="${o.i}">${esc(o.n)}</button></li>`).join('')}</ul></div>` : ''}`;
      popupBody.querySelectorAll('[data-gn-company]').forEach((b) => b.addEventListener('click', () => select(companies[+b.dataset.gnCompany], { from: 'popup' })));
    };
    function positionPopup() {
      if (popup.hidden || !active) return;
      const loc = active.locRef;
      popup.classList.toggle('is-floating', !loc);
      if (!loc || window.matchMedia('(max-width: 720px)').matches) { popup.style.left = ''; popup.style.top = ''; popupBody.style.maxHeight = ''; delete popup.dataset.place; return; }
      const p = toScreen(loc.x, loc.y);
      const mw = mapEl.clientWidth; const mh = mapEl.clientHeight;
      popupBody.style.maxHeight = `${Math.max(160, mh - 20 - 38)}px`;
      const pw = popup.offsetWidth; const ph = popup.offsetHeight;
      const gap = 18, edge = 10;
      let place = 'above', left = p.x - pw / 2, top = p.y - ph - gap;
      if (top < edge) { place = 'below'; top = p.y + gap; }
      if (place === 'below' && top + ph > mh - edge) {
        place = p.x + gap + pw <= mw - edge || p.x < mw / 2 ? 'right' : 'left';
        left = place === 'right' ? p.x + gap : p.x - gap - pw;
        top = p.y - ph / 2;
      }
      left = Math.min(mw - pw - edge, Math.max(edge, left));
      top = Math.min(mh - ph - edge, Math.max(edge, top));
      popup.dataset.place = place;
      popup.style.left = `${left}px`;
      popup.style.top = `${top}px`;
      if (place === 'above' || place === 'below') popup.style.setProperty('--gn-arrow', `${Math.min(pw - 22, Math.max(22, p.x - left))}px`);
      else popup.style.setProperty('--gn-arrow', `${Math.min(ph - 22, Math.max(22, p.y - top))}px`);
    }
    function closePopup() {
      if (popup.hidden) return;
      popup.hidden = true;
      active = null;
      setActivePin(null);
    }
    function select(c, { from } = {}) {
      active = c;
      renderPopup(c);
      popup.hidden = false;
      setActivePin(c.locRef || null);
      const loc = c.locRef;
      if (loc) {
        const isMobile = window.matchMedia('(max-width: 720px)').matches;
        const currentK = W / view.w;
        let k = Math.min(MAX_K, Math.max(4, 16 / Math.max(loc.near, 1)));
        if (from === 'pin' || from === 'popup') k = Math.max(currentK, Math.min(k, Math.max(currentK, 3)));
        // leave room above the marker for the popup (desktop); on mobile the popup sits below the map
        animateTo(viewAround(loc.x, loc.y, k, isMobile ? 0 : 0.2));
      } else {
        fitLocations(locations.filter((l) => l.region === c.r));
      }
      requestAnimationFrame(positionPopup);
    }
    root.querySelector('[data-gn-popup-close]').addEventListener('click', closePopup);
    popup.addEventListener('pointerdown', (e) => e.stopPropagation());
    window.addEventListener('resize', positionPopup);
    root.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !popup.hidden) { const loc = active?.locRef; closePopup(); loc?.el.focus(); } });

    applyView(FULL);
  }

  /* ================= Enquiry widget ================= */
  const enq = document.querySelector('[data-enq]');
  if (enq) {
    const panel = enq.querySelector('.enq-panel');
    const toggle = enq.querySelector('[data-enq-toggle]');
    const form = enq.querySelector('.enq-form');
    const status = enq.querySelector('.enq-status');
    const setOpen = (open, { focus = true } = {}) => {
      panel.hidden = !open;
      enq.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close enquiry form' : 'Open enquiry form');
      if (open && focus) setTimeout(() => form.querySelector('input')?.focus(), 60);
      if (!open && focus) toggle.focus();
    };
    toggle.addEventListener('click', () => setOpen(panel.hidden));
    enq.querySelector('[data-enq-close]').addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) setOpen(false); });
    document.addEventListener('pointerdown', (e) => { if (!panel.hidden && !enq.contains(e.target)) setOpen(false, { focus: false }); });
    form.addEventListener('input', (e) => { if (e.target.matches('[aria-invalid]')) e.target.removeAttribute('aria-invalid'); });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const invalid = [...form.elements].filter((el) => el.willValidate && !el.checkValidity());
      form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
      if (invalid.length) {
        invalid.forEach((el) => el.setAttribute('aria-invalid', 'true'));
        invalid[0].focus();
        status.textContent = 'Please complete the required fields: name, phone and enquiry type.';
        return;
      }
      status.textContent = 'Preview only: connect the approved AISIN ASK enquiry recipient before launch.';
    });
  }
})();
