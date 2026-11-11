/* CyberSeguro: interatividade em JavaScript puro */
(function () {
  'use strict';

  var header = document.getElementById('topo');
  var menuBtn = document.getElementById('menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');
  var backTop = document.getElementById('back-to-top');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Menu hambúrguer ---------- */
  function setMenu(open) {
    mobileMenu.classList.toggle('hidden', !open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menuBtn.querySelector('i').className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  }
  menuBtn.addEventListener('click', function () {
    setMenu(mobileMenu.classList.contains('hidden'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* ---------- Scroll suave com compensação do cabeçalho fixo ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - header.offsetHeight + 1;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      history.pushState(null, '', id);
      setMenu(false);
    });
  });

  /* ---------- Voltar ao topo + link ativo no menu ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = document.querySelectorAll('.nav-link');

  function onScroll() {
    backTop.classList.toggle('show', window.pageYOffset > 500);

    var pos = window.pageYOffset + header.offsetHeight + 40;
    var current = '';
    sections.forEach(function (s) { if (s.offsetTop <= pos) current = s.id; });
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  backTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Animação de entrada ao rolar ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Checklist interativo ---------- */
  var STORAGE_KEY = 'cyberseguro-checklist-v1';
  var items = Array.prototype.slice.call(document.querySelectorAll('.check-item'));
  var bar = document.getElementById('progress-bar');
  var track = document.getElementById('progress-track');
  var label = document.getElementById('progress-label');
  var pct = document.getElementById('progress-pct');
  var done = document.getElementById('checklist-done');
  var resetBtn = document.getElementById('checklist-reset');

  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (e) { return []; }
  }
  function save() {
    var ids = items.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; })
                   .map(function (b) { return b.dataset.id; });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch (e) { /* sem armazenamento: ignora */ }
  }
  function updateProgress() {
    var count = items.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).length;
    var percent = Math.round((count / items.length) * 100);
    bar.style.width = percent + '%';
    track.setAttribute('aria-valuenow', String(percent));
    label.textContent = count + ' de ' + items.length + ' hábitos aplicados';
    pct.textContent = percent + '%';
    done.classList.toggle('hidden', count !== items.length);
  }

  var saved = load();
  items.forEach(function (btn) {
    if (saved.indexOf(btn.dataset.id) !== -1) btn.setAttribute('aria-pressed', 'true');
    btn.addEventListener('click', function () {
      var on = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', String(!on));
      save();
      updateProgress();
    });
  });
  resetBtn.addEventListener('click', function () {
    items.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
    save();
    updateProgress();
  });
  updateProgress();

  /* ---------- Botões de compartilhamento do rodapé ---------- */
  var pageUrl = encodeURIComponent(window.location.href.split('#')[0]);
  var shareText = encodeURIComponent('Ataques cibernéticos e como evitá-los: veja e proteja sua família.');
  var shareLinks = {
    whatsapp: 'https://wa.me/?text=' + shareText + '%20' + pageUrl,
    facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + pageUrl,
    x: 'https://twitter.com/intent/tweet?text=' + shareText + '&url=' + pageUrl,
    linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + pageUrl
  };
  document.querySelectorAll('[data-share]').forEach(function (a) {
    var url = shareLinks[a.dataset.share];
    if (url) a.setAttribute('href', url);
  });

  /* ---------- Ano atual no rodapé ---------- */
  var year = document.getElementById('ano');
  if (year) year.textContent = new Date().getFullYear();
})();
