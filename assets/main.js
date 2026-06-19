(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupHeader() {
    var header = document.querySelector("[data-header]");
    if (!header) {
      return;
    }
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 18);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    var header = document.querySelector("[data-header]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      if (header) {
        header.classList.toggle("is-open", open);
      }
      button.setAttribute("aria-expanded", String(open));
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var next = slider.querySelector("[data-hero-next]");
    var prev = slider.querySelector("[data-hero-prev]");
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupSearch() {
    var input = document.querySelector("[data-search-input]");
    var select = document.querySelector("[data-category-select]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
    if (!cards.length || (!input && !select)) {
      return;
    }

    var urlQuery = new URLSearchParams(window.location.search).get("q");
    if (input && urlQuery) {
      input.value = urlQuery;
    }

    function filterCards() {
      var term = input ? input.value.trim().toLowerCase() : "";
      var category = select ? select.value : "";
      cards.forEach(function (card) {
        var searchText = (card.getAttribute("data-search") || "").toLowerCase();
        var cardCategory = card.getAttribute("data-category") || "";
        var matchText = !term || searchText.indexOf(term) !== -1;
        var matchCategory = !category || cardCategory === category;
        card.classList.toggle("is-hidden", !(matchText && matchCategory));
      });
    }

    if (input) {
      input.addEventListener("input", filterCards);
    }
    if (select) {
      select.addEventListener("change", filterCards);
    }
    filterCards();
  }

  function setupPlayer() {
    var config = window.moviePlayConfig;
    var video = document.getElementById("movieVideo");
    var overlay = document.querySelector("[data-play-overlay]");
    if (!config || !config.url || !video) {
      return;
    }

    var initialized = false;
    var hlsPlayer = null;

    function prepare() {
      if (initialized) {
        return;
      }
      initialized = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = config.url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsPlayer = new window.Hls({ enableWorker: true });
        hlsPlayer.loadSource(config.url);
        hlsPlayer.attachMedia(video);
      } else {
        video.src = config.url;
      }
    }

    function play() {
      prepare();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          if (overlay && video.paused) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    video.addEventListener("pause", function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsPlayer && typeof hlsPlayer.destroy === "function") {
        hlsPlayer.destroy();
      }
    });
  }

  ready(function () {
    setupHeader();
    setupMenu();
    setupHero();
    setupSearch();
    setupPlayer();
  });
})();
