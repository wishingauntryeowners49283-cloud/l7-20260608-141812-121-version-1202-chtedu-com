(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function text(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupHero() {
        var tiles = Array.prototype.slice.call(document.querySelectorAll(".hero-tile"));
        if (!tiles.length) {
            return;
        }
        var index = 0;
        tiles[0].classList.add("is-active");
        window.setInterval(function () {
            tiles[index].classList.remove("is-active");
            index = (index + 1) % tiles.length;
            tiles[index].classList.add("is-active");
        }, 3200);
    }

    function applyFilters(scope) {
        var grid = scope.querySelector(".filter-grid");
        if (!grid) {
            return;
        }
        var input = scope.querySelector(".page-filter-input");
        var selects = Array.prototype.slice.call(scope.querySelectorAll(".page-filter-select"));
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        var empty = scope.querySelector(".empty-state");
        var query = text(input ? input.value : "");
        var visible = 0;
        cards.forEach(function (card) {
            var haystack = text([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-tags")
            ].join(" "));
            var matched = !query || haystack.indexOf(query) !== -1;
            selects.forEach(function (select) {
                var value = text(select.value);
                var key = select.getAttribute("data-filter");
                if (value && text(card.getAttribute("data-" + key)) !== value) {
                    matched = false;
                }
            });
            card.style.display = matched ? "" : "none";
            if (matched) {
                visible += 1;
            }
        });
        if (empty) {
            empty.style.display = visible ? "none" : "block";
        }
    }

    function setupFiltering() {
        var sections = Array.prototype.slice.call(document.querySelectorAll(".page-section"));
        sections.forEach(function (section) {
            if (!section.querySelector(".filter-grid")) {
                return;
            }
            var input = section.querySelector(".page-filter-input");
            var selects = Array.prototype.slice.call(section.querySelectorAll(".page-filter-select"));
            if (input) {
                input.addEventListener("input", function () {
                    applyFilters(section);
                });
            }
            selects.forEach(function (select) {
                select.addEventListener("change", function () {
                    applyFilters(section);
                });
            });
            applyFilters(section);
        });
    }

    function setupSearchPage() {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        var mainInput = document.getElementById("search-page-input");
        var filterInput = document.querySelector(".page-filter-input");
        if (mainInput && q) {
            mainInput.value = q;
        }
        if (filterInput && q) {
            filterInput.value = q;
            var section = filterInput.closest(".page-section");
            if (section) {
                applyFilters(section);
            }
        }
    }

    function createHls(video, source, shell) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                    video.src = source;
                }
            });
            shell.hlsPlayer = hls;
            return;
        }
        video.src = source;
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
        shells.forEach(function (shell) {
            var video = shell.querySelector("video");
            var cover = shell.querySelector(".player-cover");
            var source = shell.getAttribute("data-stream");
            if (!video || !source) {
                return;
            }
            var started = false;
            function play() {
                if (!started) {
                    createHls(video, source, shell);
                    started = true;
                }
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }
            if (cover) {
                cover.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                if (!started || video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                if (cover) {
                    cover.classList.add("is-hidden");
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFiltering();
        setupSearchPage();
        setupPlayers();
    });
})();
