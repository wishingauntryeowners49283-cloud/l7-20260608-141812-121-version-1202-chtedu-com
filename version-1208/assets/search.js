(function () {
    var form = document.querySelector('[data-global-search-form]');
    var input = document.querySelector('[data-global-search-input]');
    var results = document.querySelector('[data-search-results]');
    var movies = window.MOVIE_INDEX || [];

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function posterStyle(movie) {
        return "background-image: linear-gradient(180deg, rgba(15, 23, 42, 0.04), rgba(15, 23, 42, 0.76)), url('./" + movie.cover + "');";
    }

    function renderCard(movie) {
        return '' +
            '<article class="movie-card">' +
                '<a class="poster-link" href="' + movie.url + '" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
                    '<span class="poster" role="img" aria-label="' + escapeHtml(movie.title) + '封面" style="' + posterStyle(movie) + '">' +
                        '<span class="poster-play">▶</span>' +
                        '<span class="poster-duration">' + escapeHtml(movie.duration) + '</span>' +
                    '</span>' +
                '</a>' +
                '<div class="movie-card-body">' +
                    '<div class="movie-card-meta">' +
                        '<span>' + escapeHtml(movie.year) + '</span>' +
                        '<span>' + escapeHtml(movie.region) + '</span>' +
                        '<span>' + escapeHtml(movie.type) + '</span>' +
                    '</div>' +
                    '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
                    '<p>' + escapeHtml(movie.oneLine || '') + '</p>' +
                    '<div class="tag-row">' +
                        '<span class="tag">' + escapeHtml(movie.category) + '</span>' +
                        '<span class="tag">' + escapeHtml(movie.genre) + '</span>' +
                    '</div>' +
                '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function search(query) {
        var q = normalize(query);
        var items;

        if (!q) {
            items = movies.slice(0, 60);
        } else {
            items = movies.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.category,
                    (movie.tags || []).join(' '),
                    movie.oneLine
                ].join(' '));

                return haystack.indexOf(q) !== -1;
            }).slice(0, 120);
        }

        results.innerHTML = items.map(renderCard).join('');
    }

    if (form && input && results) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;
        search(initial);

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var value = input.value || '';
            var nextUrl = window.location.pathname + (value ? '?q=' + encodeURIComponent(value) : '');
            window.history.replaceState(null, '', nextUrl);
            search(value);
        });

        input.addEventListener('input', function () {
            search(input.value);
        });
    }
})();
