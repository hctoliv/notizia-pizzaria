(() => {
  const WA = '5511992468807';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const range = (p, a, b) => clamp((p - a) / (b - a));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wa = msg => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;

  /* ---------- WhatsApp ---------- */
  $$('.js-reserva').forEach(a => a.href = wa('Olá! Vim pelo site e quero reservar uma mesa na Notizia.'));

  /* ---------- data e status (horário de São Paulo) ---------- */
  const spNow = () => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', hourCycle: 'h23', minute: 'numeric' }).formatToParts(new Date()).map(x => [x.type, x.value]));
    return { dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), h: +p.hour, m: +p.minute };
  };
  const dateLong = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  const dateShort = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());
  $$('.js-date').forEach(el => el.textContent = dateLong);
  $$('.js-date-short').forEach(el => el.textContent = dateShort);
  $$('.js-year').forEach(el => el.textContent = new Date().getFullYear());

  function status() {
    const { dow, h } = spNow();
    let open = false, txt;
    if (dow === 1) txt = 'Folga hoje · volta terça, 18h';
    else if (h >= 18) { open = true; txt = 'Forno aceso · até 00h'; }
    else txt = 'Abre hoje às 18h';
    $$('.js-status').forEach(el => { el.classList.toggle('is-open', open); el.querySelector('em').textContent = txt; });
    return { open, txt };
  }
  const st = status();
  setInterval(status, 60000);

  /* ---------- ticker ---------- */
  const tickItems = [
    st.txt,
    'A verdadeira pizza napoletana',
    'Pizzas assadas em forno a 430 gradi',
    'Rua Tabapuã, 838, casa 5 · Itaim Bibi',
    'Terça a domingo, das 18h à meia-noite',
    'Eventos corporativos, sociais e fechados',
    'Também no iFood',
  ];
  const tk = $('.js-ticker');
  tk.innerHTML = [...tickItems, ...tickItems].map(t => `<span>${t}</span>`).join('');

  /* ---------- intro: o jornal girando ---------- */
  const root = document.documentElement;
  const qs = new URLSearchParams(location.search);
  let seen = false;
  try { seen = sessionStorage.getItem('nz-intro') === '1'; } catch (e) {}
  if (!reduce && (!seen || qs.has('intro'))) {
    root.classList.add('intro-on');
    const end = () => {
      if (!root.classList.contains('intro-on') || root.classList.contains('intro-out')) return;
      root.classList.add('intro-out');
      setTimeout(() => root.classList.remove('intro-on', 'intro-out'), 700);
      try { sessionStorage.setItem('nz-intro', '1'); } catch (e) {}
    };
    const t = setTimeout(end, 2500);
    $('#intro').addEventListener('click', () => { clearTimeout(t); end(); });
    addEventListener('keydown', () => { clearTimeout(t); end(); }, { once: true });
  }

  /* ---------- menu mobile ---------- */
  const hd = $('#hd'), burger = $('#burger');
  burger.addEventListener('click', () => {
    const on = !hd.classList.contains('menu-open');
    hd.classList.toggle('menu-open', on);
    burger.setAttribute('aria-expanded', on);
    document.body.style.overflow = on ? 'hidden' : '';
  });
  $$('#nav a').forEach(a => a.addEventListener('click', () => {
    hd.classList.remove('menu-open'); burger.setAttribute('aria-expanded', false); document.body.style.overflow = '';
  }));

  /* ---------- varal de luzes (SVG) ---------- */
  const bulbsBox = $('#bulbs');
  (() => {
    const W = 1000, H = 300, strands = [[-20, 30, 1020, 60, 150], [-20, 110, 1020, 80, 210], [-20, 170, 1020, 190, 270]];
    let svg = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">`;
    strands.forEach(([x1, y1, x2, y2, sag]) => {
      svg += `<path d="M${x1} ${y1} Q500 ${sag} ${x2} ${y2}" fill="none" stroke="rgba(30,25,20,.85)" stroke-width="1.6" vector-effect="non-scaling-stroke"/>`;
      for (let i = 1; i < 15; i++) {
        const t = i / 15, x = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * 500 + t * t * x2, y = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * sag + t * t * y2;
        svg += `<ellipse class="bulb" cx="${x.toFixed(1)}" cy="${(y + 9).toFixed(1)}" rx="4.5" ry="7"/>`;
      }
    });
    bulbsBox.innerHTML = svg + '</svg>';
  })();
  const bulbs = $$('.bulb', bulbsBox).sort(() => Math.random() - .5);

  /* ---------- capa: foto principal vira a tela ---------- */
  const capa = $('#capa'), lead = $('#lead'), slot = $('#leadSlot'), front = $('.front'), leadImg = $('.lead-img'), leadVid = $('.lead-vid'), leadOver = $('.lead-over'), leadCap = $('.lead-cap');
  let slotR = null;
  function measure() {
    const s = slot.getBoundingClientRect(), stage = $('.capa-stage').getBoundingClientRect();
    slotR = { x: s.left - stage.left, y: s.top - stage.top, w: s.width, h: s.height };
  }

  /* ---------- forno: brasas ---------- */
  const cv = $('#embers'), cx = cv.getContext('2d');
  let parts = [], heat = 0, fornoOn = false;
  function sizeCv() { cv.width = cv.offsetWidth * Math.min(devicePixelRatio, 1.5); cv.height = cv.offsetHeight * Math.min(devicePixelRatio, 1.5); }
  function embers() {
    if (!fornoOn) return;
    const w = cv.width, h = cv.height;
    cx.clearRect(0, 0, w, h);
    const want = Math.round(20 + heat * 140);
    while (parts.length < want) parts.push({ x: Math.random() * w, y: h + Math.random() * h * .3, v: .6 + Math.random() * 2.2, r: .6 + Math.random() * 2.4, d: Math.random() * 6.28, l: 1 });
    cx.globalCompositeOperation = 'lighter';
    parts = parts.filter(p => {
      p.y -= p.v * (1 + heat * 1.5); p.d += .03; p.x += Math.sin(p.d) * .7; p.l -= .0035 + (1 - heat) * .004;
      const a = clamp(p.l) * (.35 + heat * .65);
      cx.fillStyle = `rgba(255,${120 + (p.r * 30 | 0)},50,${a})`;
      cx.beginPath(); cx.arc(p.x, p.y, p.r * (window.devicePixelRatio > 1 ? 1.4 : 1), 0, 6.28); cx.fill();
      return p.l > 0 && p.y > -10;
    });
    requestAnimationFrame(embers);
  }

  /* ---------- scroll loop ---------- */
  const forno = $('#forno'), gradiN = $('#gradiN'), thermo = $('#thermo'), glow = $('#fornoGlow');
  const arq = $('#arquivo'), arqTrack = $('#arqTrack'), arqBar = $('#arqBar');
  const ambs = $$('.amb');
  const zones = $$('[data-hd]');
  const waFloat = $('.wa-float');
  let lastY = scrollY, vw = innerWidth, vh = innerHeight, arqMax = 0;

  const headline = $('.headline'), hlLines = $$('.hl-line', headline);
  function fitHeadline() {
    if (innerWidth <= 640) { headline.style.fontSize = ''; return; }
    headline.style.fontSize = '100px';
    const a = hlLines[0].getBoundingClientRect(), b = hlLines[hlLines.length - 1].getBoundingClientRect();
    const avail = headline.clientWidth;
    headline.style.fontSize = Math.min(100 * avail / (b.right - a.left) * .995, innerHeight * .17, 190) + 'px';
  }
  function layout() {
    vw = innerWidth; vh = innerHeight;
    fitHeadline();
    measure(); sizeCv();
    arqMax = Math.max(0, arqTrack.scrollWidth - vw);
    arq.style.setProperty('--arq-h', `${arqMax + vh * 1.15}px`);
    tick();
  }

  function prog(el) {
    const r = el.getBoundingClientRect();
    return clamp(-r.top / (r.height - vh || 1));
  }

  let capaP = 0;
  function tick() {
    const y = scrollY;

    // capa
    const cr = capa.getBoundingClientRect();
    if (cr.bottom > 0 && slotR) {
      const p = capaP = prog(capa);
      const z = ease(range(p, 0, .5));
      lead.style.left = lerp(slotR.x, 0, z) + 'px';
      lead.style.top = lerp(slotR.y, 0, z) + 'px';
      lead.style.width = lerp(slotR.w, vw, z) + 'px';
      lead.style.height = lerp(slotR.h, vh, z) + 'px';
      lead.style.borderRadius = lerp(0, 0, z) + 'px';
      front.style.opacity = 1 - range(p, .02, .16);
      front.style.visibility = p > .16 ? 'hidden' : '';
      const swap = range(p, .32, .55);
      leadImg.style.opacity = swap;
      leadImg.style.transform = `scale(${lerp(1.12, 1, range(p, .32, 1))})`;
      leadCap.style.opacity = 1 - range(p, .02, .1);
      lead.style.setProperty('--shade', swap);
      bulbsBox.style.opacity = range(p, .5, .6);
      const lit = Math.round(range(p, .52, .85) * bulbs.length);
      bulbs.forEach((b, i) => b.classList.toggle('on', i < lit));
      const o = range(p, .6, .68);
      leadOver.style.opacity = o;
      leadOver.style.transform = `translateY(${(1 - o) * 30}px)`;
      if (leadVid.paused && swap < 1) leadVid.play().catch(() => {});
      else if (!leadVid.paused && swap >= 1) leadVid.pause();
    }

    // forno
    const fr = forno.getBoundingClientRect();
    const fIn = fr.top < vh && fr.bottom > 0;
    if (fIn) {
      const p = prog(forno);
      const t = ease(range(p, .05, .7));
      heat = t;
      gradiN.textContent = Math.round(t * 430);
      thermo.style.transform = `scaleX(${t})`;
      glow.style.opacity = t * .85;
      forno.style.setProperty('--heat', (t * .7).toFixed(2));
    }
    if (fIn !== fornoOn) { fornoOn = fIn; if (fIn) requestAnimationFrame(embers); }

    // arquivo
    const ar = arq.getBoundingClientRect();
    if (ar.top < vh && ar.bottom > 0) {
      const p = prog(arq);
      arqTrack.style.transform = `translate3d(${-arqMax * range(p, .05, .95)}px,0,0)`;
      arqBar.style.transform = `scaleX(${p})`;
    }

    // ambientes
    ambs.forEach(a => {
      const r = a.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) a.style.setProperty('--z', (1.12 - clamp(1 - r.top / vh) * .12).toFixed(3));
    });

    // header
    let theme = 'paper';
    for (const z of zones) { const r = z.getBoundingClientRect(); if (r.top <= 34 && r.bottom > 34) { theme = z.dataset.hd; break; } }
    if (theme === 'paper' && cr.bottom > 34 && capaP > .06) theme = 'night';
    hd.dataset.theme = theme;
    hd.classList.toggle('is-solid', y > 40);
    if (!hd.classList.contains('menu-open')) hd.classList.toggle('is-hidden', y > lastY && y > vh * 2.6 && y - lastY > 2);
    if (y < lastY - 2) hd.classList.remove('is-hidden');
    waFloat.classList.toggle('is-on', y > capa.offsetHeight - vh);
    lastY = y;
  }

  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { tick(); ticking = false; }); } }, { passive: true });
  addEventListener('resize', layout);
  if (document.fonts) document.fonts.ready.then(layout);
  addEventListener('load', layout);
  layout();

  /* ---------- vídeos sob demanda ---------- */
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) { if (v.preload === 'none') { v.preload = 'auto'; } v.play().catch(() => {}); }
    else v.pause();
  }), { rootMargin: '200px 0px' });
  $$('.lazyvid').forEach(v => vio.observe(v));

  /* ---------- reveals ---------- */
  const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); } }), { threshold: .2 });
  $$('.reveal, .news-photo, .strip').forEach(el => rio.observe(el));

  /* ---------- cardápio ---------- */
  const MENU = {
    pizze: [
      ['Marguerita', 64, 'Molho de tomate, mozzarella di bufala e basilico.', 'Criada em 1889 pelo pizzaiolo Rafaelle Esposito para homenagear a rainha Margherita di Savoia. Os ingredientes representam as cores da bandeira da Itália.'],
      ['Quattro formaggi', 70, 'Molho de tomate, mozzarella di bufala, provolone, gorgonzola e parmesão.', 'Criada no Brasil nos anos 60, inspirada nas pizzas italianas, com uma variedade de queijos para os paladares mais exigentes.'],
      ['Marinara', 62, 'Molho de tomate, orégano e azeite.', 'Inventada por volta de 1700, é a primeira pizza napoletana da história. Uma das mais consumidas em Napoli.'],
      ['Calabresa', 64, 'Molho de tomate, calabresa e azeitonas.', 'Criada em São Paulo, na região do Bixiga, inspirada nos tradicionais salames italianos.'],
      ['Diavola', 68, 'Molho de tomate, mozzarella di bufala, peperoni, basilico e azeite.', 'Elaborada para todos os amantes do gosto apimentado.'],
      ['Quattro stagioni', 68, 'Molho de tomate, mozzarella di bufala, azeitonas pretas, presunto, cogumelos e alcachofra.', 'Um clássico da tradição napoletana, preparado em 4 seções: cada uma representa uma estação do ano.'],
      ['Buscaiola', 68, 'Molho de tomate, cogumelos, linguiça, bacon e presunto.', 'Famosa na Itália e no mundo, foi feita para sustentar o trabalho pesado, como o dos lenhadores.'],
      ['Parmiggiana', 68, 'Molho de tomate, mozzarella di bufala, berinjela, parmesão e basilico.', 'Homenagem a um dos principais pratos da culinária siciliana.'],
      ['Rucula', 68, 'Mozzarella di bufala, rúcula, tomate seco e lascas de parmesão.', 'Também conhecida como mostarda persa, tem origem no Mediterrâneo e é muito consumida na Itália.'],
      ['Fiori di zucchini', 70, 'Zucchini marinada no alecrim, mozzarella di bufala, cogumelos e parmesão.', 'As fatias laminadas de abobrinha são distribuídas de forma a sugerir o formato de uma flor.'],
      ['Anchova', 70, 'Molho de tomate, anchovas, orégano, lâminas de alho e azeite.', 'Perfeita para os amantes desse ingrediente.'],
      ['Parma', 76, 'Molho de tomate, parma, parmesão, figo, balsâmico e pimenta preta.', 'Produzido há mais de 2000 anos e protegido pelo Consorzio del Prosciutto di Parma desde 1963.', 'parma-2'],
      ['Burrata', 78, 'Molho de tomate, presunto parma, burrata, tomate confit e azeite.', 'Queijo tradicional da Puglia: massa filada recheada com creme de leite e mozzarella desfiada.'],
      ['Calzone 1', 70, 'Molho de tomate, mozzarella di bufala, parma e orégano.', 'Origem na Puglia, na zona de Salento. Em algumas regiões da Itália é chamado de panzerotti.', 'calzone-mesa'],
      ['Calzone 2', 79, 'Brie e geleia de pimenta.', 'Feito com a massa de pizza tradicional, como manda a receita de Salento.'],
    ],
    antipasti: [
      ['Notizia speciale', 49, 'Três versões: azeite, balsâmico, azeitonas pretas, tomate seco, manjericão, alho e parmesão; catupiry, azeite e alho; berinjela italiana.', 'Acompanha panuozzo e 2 shots do drink da casa.'],
      ['Burrata', 59, 'Pesto de pistache e tomate confitado.', '', 'burrata'],
      ['Crostine parmigiano, 4 fatias', 29, 'Massa de pizza napoletana crocante com parmesão, alecrim e azeite.', ''],
      ['Crostine parmigiano, 8 fatias', 45, 'Massa de pizza napoletana crocante com parmesão, alecrim e azeite.', ''],
      ['Carpaccio de pera', 49, 'Lâminas de pera, limão siciliano, gorgonzola, nozes e fio de mel.', ''],
      ['Fiori', 39, 'Fiori di salame e mozzarella, enrolada em massa de pizza ao forno. 6 unidades.', ''],
      ['Bruschetta 1', 36, 'Pesto, pasta de burrata, tomatinho com alecrim, basilico e fio de azeite.', '', 'bruschetta'],
      ['Bruschetta 2', 36, 'Alho, brie, parma e fio de mel.', ''],
      ['Bruschetta 3', 36, 'Cogumelos com gorgonzola.', ''],
      ['Panuozzo napoletano 1', 32, 'Mortadela, berinjela, queijo e azeite.', 'Uma espécie de sanduíche criado nas ruas de Napoli, preparado com a massa assada de pizza.'],
      ['Panuozzo napoletano 2', 32, 'Gorgonzola e peperoni.', 'Uma espécie de sanduíche criado nas ruas de Napoli, preparado com a massa assada de pizza.'],
    ],
    drinks: [
      ['Fitzgerald', 36, 'Gin, suco de limão siciliano, xarope de açúcar, casca de limão siciliano e angostura.', 'Um clássico, o novo queridinho da galera.'],
      ['Manhattan', 40, 'Whisky americano, vermute tinto e bitter.', 'Ladies and gentlemen, um clássico sofisticado.'],
      ['Mojito', 36, 'Hortelã, suco de limão, rum e refrigerante de limão.', 'Um clássico caribenho super refrescante.'],
      ['Marguerita', 37, 'Tequila, curaçau e xarope de limão.', 'Um clássico animadíssimo.'],
      ['Negroni', 37, 'Gin, vermute rosso e Campari.', 'Esse dispensa comentários: o clássico dos clássicos.'],
      ['Aperol spritz', 37, 'Aperol, espumante brut e água com gás.', 'Feito para os paladares mais apurados.'],
      ['Moscow mule', 32, 'Vodka, gengibre, água com gás e espuma de gengibre.', 'O clássico famoso pela espuma.'],
      ['Gin tônica nacional', 37, '', 'O clássico casual.', 'gin'],
      ['Gin tônica importado', 40, '', 'O clássico casual.', 'gin'],
      ['Gin tônica tropical nacional', 41, '', 'O clássico casual com um toque tropical.'],
      ['Gin tônica tropical importado', 45, '', 'O clássico casual com um toque tropical.'],
      ['Caipisaquê', 30, 'Morango, limão taiti, limão siciliano, abacaxi ou lima-da-pérsia.', ''],
      ['Caipiroska nacional', 41, 'Morango, limão taiti, limão siciliano, abacaxi ou lima-da-pérsia.', ''],
      ['Caipiroska importada', 46, 'Morango, limão taiti, limão siciliano, abacaxi ou lima-da-pérsia.', ''],
    ],
  };
  const list = $('#menuList'), featImg = $('#featImg'), featCap = $('#featCap');
  function renderMenu(cat) {
    list.innerHTML = MENU[cat].map(([n, p, d, s, img]) => `
      <article class="item"${img ? ` data-img="${img}"` : ''}>
        <div class="item-top"><h3 class="item-name">${n}${img ? '<span class="dot">●</span>' : ''}</h3><i class="item-lead"></i><span class="item-price">R$${p}</span></div>
        ${d ? `<p class="item-desc">${d}</p>` : ''}
        ${s ? `<p class="item-story">${s}</p>` : ''}
      </article>`).join('');
    list.classList.remove('swap'); void list.offsetWidth; list.classList.add('swap');
    const first = MENU[cat].find(x => x[4]);
    if (first) feature(first[4], first[0]);
  }
  function feature(img, name) {
    featImg.style.opacity = 0;
    const im = new Image();
    im.onload = () => { featImg.src = im.src; featImg.alt = name; featCap.textContent = name; featImg.style.opacity = 1; };
    im.src = `img/${img}.jpg`;
    $$('.item', list).forEach(i => i.classList.toggle('is-feat', i.dataset.img === img && i.querySelector('.item-name').firstChild.textContent === name));
  }
  list.addEventListener('mouseover', e => {
    const it = e.target.closest('.item[data-img]');
    if (it && !it.classList.contains('is-feat')) feature(it.dataset.img, it.querySelector('.item-name').firstChild.textContent);
  });
  const tabs = $$('.tab');
  function setTab(cat) {
    tabs.forEach(t => { const on = t.dataset.cat === cat; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', on); });
    renderMenu(cat);
  }
  tabs.forEach(t => t.addEventListener('click', () => setTab(t.dataset.cat)));
  $$('[data-goto]').forEach(a => a.addEventListener('click', () => setTab(a.dataset.goto)));
  renderMenu('pizze');

  /* ---------- caça palavras ---------- */
  const WORDS = ['MARGHERITA', 'MARINARA', 'BASILICO', 'NOTIZIA', 'BURRATA', 'DIAVOLA', 'NAPOLI', 'FORNO', 'PARMA', 'CALZONE'];
  const N = 12, ws = $('#ws'), wordsEl = $('#words');
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const grid = Array.from({ length: N }, () => Array(N).fill(''));
  const placed = {};
  const dirs = [[0, 1], [1, 0], [1, 1], [-1, 1]];
  WORDS.forEach(w => {
    for (let tries = 0; tries < 500; tries++) {
      const [dr, dc] = dirs[Math.floor(rnd() * dirs.length)];
      const r0 = Math.floor(rnd() * N), c0 = Math.floor(rnd() * N);
      const cells = [...w].map((_, i) => [r0 + dr * i, c0 + dc * i]);
      if (cells.every(([r, c], i) => r >= 0 && r < N && c >= 0 && c < N && (!grid[r][c] || grid[r][c] === w[i]))) {
        cells.forEach(([r, c], i) => grid[r][c] = w[i]);
        placed[w] = cells.map(([r, c]) => r * N + c).join(',');
        break;
      }
    }
  });
  const ABC = 'ABCDEFGILMNOPRSTUVZ';
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!grid[r][c]) grid[r][c] = ABC[Math.floor(rnd() * ABC.length)];
  ws.innerHTML = grid.flat().map((l, i) => `<span data-i="${i}">${l}</span>`).join('');
  const words = Object.keys(placed);
  wordsEl.innerHTML = words.map(w => `<li data-w="${w}">${w}</li>`).join('');
  const cellsEl = $$('span', ws);
  let start = null, sel = [];
  const cellAt = (x, y) => { const el = document.elementFromPoint(x, y); return el && el.parentNode === ws ? +el.dataset.i : null; };
  function lineCells(a, b) {
    const r1 = a / N | 0, c1 = a % N, r2 = b / N | 0, c2 = b % N, dr = Math.sign(r2 - r1), dc = Math.sign(c2 - c1), len = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1));
    if (!(r1 === r2 || c1 === c2 || Math.abs(r2 - r1) === Math.abs(c2 - c1))) return [a];
    return Array.from({ length: len + 1 }, (_, i) => (r1 + dr * i) * N + c1 + dc * i);
  }
  function paint() { cellsEl.forEach(c => c.classList.remove('sel')); sel.forEach(i => cellsEl[i].classList.add('sel')); }
  ws.addEventListener('pointerdown', e => { const i = cellAt(e.clientX, e.clientY); if (i == null) return; start = i; sel = [i]; paint(); ws.setPointerCapture(e.pointerId); });
  ws.addEventListener('pointermove', e => { if (start == null) return; const i = cellAt(e.clientX, e.clientY); if (i == null) return; sel = lineCells(start, i); paint(); });
  const finish = () => {
    if (start == null) return;
    const key = sel.join(','), rev = [...sel].reverse().join(',');
    const w = words.find(w => placed[w] === key || placed[w] === rev);
    if (w && !$(`[data-w="${w}"]`, wordsEl).classList.contains('found')) {
      sel.forEach((i, k) => setTimeout(() => cellsEl[i].classList.add('hit'), k * 40));
      $(`[data-w="${w}"]`, wordsEl).classList.add('found');
      if ($$('.found', wordsEl).length === words.length) $('#passDone').hidden = false;
    }
    start = null; sel = []; paint();
  };
  ws.addEventListener('pointerup', finish);
  ws.addEventListener('pointercancel', finish);

  /* ---------- eventos ---------- */
  const OCAS = {
    'Evento corporativo': ['Workshop', 'Reunião', 'Final de ano', 'Palestra', 'Propaganda'],
    'Evento social': ['Aniversário', 'Despedida', 'Jantar', 'Reencontro'],
    'Evento fechado': ['Festa exclusiva', 'Casa fechada'],
  };
  const chips = $('#chips'), form = $('#evForm');
  function renderChips() {
    const tipo = form.tipo.value;
    chips.innerHTML = OCAS[tipo].map((o, i) => `<label><input type="radio" name="ocasiao" value="${o}"${i ? '' : ' checked'}><span>${o}</span></label>`).join('');
  }
  $$('input[name="tipo"]', form).forEach(r => r.addEventListener('change', renderChips));
  renderChips();
  const pessoas = $('#evPessoas');
  $$('[data-step]', form).forEach(b => b.addEventListener('click', () => { pessoas.value = clamp((+pessoas.value || 0) + +b.dataset.step, 2, 400); }));
  const today = new Date(); $('#evData').min = today.toISOString().slice(0, 10);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = $('#evData').value;
    const dataTxt = d ? d.split('-').reverse().join('/') : 'a combinar';
    const nome = $('#evNome').value.trim();
    const obs = $('#evObs').value.trim();
    const msg = [
      `Olá! ${nome ? `Sou ${nome} e ` : ''}quero fazer um evento na Notizia.`,
      '',
      `Tipo: ${form.tipo.value}`,
      `Ocasião: ${form.ocasiao.value}`,
      `Data: ${dataTxt}`,
      `Convidados: ${pessoas.value}`,
      obs ? `Detalhes: ${obs}` : '',
    ].filter((l, i, a) => l || (i && a[i - 1])).join('\n');
    window.open(wa(msg), '_blank', 'noopener');
  });
})();
