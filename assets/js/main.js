/* GTA VI DETONA BR: interações (sem dependências) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var BASE = window.SITE_BASE || "";

  /* nav: sombra ao rolar + menu mobile */
  var nav = $("#nav");
  var onScroll = function () {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 30);
    var bar = $("#progress");
    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    }
    var sun = $(".hero__sun");
    if (sun && !reduce) sun.style.setProperty("--sy", window.scrollY * 0.25 + "px");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  var burger = $("#burger"), links = $("#navlinks");
  if (burger && links) burger.addEventListener("click", function () { links.classList.toggle("is-open"); });

  /* reveal on scroll */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal").forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 80 + "ms"; io.observe(el); });
  } else { $$(".reveal").forEach(function (el) { el.classList.add("is-in"); }); }

  /* contadores do hero */
  var countUp = function (el, to, suffix) {
    if (reduce) { el.textContent = to + (suffix || ""); return; }
    var t0 = null, dur = 1800;
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), v = Math.round(to * (1 - Math.pow(1 - p, 4)));
      el.textContent = v + (suffix || "");
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  setTimeout(function () {
    $$("[data-count]").forEach(function (el) { countUp(el, parseInt(el.getAttribute("data-count"), 10), el.getAttribute("data-suffix")); });
    var ds = $("#daysSince");
    if (ds && window.LAUNCH) {
      var diff = Math.floor((Date.now() - new Date(window.LAUNCH).getTime()) / 86400000);
      if (diff < 0) { $("#daysLabel").textContent = "dias para o lançamento"; countUp(ds, -diff); }
      else countUp(ds, diff + 1);
    }
  }, 1500);

  /* glitch periódico no título */
  var title = $(".hero__title");
  if (title && !reduce) {
    setInterval(function () {
      title.classList.add("glitch");
      setTimeout(function () { title.classList.remove("glitch"); }, 180);
    }, 4200);
  }

  /* parallax leve das palmeiras + brilho do cursor */
  var glow = $(".cursor-glow");
  var palms = $$(".hero__palm"), city = $(".hero__city");
  window.addEventListener("pointermove", function (e) {
    if (glow) { glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px"; }
    if (reduce || !palms.length) return;
    var x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
    palms[0].style.translate = (x * -30) + "px " + (y * -10) + "px";
    if (palms[1]) palms[1].style.translate = (x * -40) + "px " + (y * -12) + "px";
    if (city) city.style.translate = (x * 12) + "px 0";
  }, { passive: true });

  /* tilt 3D nos cards (desktop) */
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    $$(".card").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "translateY(-6px) perspective(900px) rotateX(" + (-y * 5) + "deg) rotateY(" + (x * 6) + "deg)";
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
  }

  /* copiar link */
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var done = function () { b.textContent = "Copiado!"; setTimeout(function () { b.textContent = "Copiar link"; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(b.getAttribute("data-copy")).then(done, done); else done();
    });
  });

  /* busca (carrega search.json sob demanda) */
  var box = $("#search"), input = $("#searchInput"), list = $("#searchResults"), index = null;
  var norm = function (s) { return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var open = function () {
    box.hidden = false; input.focus();
    if (!index) fetch(BASE + "/search.json").then(function (r) { return r.json(); }).then(function (d) { index = d; render(); }).catch(function () { index = []; });
  };
  var close = function () { box.hidden = true; };
  var render = function () {
    if (!index) return;
    var q = norm(input.value.trim());
    if (!q) { list.innerHTML = ""; return; }
    var terms = q.split(/\s+/);
    var hits = index.filter(function (p) { var h = norm(p.title + " " + p.description + " " + p.tags + " " + p.category); return terms.every(function (t) { return h.indexOf(t) > -1; }); }).slice(0, 12);
    list.innerHTML = hits.length ? hits.map(function (p) { return '<li><a href="' + esc(p.url) + '"><small>' + esc(p.category) + "</small>" + esc(p.title) + "</a></li>"; }).join("") : '<li class="muted" style="padding:14px">Nada encontrado. Tente "cheats", "easter egg", "PC"…</li>';
  };
  if (box) {
    $("#searchOpen").addEventListener("click", open);
    $("#searchClose").addEventListener("click", close);
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    input.addEventListener("input", render);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
      if ((e.key === "/" || (e.key === "k" && (e.ctrlKey || e.metaKey))) && box.hidden && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); open(); }
    });
  }
})();
