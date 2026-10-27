(() => {
  const menu = document.querySelector('.page-menu');
  if (!menu) return;

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a[href^="#"]')) menu.open = false;
  });

  document.addEventListener('click', (event) => {
    if (!menu.contains(event.target)) menu.open = false;
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  });
})();

(() => {
  const workflow = document.querySelector('#how-it-works');
  const steps = [...document.querySelectorAll('#how-it-works > .step')];
  const header = document.querySelector('.site-header');
  if (!workflow || !steps.length) return;

  const labels = ['Custom search', 'Browse properties', 'Neighbourhood context',
    'Property report', 'Area snapshot', 'Quick Searches'];
  const nav = document.createElement('nav');
  nav.className = 'walkthrough-nav';
  nav.setAttribute('aria-label', 'Walkthrough steps');
  nav.hidden = true;
  nav.innerHTML = `<details class="walkthrough-menu">
    <summary><span class="walkthrough-caption">How it works</span><span class="walkthrough-current"></span><span class="walkthrough-chevron" aria-hidden="true">⌄</span></summary>
    <ol>${steps.map((step, i) => `<li><a href="#${step.id}"><span class="walkthrough-number" aria-hidden="true">${i + 1}</span><span>${labels[i]}</span></a></li>`).join('')}</ol>
  </details>`;
  document.body.append(nav);
  const menu = nav.querySelector('details');
  const links = [...nav.querySelectorAll('a')];
  const current = nav.querySelector('.walkthrough-current');
  const desktop = window.matchMedia('(min-width: 1000px)');
  let pending = false;

  function update() {
    pending = false;
    const headerHeight = header?.getBoundingClientRect().height || 0;
    document.documentElement.style.setProperty('--site-header-height', `${headerHeight}px`);
    const bounds = workflow.getBoundingClientRect();
    const visible = bounds.top <= headerHeight + 24 && bounds.bottom > headerHeight + 100;
    nav.hidden = !visible;
    document.documentElement.classList.toggle('walkthrough-active', visible);
    if (desktop.matches) menu.open = true;
    else if (!visible) menu.open = false;
    let active = 0;
    const readingLine = Math.max(headerHeight + 140, window.innerHeight * 0.32);
    steps.forEach((step, i) => {
      if (step.getBoundingClientRect().top <= readingLine) active = i;
    });
    links.forEach((link, i) => {
      if (i === active) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
    current.textContent = `${active + 1} of ${steps.length} · ${labels[active]}`;
  }
  function schedule() {
    if (!pending) { pending = true; requestAnimationFrame(update); }
  }
  menu.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    event.preventDefault();
    event.stopPropagation();
    menu.open = desktop.matches;
    const target = document.getElementById(link.hash.slice(1));
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    history.replaceState(null, '', link.hash);
  });
  document.addEventListener('click', (event) => {
    if (!desktop.matches && !nav.contains(event.target)) menu.open = false;
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open && !desktop.matches) {
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  });
  desktop.addEventListener('change', () => { menu.open = false; schedule(); });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  if (header) new ResizeObserver(schedule).observe(header);
  update();
})();
