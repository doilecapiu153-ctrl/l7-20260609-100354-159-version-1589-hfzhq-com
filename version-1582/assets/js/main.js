(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function imageFallback(img) {
        var parent = img.parentElement;
        img.style.display = 'none';
        if (parent) {
            parent.classList.add('cover-fallback');
        }
    }

    window.siteImageFallback = imageFallback;

    function setupMobileNav() {
        var toggle = qs('[data-mobile-toggle]');
        var nav = qs('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(open));
        });
    }

    function setupHero() {
        var slider = qs('[data-hero-slider]');
        if (!slider) {
            return;
        }

        var slides = qsa('[data-hero-slide]', slider);
        var dots = qsa('[data-hero-dot]', slider);
        if (slides.length <= 1) {
            return;
        }

        var index = 0;
        var timer = null;

        function activate(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
                dot.setAttribute('aria-pressed', String(dotIndex === index));
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                activate(dotIndex);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        activate(0);
        start();
    }

    function setupFilters() {
        var cards = qsa('[data-movie-card]');
        var input = qs('[data-filter-input]');
        var genre = qs('[data-filter-genre]');
        var year = qs('[data-filter-year]');
        var sort = qs('[data-filter-sort]');
        var count = qs('[data-result-count]');
        var empty = qs('[data-empty-message]');
        var grid = qs('[data-card-grid]');

        if (!cards.length || !grid) {
            return;
        }

        function applySort(visibleCards) {
            var mode = sort ? sort.value : 'year-desc';
            visibleCards.sort(function (a, b) {
                var yearA = Number(a.getAttribute('data-year') || 0);
                var yearB = Number(b.getAttribute('data-year') || 0);
                var titleA = a.getAttribute('data-title') || '';
                var titleB = b.getAttribute('data-title') || '';

                if (mode === 'year-asc') {
                    return yearA - yearB || titleA.localeCompare(titleB, 'zh-Hans-CN');
                }
                if (mode === 'title') {
                    return titleA.localeCompare(titleB, 'zh-Hans-CN');
                }
                return yearB - yearA || titleA.localeCompare(titleB, 'zh-Hans-CN');
            });
            visibleCards.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        function apply() {
            var keyword = normalize(input ? input.value : '');
            var genreValue = normalize(genre ? genre.value : '');
            var yearValue = year ? year.value : '';
            var visibleCards = [];

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var cardGenre = normalize(card.getAttribute('data-genre'));
                var cardYear = card.getAttribute('data-year') || '';
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchGenre = !genreValue || cardGenre.indexOf(genreValue) !== -1;
                var matchYear = !yearValue || cardYear === yearValue;
                var visible = matchKeyword && matchGenre && matchYear;

                card.style.display = visible ? '' : 'none';
                if (visible) {
                    visibleCards.push(card);
                }
            });

            applySort(visibleCards);
            if (count) {
                count.textContent = '当前显示 ' + visibleCards.length + ' 部影片';
            }
            if (empty) {
                empty.classList.toggle('is-visible', visibleCards.length === 0);
            }
        }

        [input, genre, year, sort].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && input) {
            input.value = query;
        }

        apply();
    }

    function setupHeaderSearch() {
        qsa('[data-header-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = qs('input', form);
                var query = input ? input.value.trim() : '';
                if (!query) {
                    event.preventDefault();
                    return;
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileNav();
        setupHero();
        setupFilters();
        setupHeaderSearch();
    });
}());
