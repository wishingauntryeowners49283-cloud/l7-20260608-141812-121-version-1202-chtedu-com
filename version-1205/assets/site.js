(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var navPanel = document.querySelector("[data-nav-panel]");
        if (menuButton && navPanel) {
            menuButton.addEventListener("click", function () {
                navPanel.classList.toggle("open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, itemIndex) {
                    slide.classList.toggle("active", itemIndex === current);
                });
                dots.forEach(function (dot, itemIndex) {
                    dot.classList.toggle("active", itemIndex === current);
                });
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    restart();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    restart();
                });
            }

            show(0);
            restart();
        }

        document.querySelectorAll(".catalog-section, .ranking-section").forEach(function (section) {
            var search = section.querySelector("[data-search-input]");
            var year = section.querySelector("[data-filter-year]");
            var category = section.querySelector("[data-filter-category]");
            var empty = section.querySelector("[data-empty-state]");
            var cards = Array.prototype.slice.call(section.querySelectorAll("[data-card]"));

            function applyFilters() {
                var query = search ? search.value.trim().toLowerCase() : "";
                var selectedYear = year ? year.value : "";
                var selectedCategory = category ? category.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var text = [
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.genre,
                        card.dataset.year,
                        card.dataset.category,
                        card.textContent
                    ].join(" ").toLowerCase();
                    var matchedQuery = !query || text.indexOf(query) !== -1;
                    var matchedYear = !selectedYear || card.dataset.year === selectedYear;
                    var matchedCategory = !selectedCategory || card.dataset.category === selectedCategory;
                    var matched = matchedQuery && matchedYear && matchedCategory;
                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [search, year, category].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });
        });
    });
})();
