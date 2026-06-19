document.addEventListener('DOMContentLoaded', function () {
  setupMobileMenu();
  setupHeroSlider();
  setupPageFilter();
  setupSearchPage();
  setupPlayer();
});

function setupMobileMenu() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener('click', function () {
    menu.classList.toggle('open');
  });
}

function setupHeroSlider() {
  var hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

  var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
  var previous = hero.querySelector('[data-hero-prev]');
  var next = hero.querySelector('[data-hero-next]');
  var index = 0;
  var timer = null;

  function showSlide(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === index);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === index);
    });
  }

  function startTimer() {
    stopTimer();
    timer = window.setInterval(function () {
      showSlide(index + 1);
    }, 5000);
  }

  function stopTimer() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (previous) {
    previous.addEventListener('click', function () {
      showSlide(index - 1);
      startTimer();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(index + 1);
      startTimer();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      startTimer();
    });
  });

  hero.addEventListener('mouseenter', stopTimer);
  hero.addEventListener('mouseleave', startTimer);
  startTimer();
}

function setupPageFilter() {
  var panel = document.querySelector('[data-page-filter]');

  if (!panel) {
    return;
  }

  var keywordInput = panel.querySelector('[data-filter-keyword]');
  var yearSelect = panel.querySelector('[data-filter-year]');
  var typeSelect = panel.querySelector('[data-filter-type]');
  var categorySelect = panel.querySelector('[data-filter-category]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards() {
    var keyword = normalize(keywordInput && keywordInput.value);
    var year = normalize(yearSelect && yearSelect.value);
    var type = normalize(typeSelect && typeSelect.value);
    var category = normalize(categorySelect && categorySelect.value);

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type'),
        card.getAttribute('data-category'),
        card.textContent
      ].join(' '));
      var matched = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        matched = false;
      }

      if (year && normalize(card.getAttribute('data-year')) !== year) {
        matched = false;
      }

      if (type && normalize(card.getAttribute('data-type')) !== type) {
        matched = false;
      }

      if (category && normalize(card.getAttribute('data-category')) !== category) {
        matched = false;
      }

      card.classList.toggle('hidden-by-filter', !matched);
    });
  }

  [keywordInput, yearSelect, typeSelect, categorySelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', filterCards);
      control.addEventListener('change', filterCards);
    }
  });
}

function setupSearchPage() {
  var app = document.getElementById('search-app');

  if (!app || !window.MOVIE_SEARCH_INDEX) {
    return;
  }

  var keywordInput = app.querySelector('[data-search-keyword]');
  var categorySelect = app.querySelector('[data-search-category]');
  var typeSelect = app.querySelector('[data-search-type]');
  var results = app.querySelector('[data-search-results]');
  var count = app.querySelector('[data-search-count]');
  var query = new URLSearchParams(window.location.search);

  if (query.get('q') && keywordInput) {
    keywordInput.value = query.get('q');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function renderCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <img class="poster-image" src="' + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
      '    <span class="poster-score">热度 ' + escapeHtml(movie.score) + '</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <a class="card-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
      '    <p class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.categoryName) + '</p>',
      '    <p class="card-summary">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function runSearch() {
    var keyword = normalize(keywordInput && keywordInput.value);
    var category = normalize(categorySelect && categorySelect.value);
    var type = normalize(typeSelect && typeSelect.value);

    var filtered = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.categoryName,
        movie.genre,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' '));

      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }

      if (category && normalize(movie.categorySlug) !== category) {
        return false;
      }

      if (type && normalize(movie.type) !== type) {
        return false;
      }

      return true;
    }).slice(0, 120);

    if (results) {
      results.innerHTML = filtered.map(renderCard).join('');
    }

    if (count) {
      count.textContent = '当前显示 ' + filtered.length + ' 条结果，最多展示前 120 条。';
    }
  }

  [keywordInput, categorySelect, typeSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', runSearch);
      control.addEventListener('change', runSearch);
    }
  });

  runSearch();
}

function setupPlayer() {
  var video = document.getElementById('movie-player');

  if (!video) {
    return;
  }

  var source = video.getAttribute('data-src');
  var overlay = document.querySelector('[data-player-toggle]');
  var status = document.querySelector('[data-player-status]');
  var initialized = false;
  var hls = null;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function initializeSource() {
    if (initialized || !source) {
      return;
    }

    initialized = true;

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setStatus('播放源加载完成');
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus('播放源加载异常，请刷新页面重试');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setStatus('使用浏览器原生 HLS 播放');
    } else {
      setStatus('当前浏览器暂不支持 HLS 播放');
    }
  }

  function playVideo() {
    initializeSource();
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        setStatus('请再次点击播放按钮开始播放');
      });
    }
  }

  initializeSource();

  if (overlay) {
    overlay.addEventListener('click', playVideo);
  }

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('hidden');
    }
    setStatus('正在播放');
  });

  video.addEventListener('pause', function () {
    setStatus('已暂停');
  });

  video.addEventListener('ended', function () {
    if (overlay) {
      overlay.classList.remove('hidden');
    }
    setStatus('播放结束');
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
