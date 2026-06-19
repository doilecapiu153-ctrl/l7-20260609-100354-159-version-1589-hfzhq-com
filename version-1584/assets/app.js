(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  function renderGlobalResults(input, panel) {
    var query = normalizeText(input.value);
    if (!query) {
      panel.classList.remove('is-visible');
      panel.innerHTML = '';
      return;
    }
    var data = Array.isArray(window.movieIndex) ? window.movieIndex : [];
    var matches = data.filter(function (item) {
      var text = normalizeText(item.title + ' ' + item.year + ' ' + item.region + ' ' + item.type + ' ' + item.category + ' ' + item.tags);
      return text.indexOf(query) !== -1;
    }).slice(0, 8);
    if (!matches.length) {
      panel.innerHTML = '<div class="search-result-link"><div class="search-result-title">没有找到相关内容</div><div class="search-result-meta">换一个关键词试试</div></div>';
      panel.classList.add('is-visible');
      return;
    }
    panel.innerHTML = matches.map(function (item) {
      return '<a class="search-result-link" href="' + item.url + '"><div class="search-result-title">' + item.title + '</div><div class="search-result-meta">' + item.year + ' · ' + item.region + ' · ' + item.type + ' · ' + item.category + '</div></a>';
    }).join('');
    panel.classList.add('is-visible');
  }

  function initGlobalSearch() {
    var inputs = document.querySelectorAll('[data-global-search]');
    inputs.forEach(function (input) {
      var panel = document.createElement('div');
      panel.className = 'header-search-panel';
      input.parentNode.appendChild(panel);
      input.addEventListener('input', function () {
        renderGlobalResults(input, panel);
      });
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          var data = Array.isArray(window.movieIndex) ? window.movieIndex : [];
          var query = normalizeText(input.value);
          var match = data.find(function (item) {
            return normalizeText(item.title).indexOf(query) !== -1;
          });
          if (match) {
            window.location.href = match.url;
          }
        }
      });
      document.addEventListener('click', function (event) {
        if (!input.parentNode.contains(event.target)) {
          panel.classList.remove('is-visible');
        }
      });
    });
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) return;
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initPageFilter() {
    var input = document.querySelector('[data-page-filter]');
    if (!input) return;
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    input.addEventListener('input', function () {
      var query = normalizeText(input.value);
      cards.forEach(function (card) {
        var text = normalizeText(card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta'));
        card.hidden = query && text.indexOf(query) === -1;
      });
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) return;
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) return;
    var active = 0;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    setInterval(function () {
      show(active + 1);
    }, 5600);
    show(0);
  }

  function initPlayer() {
    var player = document.querySelector('.watch-player');
    if (!player) return;
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var source = player.getAttribute('data-hls');
    var hlsInstance = null;
    function attach() {
      if (!source || video.getAttribute('data-ready') === '1') return;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
      video.setAttribute('data-ready', '1');
    }
    function play() {
      attach();
      player.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      var started = video.play();
      if (started && typeof started.catch === 'function') {
        started.catch(function () {});
      }
    }
    if (cover) cover.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.getAttribute('data-ready') !== '1') play();
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) hlsInstance.destroy();
    });
  }

  ready(function () {
    initMobileMenu();
    initGlobalSearch();
    initPageFilter();
    initHeroSlider();
    initPlayer();
  });
})();
