(() => {
  'use strict';
  const root = document.documentElement;
  const motionButton = document.getElementById('motion-toggle');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false;
  try { userPaused = localStorage.getItem('av-motion-paused') === 'true'; } catch { /* Reading works without storage. */ }
  const applyMotion = () => {
    const paused = userPaused || reducedMotion.matches;
    root.classList.toggle('no-motion', paused);
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.setAttribute('aria-label', reducedMotion.matches ? 'Анимация отключена настройками устройства' : (paused ? 'Включить анимацию' : 'Отключить анимацию'));
    motionButton.querySelector('span').textContent = paused ? 'Анимация выключена' : 'Без анимации';
  };
  motionButton.addEventListener('click', () => {
    if (reducedMotion.matches) {
      motionButton.querySelector('span').textContent = 'Выключена в настройках устройства';
      return;
    }
    userPaused = !userPaused;
    try { localStorage.setItem('av-motion-paused', String(userPaused)); } catch { /* Optional preference only. */ }
    applyMotion();
  });
  reducedMotion.addEventListener('change', applyMotion);
  applyMotion();
  const syncVisibility = () => root.classList.toggle('tab-hidden', document.hidden);
  document.addEventListener('visibilitychange', syncVisibility);
  syncVisibility();

  const progress = document.querySelector('.reading-progress');
  let scrollQueued = false;
  const updateProgress = () => {
    const max = root.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0})`;
    scrollQueued = false;
  };
  addEventListener('scroll', () => {
    if (!scrollQueued) { requestAnimationFrame(updateProgress); scrollQueued = true; }
  }, { passive: true });
  addEventListener('resize', updateProgress);
  document.querySelectorAll('details').forEach(detail => detail.addEventListener('toggle', updateProgress));
  updateProgress();

  const events = [
    { date: '23 октября · Кампус КБТУ', title: 'Алтемир открывает дело', text: 'В студенческом чате появляется манифест Киры. L замечает первую зацепку: время публикаций совпадает с перерывами между парами.', link: '#kira', label: 'К расследованию' },
    { date: '24 октября · Зелёный базар', title: 'Поворот не в ту сторону', text: 'Мечник со шрамом возвращается к тому же прилавку в третий раз. Он уверен, что шёл прямо. Продавец предпочитает не спорить.', link: '#zoro', label: 'Пройти по следам Зоро' },
    { date: '24 октября · Вечерний Алматы', title: 'Тишина обрывается', text: 'В 19:42 происходит первый из трёх взрывов. Позже на разных записях заметят одну и ту же девушку с красным цветком.', link: '#anelya', label: 'Открыть репортаж' }
  ];
  const sheet = document.querySelector('.timeline-sheet');
  document.querySelectorAll('[data-event]').forEach(button => button.addEventListener('click', () => {
    const event = events[Number(button.dataset.event)];
    document.querySelectorAll('[data-event]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    document.getElementById('event-date').textContent = event.date;
    document.getElementById('event-title').textContent = event.title;
    document.getElementById('event-text').textContent = event.text;
    const link = document.getElementById('event-link');
    link.href = event.link;
    link.replaceChildren(document.createTextNode(event.label + ' '));
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrow.setAttribute('viewBox', '0 0 24 24'); arrow.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M5 19 19 5M5 5h14v14'); arrow.append(path); link.append(arrow);
    sheet.classList.remove('switching');
    requestAnimationFrame(() => sheet.classList.add('switching'));
  }));
  sheet.addEventListener('animationend', () => sheet.classList.remove('switching'));

  const links = [...document.querySelectorAll('.navigation a')];
  if ('IntersectionObserver' in window) {
    const activeSections = new Map();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => activeSections.set(e.target.id, e.isIntersecting));
      const active = [...activeSections].find(([, visible]) => visible)?.[0];
      links.forEach(a => {
        if (a.hash === '#' + active) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
    }, { rootMargin: '-65px 0px -65% 0px' });
    document.querySelectorAll('main > [id]').forEach(section => observer.observe(section));
  }

})();
