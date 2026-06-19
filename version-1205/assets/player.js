(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        document.querySelectorAll("[data-player-box]").forEach(function (box) {
            var video = box.querySelector("video");
            var button = box.querySelector("[data-player-start]");
            var status = box.querySelector("[data-player-status]");
            var prepared = false;

            function setStatus(text) {
                if (status) {
                    status.textContent = text || "";
                }
            }

            function canUseNativeHls() {
                return video && video.canPlayType && video.canPlayType("application/vnd.apple.mpegurl");
            }

            function prepareSource() {
                if (!video || prepared) {
                    return;
                }

                var hls = video.getAttribute("data-hls");
                var mp4 = video.getAttribute("data-mp4");

                if (hls && canUseNativeHls()) {
                    video.src = hls;
                    setStatus("高清播放已就绪");
                } else if (mp4) {
                    video.src = mp4;
                    setStatus("高清播放已就绪");
                } else if (hls) {
                    video.src = hls;
                    setStatus("高清播放已就绪");
                }

                prepared = true;
            }

            function startPlayback() {
                prepareSource();
                if (!video) {
                    return;
                }
                var playPromise = video.play();
                box.classList.add("is-playing");
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        box.classList.remove("is-playing");
                        setStatus("点击视频控件继续播放");
                    });
                }
            }

            if (button) {
                button.addEventListener("click", startPlayback);
            }

            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        startPlayback();
                    }
                });
                video.addEventListener("play", function () {
                    box.classList.add("is-playing");
                    setStatus("");
                });
                video.addEventListener("pause", function () {
                    if (!video.ended) {
                        box.classList.remove("is-playing");
                    }
                });
            }
        });
    });
})();
