document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var carousel = document.querySelector("[data-hero-carousel]");

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-card-search]"));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-btn]"));
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
  var activeFilter = "all";

  function applyCardFilter() {
    var keyword = searchInputs.map(function (input) {
      return input.value.trim().toLowerCase();
    }).filter(Boolean).join(" ");

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-meta") || "",
        card.getAttribute("data-tags") || ""
      ].join(" ").toLowerCase();
      var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchesFilter = activeFilter === "all" || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
      card.classList.toggle("hidden-card", !(matchesKeyword && matchesFilter));
    });
  }

  searchInputs.forEach(function (input) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query && !input.value) {
      input.value = query;
    }

    input.addEventListener("input", applyCardFilter);
  });

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.getAttribute("data-filter-btn") || "all";

      filterButtons.forEach(function (item) {
        item.classList.toggle("is-active", item === button);
      });

      applyCardFilter();
    });
  });

  if (searchInputs.length || filterButtons.length) {
    applyCardFilter();
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (player) {
    var video = player.querySelector("video");
    var overlay = player.querySelector(".play-overlay");
    var attached = false;
    var mediaEngine = null;

    if (!video || !overlay) {
      return;
    }

    function attachStream() {
      if (attached) {
        return;
      }

      attached = true;
      var streamUrl = video.getAttribute("data-hls");

      if (!streamUrl) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        mediaEngine = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        mediaEngine.loadSource(streamUrl);
        mediaEngine.attachMedia(video);
        return;
      }

      video.src = streamUrl;
    }

    function startPlayback() {
      attachStream();
      player.classList.add("is-playing");
      video.play().catch(function () {
        player.classList.remove("is-playing");
      });
    }

    overlay.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
      if (!attached) {
        startPlayback();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (mediaEngine) {
        mediaEngine.destroy();
      }
    });
  });
});
