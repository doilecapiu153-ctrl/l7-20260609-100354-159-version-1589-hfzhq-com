(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupPlayer(player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-player-start]");
    var status = player.querySelector("[data-player-status]");
    var source = player.getAttribute("data-src");
    var hlsInstance = null;

    if (!video || !button || !source) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function attachSource() {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        setStatus("播放器已使用浏览器原生 HLS 模式加载。");
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        setStatus("播放器已使用 HLS.js 加载 m3u8 播放源。" );
        return Promise.resolve();
      }

      setStatus("当前浏览器不支持 HLS 播放，请更换浏览器或检查播放源。")
      return Promise.reject(new Error("HLS is not supported"));
    }

    function play() {
      player.classList.add("is-playing");
      attachSource()
        .then(function () {
          return video.play();
        })
        .then(function () {
          setStatus("正在播放。")
        })
        .catch(function () {
          player.classList.remove("is-playing");
          setStatus("播放未能自动开始，请再次点击播放按钮或检查网络播放源。")
        });
    }

    button.addEventListener("click", play);

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
  });
})();
