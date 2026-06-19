(function () {
  function initialisePlayer(container) {
    var video = container.querySelector('[data-player-video]');
    var startButton = container.querySelector('[data-player-start]');
    var status = container.querySelector('[data-player-status]');
    var source = container.getAttribute('data-source');
    var hlsInstance = null;
    var hasAttachedSource = false;

    if (!video || !source) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function attachSource() {
      if (hasAttachedSource) {
        return Promise.resolve();
      }

      hasAttachedSource = true;
      setStatus('正在加载播放源...');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          container.classList.add('is-ready');
          setStatus('播放源已就绪，正在播放。');
        });

        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放源加载失败，请刷新页面后重试。');
          }
        });

        return Promise.resolve();
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        container.classList.add('is-ready');
        setStatus('播放源已就绪，正在播放。');
        return Promise.resolve();
      }

      video.src = source;
      setStatus('当前浏览器可能不支持 HLS，请使用新版 Chrome、Edge、Firefox 或 Safari。');
      return Promise.resolve();
    }

    function playVideo() {
      attachSource().then(function () {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.then === 'function') {
          playPromise
            .then(function () {
              container.classList.add('is-playing');
              setStatus('正在播放。');
            })
            .catch(function () {
              container.classList.remove('is-playing');
              setStatus('浏览器阻止了自动播放，请再次点击播放按钮。');
            });
        }
      });
    }

    if (startButton) {
      startButton.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
      container.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      container.classList.remove('is-playing');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initialisePlayer);
  });
})();
