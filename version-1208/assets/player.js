(function () {
    var hlsPromise = null;

    function loadHlsScript() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsPromise) {
            return hlsPromise;
        }

        hlsPromise = new Promise(function (resolve, reject) {
            var existing = document.querySelector('script[data-hls-loader]');

            if (existing) {
                existing.addEventListener('load', function () {
                    resolve(window.Hls);
                });
                existing.addEventListener('error', reject);
                return;
            }

            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
            script.async = true;
            script.setAttribute('data-hls-loader', 'true');
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = function () {
                reject(new Error('HLS 播放组件加载失败'));
            };
            document.head.appendChild(script);
        });

        return hlsPromise;
    }

    function setStatus(box, text) {
        var status = box.querySelector('[data-player-status]');

        if (status) {
            status.textContent = text;
        }
    }

    function startPlayer(box) {
        var video = box.querySelector('video');
        var button = box.querySelector('[data-play-button]');
        var source = box.getAttribute('data-video-src');

        if (!video || !source) {
            setStatus(box, '未找到可用播放源。');
            return;
        }

        if (button) {
            button.classList.add('hidden');
        }

        setStatus(box, '正在连接播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.play().catch(function () {
                setStatus(box, '播放已就绪，请再次点击视频播放。');
            });
            setStatus(box, '播放源已加载。');
            return;
        }

        loadHlsScript()
            .then(function (Hls) {
                if (Hls && Hls.isSupported()) {
                    var hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });

                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, function () {
                        setStatus(box, '播放源已加载。');
                        video.play().catch(function () {
                            setStatus(box, '播放已就绪，请再次点击视频播放。');
                        });
                    });
                    hls.on(Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus(box, '播放遇到网络或格式问题，可刷新页面后重试。');
                            hls.destroy();
                        }
                    });
                } else {
                    video.src = source;
                    setStatus(box, '当前浏览器已尝试使用原生播放。');
                }
            })
            .catch(function () {
                video.src = source;
                setStatus(box, '已尝试使用浏览器原生播放。');
            });
    }

    document.querySelectorAll('.video-player').forEach(function (box) {
        var button = box.querySelector('[data-play-button]');

        if (button) {
            button.addEventListener('click', function () {
                startPlayer(box);
            });
        }
    });
})();
