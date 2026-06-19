const HLS_SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
let hlsLoader = null;

function loadHlsScript() {
    if (window.Hls) {
        return Promise.resolve(window.Hls);
    }

    if (hlsLoader) {
        return hlsLoader;
    }

    hlsLoader = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = HLS_SCRIPT_URL;
        script.async = true;
        script.onload = () => resolve(window.Hls);
        script.onerror = () => reject(new Error('HLS load failed'));
        document.head.appendChild(script);
    });

    return hlsLoader;
}

async function attachSource(video, source) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
    }

    const Hls = await loadHlsScript();

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsInstance = hls;
    } else {
        video.src = source;
    }
}

export function initMoviePlayer(source) {
    const video = document.getElementById('movie-player');
    const overlay = document.getElementById('play-overlay');

    if (!video || !source) {
        return;
    }

    let ready = false;

    const start = async () => {
        try {
            if (!ready) {
                ready = true;
                await attachSource(video, source);
            }

            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            await video.play();
        } catch (error) {
            if (overlay) {
                overlay.classList.remove('is-hidden');
            }
        }
    };

    if (overlay) {
        overlay.addEventListener('click', start);
    }

    video.addEventListener('click', () => {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener('play', () => {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });
}
