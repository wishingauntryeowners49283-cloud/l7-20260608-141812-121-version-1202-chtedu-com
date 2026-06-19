(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            if (slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        show(0);
        start();
    });

    document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-search-input]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-button]'));
        var noResults = scope.querySelector('[data-no-results]');
        var activeFilter = 'all';

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function apply() {
            var keyword = normalize(input ? input.value : '');
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var type = normalize(card.getAttribute('data-filter'));
                var matchText = !keyword || text.indexOf(keyword) !== -1;
                var matchFilter = activeFilter === 'all' || type === normalize(activeFilter);
                var show = matchText && matchFilter;
                card.classList.toggle('hidden-card', !show);
                if (show) {
                    visible += 1;
                }
            });
            if (noResults) {
                noResults.classList.toggle('visible', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.getAttribute('data-filter-button') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });

        apply();
    });
}());

function initMoviePlayer(sourceUrl) {
    var video = document.getElementById('movie-player');
    var frame = document.querySelector('[data-player]');
    var startButton = document.querySelector('[data-player-start]');
    var hlsInstance = null;
    var prepared = false;

    if (!video || !frame || !sourceUrl) {
        return;
    }

    function prepare() {
        if (prepared) {
            return;
        }
        prepared = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                } else {
                    destroyPlayer();
                }
            });
        } else {
            video.src = sourceUrl;
        }
    }

    function destroyPlayer() {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    }

    function play() {
        prepare();
        frame.classList.add('is-playing');
        var action = video.play();
        if (action && typeof action.catch === 'function') {
            action.catch(function () {
                frame.classList.remove('is-playing');
            });
        }
    }

    if (startButton) {
        startButton.addEventListener('click', play);
    }

    video.addEventListener('play', function () {
        frame.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
        if (!video.currentTime) {
            frame.classList.remove('is-playing');
        }
    });

    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });

    window.addEventListener('pagehide', destroyPlayer);
}
