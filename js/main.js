/* Hivemind Digital Solutions: site behavior (no dependencies) */
(function () {
  "use strict";

  /* Header: shadow on scroll */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile nav */
  var toggle = document.querySelector(".nav__toggle");
  var links = document.querySelector(".nav__links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Scroll reveal */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* FAQ accordion (one open at a time) */
  var items = document.querySelectorAll(".faq__item");
  items.forEach(function (item) {
    var btn = item.querySelector(".faq__q");
    btn.addEventListener("click", function () {
      var willOpen = !item.classList.contains("is-open");
      items.forEach(function (other) {
        other.classList.remove("is-open");
        other.querySelector(".faq__q").setAttribute("aria-expanded", "false");
      });
      if (willOpen) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* Clients marquee: repeat the logos until the strip is wider than the screen, then loop seamlessly */
  var track = document.querySelector(".marquee__track");
  if (track) {
    var originals = Array.prototype.slice.call(track.children);
    var buildMarquee = function () {
      // reset to the original logos
      Array.prototype.slice.call(track.children).forEach(function (n) {
        if (n.getAttribute("aria-hidden") === "true") track.removeChild(n);
      });
      track.style.removeProperty("--marquee-shift");
      var count = originals.length;
      if (!count) return;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      var setWidth = 0;
      originals.forEach(function (n) { setWidth += n.getBoundingClientRect().width + gap; });
      if (!setWidth) return;
      // make enough copies so (copies - 1) sets still cover the viewport
      var copies = Math.max(2, Math.ceil(window.innerWidth / setWidth) + 1);
      for (var c = 1; c < copies; c++) {
        originals.forEach(function (node) {
          var clone = node.cloneNode(true);
          clone.setAttribute("aria-hidden", "true");
          track.appendChild(clone);
        });
      }
      track.style.setProperty("--marquee-shift", setWidth + "px");
      track.style.setProperty("--marquee-duration", Math.max(12, setWidth / 55) + "s");
    };
    var logosLoaded = 0;
    var imgs = track.querySelectorAll("img");
    var start = function () { buildMarquee(); };
    if (!imgs.length) { start(); }
    else {
      Array.prototype.forEach.call(imgs, function (img) {
        if (img.complete) { logosLoaded++; }
        else { img.addEventListener("load", function () { if (++logosLoaded === imgs.length) start(); }); img.addEventListener("error", function () { if (++logosLoaded === imgs.length) start(); }); }
      });
      if (logosLoaded === imgs.length) start();
    }
    window.addEventListener("load", buildMarquee);
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(buildMarquee, 200); });
  }

  /* Testimonials carousel */
  var tTrack = document.querySelector(".t-track");
  if (tTrack) {
    var cards = tTrack.querySelectorAll(".t-card");
    var prev = document.querySelector(".t-btn--prev");
    var next = document.querySelector(".t-btn--next");
    var dotsWrap = document.querySelector(".t-dots");

    function step() {
      var c = cards[0];
      return c ? c.getBoundingClientRect().width + 20 : 0;
    }
    function perView() {
      return Math.max(1, Math.round(tTrack.clientWidth / (step() || 1)));
    }
    function pages() { return Math.max(1, cards.length - perView() + 1); }
    function current() { return Math.round(tTrack.scrollLeft / (step() || 1)); }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      for (var i = 0; i < pages(); i++) {
        (function (index) {
          var d = document.createElement("button");
          d.type = "button";
          d.className = "t-dot";
          d.setAttribute("aria-label", "Go to testimonial " + (index + 1));
          d.addEventListener("click", function () {
            tTrack.scrollTo({ left: index * step(), behavior: "smooth" });
          });
          dotsWrap.appendChild(d);
        })(i);
      }
      updateDots();
    }
    function updateDots() {
      if (!dotsWrap) return;
      var cur = Math.min(current(), pages() - 1);
      Array.prototype.forEach.call(dotsWrap.children, function (d, i) {
        d.setAttribute("aria-current", String(i === cur));
      });
    }

    if (prev) prev.addEventListener("click", function () {
      tTrack.scrollBy({ left: -step(), behavior: "smooth" });
    });
    if (next) next.addEventListener("click", function () {
      var atEnd = tTrack.scrollLeft + tTrack.clientWidth >= tTrack.scrollWidth - 4;
      if (atEnd) tTrack.scrollTo({ left: 0, behavior: "smooth" });
      else tTrack.scrollBy({ left: step(), behavior: "smooth" });
    });
    tTrack.addEventListener("scroll", updateDots, { passive: true });
    window.addEventListener("resize", buildDots);
    buildDots();
  }

  /* Footer year */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
