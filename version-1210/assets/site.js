(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    var filterPanel = document.querySelector('[data-filter-panel]');

    if (filterPanel) {
        var filterInput = filterPanel.querySelector('[data-filter-input]');
        var yearFilter = filterPanel.querySelector('[data-year-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list] .movie-card'));

        function applyFilter() {
            var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
            var year = yearFilter ? yearFilter.value : '';

            cards.forEach(function (card) {
                var content = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre')
                ].join(' ').toLowerCase();
                var cardYear = card.getAttribute('data-year');
                var matchKeyword = !keyword || content.indexOf(keyword) !== -1;
                var matchYear = !year || cardYear === year;

                card.hidden = !(matchKeyword && matchYear);
            });
        }

        if (filterInput) {
            filterInput.addEventListener('input', applyFilter);
        }

        if (yearFilter) {
            yearFilter.addEventListener('change', applyFilter);
        }
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('search');
    var resultSection = document.getElementById('search-results');
    var resultBox = document.querySelector('[data-search-results]');

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (character) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[character];
        });
    }

    function createResultCard(item) {
        var title = escapeHtml(item.title);
        var file = escapeHtml(item.file);
        var cover = escapeHtml(item.cover);
        var category = escapeHtml(item.category);
        var duration = escapeHtml(item.duration);
        var text = escapeHtml(item.text);
        var year = escapeHtml(item.year);
        var region = escapeHtml(item.region);
        var rating = escapeHtml(item.rating);

        return [
            '<article class="movie-card">',
            '<a class="card-poster" href="./' + file + '">',
            '<img src="' + cover + '" alt="' + title + '" loading="lazy">',
            '<span class="card-play">▶</span>',
            '<span class="card-category">' + category + '</span>',
            '<span class="card-duration">' + duration + '</span>',
            '</a>',
            '<div class="card-body">',
            '<a class="card-title" href="./' + file + '">' + title + '</a>',
            '<p>' + text + '</p>',
            '<div class="card-meta">',
            '<span>' + year + ' · ' + region + '</span>',
            '<span>' + rating + ' 分</span>',
            '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    if (query && resultSection && resultBox && window.FIRST_VIDEO_INDEX) {
        var normalized = query.trim().toLowerCase();
        var results = window.FIRST_VIDEO_INDEX.filter(function (item) {
            return item.search.indexOf(normalized) !== -1;
        }).slice(0, 80);

        resultSection.hidden = false;
        resultBox.innerHTML = results.length
            ? results.map(createResultCard).join('')
            : '<p>未找到相关影片。</p>';
    }
})();
