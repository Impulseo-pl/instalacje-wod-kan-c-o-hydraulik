// Filip Jędrzejewski - ogrzewanie podłogowe. Drobna interaktywność, bez zależności.

// Nawigacja: cienka linia po przewinięciu + menu na telefonie
(function () {
  var nav = document.querySelector('.nav');
  if (!nav) return;
  var btn = nav.querySelector('.nav-toggle');
  function stan() { nav.classList.toggle('is-scrolled', (window.scrollY || 0) > 8); }
  window.addEventListener('scroll', stan, { passive: true });
  stan();
  if (btn) {
    btn.addEventListener('click', function () {
      var otwarte = nav.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', otwarte ? 'true' : 'false');
    });
    nav.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();

// Odsłanianie przy przewijaniu. Stan startowy włącza dopiero ten skrypt (klasa rv-on),
// a watchdog po 2,5 s pokazuje wszystko - awaria nigdy nie zostawi pustej sekcji.
(function () {
  try {
    var el = document.querySelectorAll('.rv');
    if (!el.length || !('IntersectionObserver' in window)) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.documentElement.classList.add('rv-on');
    var io = new IntersectionObserver(function (wpisy) {
      wpisy.forEach(function (w) {
        if (w.isIntersecting) { w.target.classList.add('in'); io.unobserve(w.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    el.forEach(function (e) { io.observe(e); });
    setTimeout(function () { el.forEach(function (e) { e.classList.add('in'); }); }, 2500);
  } catch (e) {
    document.documentElement.classList.remove('rv-on');
  }
})();

// Dolny pasek na telefonie: startuje schowany i wyjeżdża dopiero, gdy z ekranu znikną
// przyciski z nagłówka. Chowa się też przy stopce i pasie kontaktu (te same przyciski).
(function () {
  var pasek = document.querySelector('.sticky-call');
  if (!pasek) return;
  try {
    if (!('IntersectionObserver' in window)) { pasek.classList.remove('schowany'); return; }
    var cele = document.querySelectorAll('.hero-cta, .kontakt-karta, footer, .cta');
    if (!cele.length) { pasek.classList.remove('schowany'); return; }
    var widoczne = [];
    var io = new IntersectionObserver(function (wpisy) {
      wpisy.forEach(function (w) {
        var i = widoczne.indexOf(w.target);
        if (w.isIntersecting && i < 0) widoczne.push(w.target);
        if (!w.isIntersecting && i >= 0) widoczne.splice(i, 1);
      });
      pasek.classList.toggle('schowany', widoczne.length > 0);
    }, { threshold: 0.01 });
    cele.forEach(function (el) { io.observe(el); });
  } catch (e) { pasek.classList.remove('schowany'); }
})();

// Okno na nieruchome zdjęcie: tło przyszpilone do ekranu tylko wtedy, gdy sekcja jest blisko
(function () {
  try {
    var sek = document.querySelectorAll('.stopklatka');
    if (!sek.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (wpisy) {
      wpisy.forEach(function (w) { w.target.classList.toggle('is-near', w.isIntersecting); });
    }, { rootMargin: '60% 0px 60% 0px' });
    sek.forEach(function (s) { io.observe(s); });
  } catch (e) {}
})();

// LICZNIK WAŻNOŚCI DEMA (wersja pokazowa) - wjeżdża po zejściu z pierwszego ekranu
(function () {
  var el = document.querySelector('.demo-wazne');
  if (!el || !el.getAttribute('data-do')) return;
  var koniec = new Date(el.getAttribute('data-do') + 'T23:59:59');
  if (isNaN(koniec)) return;
  var txt = el.querySelector('.dw-txt') || el;
  var dwa = function (n) { return (n < 10 ? '0' : '') + n; };
  var cykl = parseInt(el.getAttribute('data-cykl') || '0', 10);
  function tyka() {
    var teraz = new Date(), ms = koniec - teraz;
    while (ms <= 0 && cykl > 0) {
      koniec = new Date(koniec.getTime() + cykl * 86400000);
      ms = koniec - teraz;
    }
    if (ms <= 0) { txt.innerHTML = 'Wersja pokazowa wygasła'; el.classList.add('is-koniec'); return false; }
    var s = Math.floor(ms / 1000), d = Math.floor(s / 86400);
    var g = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sek = s % 60;
    var zegar = dwa(g) + ':' + dwa(m) + ':' + dwa(sek);
    txt.innerHTML = d > 0
      ? 'Wersja pokazowa · <b>' + d + ' dni</b> <span class="dw-zeg">' + zegar + '</span>'
      : 'Wersja pokazowa · <b class="dw-pilne">' + zegar + '</b>';
    el.classList.toggle('is-pilne', d === 0);
    return true;
  }
  if (tyka() !== false) setInterval(tyka, 1000);
  el.hidden = false;
  var tick = false;
  function stan() {
    el.classList.toggle('is-on', (window.scrollY || 0) > window.innerHeight * 0.55);
    tick = false;
  }
  window.addEventListener('scroll', function () {
    if (tick) return; tick = true; requestAnimationFrame(stan);
  }, { passive: true });
  stan();
})();

/* === licznik otwarć demo (buy-signal) v3 — geo po stronie serwera === */
(function(){try{if(String(location.protocol).indexOf('http')!==0)return;try{if(/[?&#]team=1/.test(location.search+location.hash)){localStorage.setItem('nb_team','1');}}catch(e){}try{if(localStorage.getItem('nb_team')==='1')return;}catch(e){}if(/crm-newbeginning|crm\.impulseo\.pl/.test(document.referrer||''))return;try{if(navigator.webdriver)return;}catch(e){}try{if(/^https?:\/\/(kris20032|impulseo-pl)\.github\.io\/?$/i.test(document.referrer||''))return;}catch(e){}if(sessionStorage.getItem('_dv'))return;sessionStorage.setItem('_dv','1');var seg=(location.pathname.split('/').filter(Boolean)[0])||'';var base=location.origin+(seg?('/'+seg):'');var ua='';try{ua=(navigator.userAgent||'').slice(0,300);}catch(e){}var EP='https://zngfubfinbojfgaxdrbf.supabase.co/functions/v1/demo-view';try{fetch(EP,{method:'POST',keepalive:true,headers:{'Content-Type':'text/plain'},body:JSON.stringify({demo_url:base,page:location.pathname,referrer:(document.referrer||null),user_agent:(ua||null)})}).catch(function(){});}catch(e){}}catch(e){}})();
