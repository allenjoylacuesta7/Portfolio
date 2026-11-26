/* ==========================================================
   Portfolio interactivity (vanilla JS)
   - Mobile navigation toggle
   - Smooth scrolling with sticky-header offset
   - Active nav link highlighting
   - Project filter
   ========================================================== */
(function () {
  "use strict";

  var navToggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("primary-nav");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile menu ---------- */
  function setMenu(open) {
    nav.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  }

  navToggle.addEventListener("click", function () {
    setMenu(navToggle.getAttribute("aria-expanded") !== "true");
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      setMenu(false);
      navToggle.focus();
    }
  });

  /* ---------- Glass header on scroll ---------- */
  var header = document.querySelector(".site-header");
  function updateHeader() {
    header.classList.toggle("scrolled", window.pageYOffset > 20);
  }
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  /* ---------- Smooth scrolling ---------- */
  var headerHeight = function () {
    return document.querySelector(".site-header").offsetHeight;
  };

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight();
      window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
      history.pushState(null, "", id);
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      setMenu(false);
    });
  });

  /* ---------- Active link on scroll ---------- */
  var navLinks = document.querySelectorAll(".site-nav a[href^='#']");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (a) {
            var active = a.getAttribute("href") === "#" + entry.target.id;
            a.classList.toggle("active", active);
            if (active) a.setAttribute("aria-current", "true");
            else a.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    document.querySelectorAll("main section[id]").forEach(function (s) {
      observer.observe(s);
    });
  }

  /* ---------- Project filter ---------- */
  var filterButtons = document.querySelectorAll(".filter-btn");
  var cards = document.querySelectorAll("#project-cards .card");
  var emptyState = document.getElementById("empty-state");

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var filter = btn.dataset.filter;
      var visible = 0;

      filterButtons.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", String(on));
      });

      cards.forEach(function (card) {
        var tags = (card.dataset.tags || "").split(/\s+/);
        var show = filter === "all" || tags.indexOf(filter) !== -1;
        card.hidden = !show;
        if (show) visible++;
      });

      emptyState.hidden = visible !== 0;
    });
  });

  /* ---------- Demo video dialog ---------- */
  var dialog = document.getElementById("video-dialog");
  var player = document.getElementById("video-player");
  var videoTitle = document.getElementById("video-title");
  var videoError = document.getElementById("video-error");
  var frame = document.getElementById("video-frame");
  var lastTrigger = null;

  // Turns YouTube / Google Drive share links into embeddable URLs; returns null for local files
  function toEmbedUrl(url) {
    var m = url.match(/(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/);
    if (m) return "https://www.youtube.com/embed/" + m[1] + "?rel=0&autoplay=1";
    m = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
    if (m) return "https://drive.google.com/file/d/" + m[1] + "/preview";
    return null;
  }

  function closeVideo() {
    if (dialog.open) dialog.close();
  }

  document.querySelectorAll(".demo-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      lastTrigger = btn;
      videoTitle.textContent = btn.dataset.title || "Project demo";
      videoError.hidden = true;

      var embed = toEmbedUrl(btn.dataset.video);
      if (embed) {
        // YouTube or Google Drive link: show it in an iframe inside the modal
        player.hidden = true;
        frame.hidden = false;
        frame.src = embed;
        dialog.showModal();
      } else {
        // Local .mp4 file in the assets folder
        frame.hidden = true;
        player.hidden = false;
        player.src = btn.dataset.video;
        dialog.showModal();
        var p = player.play();
        if (p && p.catch) p.catch(function () { /* autoplay blocked, user can press play */ });
      }
    });
  });

  player.addEventListener("error", function () { videoError.hidden = false; });
  document.getElementById("video-close").addEventListener("click", closeVideo);

  // Click on the dark backdrop closes the dialog
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) closeVideo();
  });

  // Runs for Escape, the close button and the backdrop: stop playback and free the file
  dialog.addEventListener("close", function () {
    player.pause();
    player.removeAttribute("src");
    player.load();
    frame.removeAttribute("src");   // stops YouTube / Drive playback
    if (lastTrigger) lastTrigger.focus();
  });

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();