(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    var hero = document.querySelector('[data-hero-slider]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    show(0);
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function setupFiltering() {
    var filterInput = document.querySelector('[data-page-filter]');
    var sortSelect = document.querySelector('[data-page-sort]');
    var countNode = document.querySelector('[data-filter-count]');
    var grid = document.querySelector('[data-card-grid]');
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }
    function update() {
      var query = normalize(filterInput ? filterInput.value : '');
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var isVisible = !query || text.indexOf(query) !== -1;
        card.classList.toggle('hide-by-filter', !isVisible);
        if (isVisible) {
          visible += 1;
        }
      });
      if (countNode) {
        countNode.textContent = String(visible);
      }
    }
    function sortCards() {
      if (!sortSelect) {
        return;
      }
      var mode = sortSelect.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === 'year') {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        }
        if (mode === 'rating') {
          return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
        }
        return Number(b.getAttribute('data-weight')) - Number(a.getAttribute('data-weight'));
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      cards = sorted;
      update();
    }
    if (filterInput) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        filterInput.value = q;
      }
      filterInput.addEventListener('input', update);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', sortCards);
      sortCards();
    } else {
      update();
    }
  }

  function setupPlayer() {
    var shell = document.querySelector('[data-video-src]');
    if (!shell) {
      return;
    }
    var video = shell.querySelector('video');
    var button = shell.querySelector('.player-start');
    var source = shell.getAttribute('data-video-src');
    var attached = false;
    function attach() {
      if (attached || !video || !source) {
        return;
      }
      attached = true;
      shell.classList.add('is-ready');
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
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
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }
    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        attach();
      });
    }
    shell.addEventListener('click', function (event) {
      if (event.target === video && attached) {
        return;
      }
      attach();
    });
  }

  ready(function () {
    setupNavigation();
    setupHeroSlider();
    setupFiltering();
    setupPlayer();
  });
})();
