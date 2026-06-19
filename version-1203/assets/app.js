(function () {
  var hlsLoader = null;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsLoader) {
      return hlsLoader;
    }
    hlsLoader = new Promise(function (resolve) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
      script.async = true;
      script.onload = function () {
        resolve(window.Hls || null);
      };
      script.onerror = function () {
        resolve(null);
      };
      document.head.appendChild(script);
    });
    return hlsLoader;
  }

  function attachVideo(video, source) {
    if (!video || !source) {
      return Promise.resolve();
    }
    if (video.dataset.ready === "1") {
      return Promise.resolve();
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.dataset.ready = "1";
      return Promise.resolve();
    }
    return loadHls().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        return new Promise(function (resolve) {
          var hls = new Hls({
            lowLatencyMode: true,
            backBufferLength: 90
          });
          video._hlsInstance = hls;
          hls.attachMedia(video);
          hls.on(Hls.Events.MEDIA_ATTACHED, function () {
            hls.loadSource(source);
          });
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.dataset.ready = "1";
            resolve();
          });
          setTimeout(function () {
            video.dataset.ready = "1";
            resolve();
          }, 1800);
        });
      }
      video.src = source;
      video.dataset.ready = "1";
      return Promise.resolve();
    });
  }

  function startPlayer(shell) {
    var video = shell.querySelector("video");
    var cover = shell.querySelector("[data-play-button]");
    var source = video ? video.getAttribute("data-video-src") : "";
    if (cover) {
      cover.classList.add("is-hidden");
    }
    attachVideo(video, source).then(function () {
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
    });
  }

  function setupPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (shell) {
      var button = shell.querySelector("[data-play-button]");
      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          startPlayer(shell);
        });
      }
      shell.addEventListener("click", function (event) {
        if (event.target === shell) {
          startPlayer(shell);
        }
      });
    });
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("active", idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("active", idx === current);
      });
    }

    function schedule() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        show(idx);
        schedule();
      });
    });

    if (slides.length > 1) {
      schedule();
    }
  }

  function setupLocalFilter() {
    var input = document.querySelector(".local-filter-input");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-chip]"));
    if (!input || !cards.length) {
      return;
    }
    var activeChip = "";

    function apply() {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var matchText = !query || text.indexOf(query) !== -1;
        var matchChip = !activeChip || text.indexOf(activeChip) !== -1;
        card.classList.toggle("is-hidden", !(matchText && matchChip));
      });
    }

    input.addEventListener("input", apply);
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("active");
        });
        chip.classList.add("active");
        activeChip = (chip.getAttribute("data-chip") || "").toLowerCase();
        apply();
      });
    });
  }

  function cardTemplate(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="play-corner">▶</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <a href="' + movie.url + '" class="movie-title">' + escapeHtml(movie.title) + '</a>',
      '    <p class="movie-line">' + escapeHtml(movie.one_line) + '</p>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '    <div class="tag-row"><span>' + escapeHtml(movie.category_name) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var container = document.querySelector("[data-search-results]");
    if (!container || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim().toLowerCase();
    var title = document.querySelector("[data-search-title]");
    var formInput = document.querySelector(".large-search-form input[name='q']");
    if (formInput) {
      formInput.value = query;
    }
    if (!query) {
      var initial = window.SEARCH_MOVIES.slice(0, 36);
      container.innerHTML = initial.map(cardTemplate).join("");
      if (title) {
        title.textContent = "热门推荐";
      }
      return;
    }
    var results = window.SEARCH_MOVIES.filter(function (movie) {
      var text = [movie.title, movie.region, movie.genre, movie.year, movie.type, movie.category_name, movie.one_line, (movie.tags || []).join(" ")].join(" ").toLowerCase();
      return text.indexOf(query) !== -1;
    }).slice(0, 120);
    container.innerHTML = results.map(cardTemplate).join("");
    if (title) {
      title.textContent = "“" + query + "”相关结果";
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupLocalFilter();
    setupPlayers();
    setupSearchPage();
  });
})();
