(() => {
  const mobileButton = document.querySelector('.mobile-menu-button');
  const mobileNav = document.querySelector('.mobile-nav');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      mobileNav.hidden = !isOpen;
      mobileButton.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('menu-open', isOpen);
    });
  }

  const heroSlides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const heroDots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let heroIndex = 0;
  let heroTimer = null;

  function showHeroSlide(index) {
    if (!heroSlides.length) {
      return;
    }

    heroIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });
    heroDots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
  }

  function startHeroTimer() {
    if (heroTimer || heroSlides.length <= 1) {
      return;
    }

    heroTimer = window.setInterval(() => {
      showHeroSlide(heroIndex + 1);
    }, 5500);
  }

  heroDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = Number(dot.dataset.heroDot || 0);
      showHeroSlide(index);
      window.clearInterval(heroTimer);
      heroTimer = null;
      startHeroTimer();
    });
  });

  showHeroSlide(0);
  startHeroTimer();

  document.querySelectorAll('img').forEach((image) => {
    image.addEventListener('error', () => {
      image.style.opacity = '0';
    }, { once: true });
  });

  const filterScopes = Array.from(document.querySelectorAll('[data-card-list]'));

  filterScopes.forEach((scope) => {
    const input = scope.querySelector('[data-filter-input]');
    const category = scope.querySelector('[data-filter-category]');
    const type = scope.querySelector('[data-filter-type]');
    const year = scope.querySelector('[data-filter-year]');
    const result = scope.querySelector('[data-filter-result]');
    const cards = Array.from(scope.querySelectorAll('.movie-card'));

    function applyFilters() {
      const query = (input?.value || '').trim().toLowerCase();
      const categoryValue = category?.value || '';
      const typeValue = type?.value || '';
      const yearValue = year?.value || '';
      let visible = 0;

      cards.forEach((card) => {
        const haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.category,
          card.dataset.tags,
          card.dataset.genre,
          card.dataset.line
        ].join(' ').toLowerCase();

        const matchQuery = !query || haystack.includes(query);
        const matchCategory = !categoryValue || card.dataset.category === categoryValue;
        const matchType = !typeValue || (card.dataset.type || '').includes(typeValue);
        const matchYear = !yearValue || card.dataset.year === yearValue;
        const shouldShow = matchQuery && matchCategory && matchType && matchYear;

        card.classList.toggle('is-hidden-by-filter', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (result) {
        result.textContent = `当前显示 ${visible} 部影片，共 ${cards.length} 部`;
      }
    }

    [input, category, type, year].forEach((control) => {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    const params = new URLSearchParams(window.location.search);
    const queryParam = params.get('q');
    if (queryParam && input) {
      input.value = queryParam;
    }

    applyFilters();
  });

  const players = Array.from(document.querySelectorAll('.js-video-player'));

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existed = document.querySelector(`script[src="${src}"]`);
      if (existed) {
        existed.addEventListener('load', resolve, { once: true });
        if (window.Hls) {
          resolve();
        }
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function initializePlayer(player) {
    const video = player.querySelector('video');
    const message = player.querySelector('[data-player-message]');
    const source = player.dataset.videoUrl;

    if (!video || !source) {
      if (message) {
        message.textContent = '暂未找到可播放的视频源';
      }
      return;
    }

    if (player.dataset.ready === 'true') {
      video.play().catch(() => undefined);
      return;
    }

    if (message) {
      message.textContent = '正在加载高清播放源…';
    }

    try {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        if (!window.Hls) {
          await loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js');
        }

        if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          player._hls = hls;
        } else {
          video.src = source;
        }
      }

      player.dataset.ready = 'true';
      player.classList.add('is-playing');
      if (message) {
        message.textContent = '视频源已加载，可使用播放器控制栏观看';
      }
      video.play().catch(() => undefined);
    } catch (error) {
      if (message) {
        message.textContent = '播放源加载失败，请刷新页面后重试';
      }
      console.error(error);
    }
  }

  players.forEach((player) => {
    const overlay = player.querySelector('.play-overlay');
    const video = player.querySelector('video');

    if (overlay) {
      overlay.addEventListener('click', () => initializePlayer(player));
    }

    if (video) {
      video.addEventListener('click', () => initializePlayer(player));
      video.addEventListener('play', () => {
        player.classList.add('is-playing');
      });
    }
  });
})();
