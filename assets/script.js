(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Intro
  var intro = $("#intro");
  if (intro) {
    var hide = function () { intro.classList.add("is-done"); };
    if (reduce) hide(); else window.addEventListener("load", function () { setTimeout(hide, 900); });
    setTimeout(hide, 3000);
  }

  // Header + menu
  var header = $(".header");
  var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 10); };
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  var burger = $(".burger"), drawer = $("#drawer");
  var setMenu = function (open) {
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    drawer.classList.toggle("is-open", open);
  };
  burger.addEventListener("click", function () { setMenu(burger.getAttribute("aria-expanded") !== "true"); });
  $$("#drawer a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  // Revelar ao rolar
  var items = $$("[data-reveal]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else items.forEach(function (el) { el.classList.add("is-in"); });

  // Transições tecnológicas: varredura nas seções, entrada escalonada e rótulos que se "decodificam"
  $$("[data-stagger]").forEach(function (list) {
    Array.prototype.forEach.call(list.children, function (el, i) { el.style.setProperty("--i", i); });
  });
  var GLYPHS = "01<>/#_[]{}=+*";
  var decode = function (el) {
    if (el.dataset.decoded || el.children.length) return;
    el.dataset.decoded = "1";
    var final = el.textContent, len = final.length, frame = 0, total = 18;
    el.setAttribute("aria-label", final);
    el.classList.add("is-decoding");
    var tick = function () {
      frame++;
      var done = Math.floor((frame / total) * len), out = "";
      for (var i = 0; i < len; i++) {
        var c = final[i];
        out += i < done || c === " " ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (frame < total) requestAnimationFrame(tick);
      else { el.textContent = final; el.classList.remove("is-decoding"); el.removeAttribute("aria-label"); }
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window && !reduce) {
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var sec = e.target;
        sec.style.setProperty("--sh", sec.offsetHeight + "px");
        sec.classList.add("is-live");
        $$(".eyebrow", sec).forEach(decode);
        sio.unobserve(sec);
      });
    }, { threshold: 0.12 });
    $$("main > .section").forEach(function (sec) { sio.observe(sec); });
  }

  // Tiras: setas
  $$(".arrow[data-strip]").forEach(function (b) {
    b.addEventListener("click", function () {
      var s = document.getElementById(b.dataset.strip);
      var card = s.firstElementChild;
      var step = card ? card.getBoundingClientRect().width + 16 : s.clientWidth;
      s.scrollBy({ left: step * Number(b.dataset.dir), behavior: reduce ? "auto" : "smooth" });
    });
  });

  // Vídeos (cliente e carrossel): sem som, em loop, tocam só quando aparecem na tela
  var vids = $$("#cliente-video, .vcard");
  if (vids.length) {
    var play = function (v) {
      if (v.dataset.userPaused) return;
      if (v.preload === "none") v.preload = "auto";
      v.muted = true;
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    };
    if ("IntersectionObserver" in window && !reduce) {
      var vio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          e.target.dataset.visible = e.isIntersecting ? "1" : "";
          if (e.isIntersecting && !document.hidden) play(e.target); else e.target.pause();
        });
      }, { threshold: 0.35 });
      vids.forEach(function (v) { v.muted = true; vio.observe(v); });
      document.addEventListener("visibilitychange", function () {
        vids.forEach(function (v) { if (document.hidden) v.pause(); else if (v.dataset.visible) play(v); });
      });
    }
    var cv = $("#cliente-video");
    if (cv) cv.addEventListener("click", function () {
      if (cv.paused) { delete cv.dataset.userPaused; play(cv); } else { cv.dataset.userPaused = "1"; cv.pause(); }
    });
  }

  // Aberto agora? (horário de Paranaíba, MS, UTC-4)
  var status = $("#status");
  if (status) {
    var now = new Date(Date.now() + (new Date().getTimezoneOffset() - 240) * 60000);
    var d = now.getDay(), m = now.getHours() * 60 + now.getMinutes();
    var sched = { 0: null, 6: [480, 900] };
    var h = d in sched ? sched[d] : [450, 1080];
    $$(".hours tr").forEach(function (tr) {
      if (tr.dataset.days.split(",").indexOf(String(d)) > -1) tr.classList.add("is-today");
    });
    if (h && m >= h[0] && m < h[1]) {
      var left = h[1] - m;
      status.textContent = left <= 60 ? "Aberto agora · fecha em " + left + " min" : "Aberto agora";
      status.classList.add("is-open");
    } else {
      status.textContent = "Fechado agora";
      status.classList.add("is-closed");
    }
  }

  // Mapa: carrega só quando chega perto
  var mf = $(".map__frame");
  if (mf) {
    var load = function () {
      if (mf.querySelector("iframe") || window.top !== window) return; // dentro de uma prévia embutida, fica o mapa estático
      var f = document.createElement("iframe");
      f.src = mf.dataset.src; f.loading = "lazy"; f.title = "Mapa da King Cell em Paranaíba, MS";
      f.referrerPolicy = "no-referrer-when-downgrade";
      mf.appendChild(f);
    };
    if ("IntersectionObserver" in window) {
      var mio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { load(); mio.disconnect(); } }, { rootMargin: "400px" });
      mio.observe(mf);
    } else load();
  }

  var ano = $("#ano"); if (ano) ano.textContent = new Date().getFullYear();
})();
