function initMoviePlayer(streamUrl) {
    var video = document.querySelector('[data-player-video]');
    var overlay = document.querySelector('[data-player-overlay]');
    var hls = null;
    var ready = false;

    if (!video || !overlay || !streamUrl) {
        return;
    }

    function prepare() {
        if (ready) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }

        ready = true;
    }

    function start() {
        prepare();
        overlay.classList.add('is-hidden');

        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {
                overlay.classList.remove('is-hidden');
            });
        }
    }

    overlay.addEventListener('click', start);

    video.addEventListener('click', function () {
        if (!ready || video.paused) {
            start();
        }
    });

    video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
    });

    video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
            overlay.classList.remove('is-hidden');
        }
    });
}
