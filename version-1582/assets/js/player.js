(function () {
    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var existing = document.querySelector('script[src="' + src + '"]');
            if (existing) {
                existing.addEventListener('load', resolve);
                if (window.Hls) {
                    resolve();
                }
                return;
            }

            var script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function setStatus(text) {
        var status = document.querySelector('[data-player-status]');
        if (status) {
            status.textContent = text;
        }
    }

    function startPlayer(card, video, url) {
        setStatus('正在载入播放源，请稍候...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.play().then(function () {
                card.classList.add('is-playing');
                setStatus('播放中');
            }).catch(function () {
                setStatus('浏览器阻止了自动播放，请再次点击播放按钮。');
            });
            return;
        }

        loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest').then(function () {
            if (!window.Hls || !window.Hls.isSupported()) {
                video.src = url;
                return video.play();
            }

            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });

            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().then(function () {
                    card.classList.add('is-playing');
                    setStatus('播放中');
                }).catch(function () {
                    setStatus('播放源已载入，请再次点击播放按钮。');
                });
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setStatus('当前播放源暂时无法加载，请刷新页面后重试。');
                    hls.destroy();
                }
            });
        }).catch(function () {
            video.src = url;
            video.play().then(function () {
                card.classList.add('is-playing');
                setStatus('播放中');
            }).catch(function () {
                setStatus('播放组件加载失败，请检查网络后重试。');
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var card = document.querySelector('[data-player-card]');
        var video = document.querySelector('[data-player-video]');
        var button = document.querySelector('[data-play-button]');

        if (!card || !video || !button) {
            return;
        }

        button.addEventListener('click', function () {
            var url = video.getAttribute('data-src');
            if (!url) {
                setStatus('未找到播放源。');
                return;
            }
            startPlayer(card, video, url);
        });
    });
}());
