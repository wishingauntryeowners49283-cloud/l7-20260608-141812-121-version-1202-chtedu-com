(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                restart();
            });
        }

        restart();
    }

    var filterRoot = document.querySelector('[data-filter-root]');

    if (filterRoot) {
        var queryInput = filterRoot.querySelector('[data-filter-query]');
        var yearSelect = filterRoot.querySelector('[data-filter-year]');
        var genreInput = filterRoot.querySelector('[data-filter-genre]');
        var resetButton = filterRoot.querySelector('[data-filter-reset]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var count = document.querySelector('[data-filter-count]');

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var query = normalize(queryInput && queryInput.value);
            var year = normalize(yearSelect && yearSelect.value);
            var genre = normalize(genreInput && genreInput.value);
            var visible = 0;

            cards.forEach(function (card) {
                var title = normalize(card.getAttribute('data-title'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardGenre = normalize(card.getAttribute('data-genre'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var text = normalize(card.textContent);
                var matchQuery = !query || title.indexOf(query) !== -1 || text.indexOf(query) !== -1 || cardRegion.indexOf(query) !== -1;
                var matchYear = !year || cardYear === year;
                var matchGenre = !genre || cardGenre.indexOf(genre) !== -1 || text.indexOf(genre) !== -1;
                var shouldShow = matchQuery && matchYear && matchGenre;

                card.style.display = shouldShow ? '' : 'none';

                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = String(visible);
            }
        }

        [queryInput, yearSelect, genreInput].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                if (queryInput) {
                    queryInput.value = '';
                }

                if (yearSelect) {
                    yearSelect.value = '';
                }

                if (genreInput) {
                    genreInput.value = '';
                }

                applyFilter();
            });
        }
    }
})();
