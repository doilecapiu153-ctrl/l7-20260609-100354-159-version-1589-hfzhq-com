(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = qs('.menu-toggle');
        var nav = qs('.mobile-nav');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initHero() {
        var root = qs('.hero-carousel');
        if (!root) {
            return;
        }
        var slides = qsa('.hero-slide', root);
        var dots = qsa('.hero-dot', root);
        var prev = qs('.hero-prev', root);
        var next = qs('.hero-next', root);
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle('is-active', idx === active);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle('is-active', idx === active);
            });
        }

        function restart() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot, idx) {
            dot.addEventListener('click', function () {
                show(idx);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                restart();
            });
        }
        restart();
    }

    function initFilters() {
        var input = qs('.filter-input');
        var selects = qsa('.filter-select');
        var cards = qsa('.movie-card');
        if (!cards.length || (!input && !selects.length)) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && input) {
            input.value = q;
        }

        function apply() {
            var term = input ? input.value.trim().toLowerCase() : '';
            var year = selects[0] ? selects[0].value : '';
            var region = selects[1] ? selects[1].value : '';
            cards.forEach(function (card) {
                var haystack = [
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' ').toLowerCase();
                var matchTerm = !term || haystack.indexOf(term) !== -1;
                var matchYear = !year || card.dataset.year === year;
                var matchRegion = !region || card.dataset.region === region;
                card.classList.toggle('is-hidden', !(matchTerm && matchYear && matchRegion));
            });
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });
        apply();
    }

    function initPlayers() {
        qsa('.player-card').forEach(function (card) {
            var video = qs('.movie-player', card);
            var button = qs('.play-overlay', card);
            if (!video || !button) {
                return;
            }
            var src = video.getAttribute('data-hls');
            var hlsInstance = null;

            function play() {
                if (!src) {
                    return;
                }
                button.classList.add('is-hidden');
                video.setAttribute('controls', 'controls');
                if (video.dataset.ready === '1') {
                    video.play().catch(function () {});
                    return;
                }
                video.dataset.ready = '1';
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                    video.load();
                    video.play().catch(function () {});
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    return;
                }
                video.src = src;
                video.load();
                video.play().catch(function () {});
            }

            button.addEventListener('click', play);
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
}());
