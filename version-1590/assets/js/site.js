(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var panel = document.querySelector('[data-nav-panel]');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', slider);
    var dots = selectAll('[data-hero-dot]', slider);
    var previous = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        startTimer();
      });
    }

    slider.addEventListener('mouseenter', stopTimer);
    slider.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  function normalise(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupCatalogControls() {
    var tools = document.querySelector('[data-catalog-tools]');
    var grid = document.querySelector('[data-catalog-grid]');

    if (!tools || !grid) {
      return;
    }

    var input = tools.querySelector('[data-catalog-search]');
    var sort = tools.querySelector('[data-catalog-sort]');
    var count = tools.querySelector('[data-visible-count]');
    var cards = selectAll('[data-movie-card]', grid);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && input) {
      input.value = query;
    }

    function filterCards() {
      var keyword = normalise(input ? input.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalise(card.getAttribute('data-search'));
        var title = normalise(card.getAttribute('data-title'));
        var matched = !keyword || haystack.indexOf(keyword) !== -1 || title.indexOf(keyword) !== -1;
        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible;
      }
    }

    function sortCards() {
      var mode = sort ? sort.value : 'year';
      var sortedCards = cards.slice().sort(function (left, right) {
        if (mode === 'title') {
          return String(left.getAttribute('data-title')).localeCompare(String(right.getAttribute('data-title')), 'zh-CN');
        }

        if (mode === 'hot') {
          return Number(right.getAttribute('data-hot')) - Number(left.getAttribute('data-hot'));
        }

        return Number(right.getAttribute('data-year')) - Number(left.getAttribute('data-year'));
      });

      sortedCards.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener('input', filterCards);
    }

    if (sort) {
      sort.addEventListener('change', function () {
        sortCards();
        filterCards();
      });
    }

    sortCards();
    filterCards();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNavigation();
    setupHeroSlider();
    setupCatalogControls();
  });
})();
