(function() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', function() {
            const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
            mobileToggle.setAttribute('aria-expanded', String(!expanded));
            mobileMenu.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let current = 0;
        let timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function() {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilter(input, extraTerm) {
        const scope = input.closest('[data-filter-scope]') || document;
        const cards = Array.from(scope.querySelectorAll('[data-movie-card]'));
        const term = normalize(extraTerm || input.value);

        cards.forEach(function(card) {
            const haystack = normalize(card.getAttribute('data-search'));
            card.hidden = term.length > 0 && !haystack.includes(term);
        });
    }

    const query = new URLSearchParams(window.location.search).get('q') || '';
    const filterInputs = Array.from(document.querySelectorAll('[data-movie-filter]'));

    filterInputs.forEach(function(input) {
        if (query) {
            input.value = query;
        }
        applyFilter(input);
        input.addEventListener('input', function() {
            applyFilter(input);
        });
    });

    Array.from(document.querySelectorAll('[data-search-form]')).forEach(function(form) {
        form.addEventListener('submit', function(event) {
            const target = form.getAttribute('data-search-target');
            const input = form.querySelector('input[type="search"], input[name="q"], [data-movie-filter]');

            if (!input) {
                return;
            }

            if (target) {
                event.preventDefault();
                const term = input.value.trim();
                const separator = target.includes('?') ? '&' : '?';
                window.location.href = term ? target + separator + 'q=' + encodeURIComponent(term) : target;
                return;
            }

            event.preventDefault();
            applyFilter(input);
        });
    });

    Array.from(document.querySelectorAll('[data-filter-term]')).forEach(function(button) {
        button.addEventListener('click', function() {
            const scope = button.closest('[data-filter-scope]') || document;
            const input = scope.querySelector('[data-movie-filter]');
            if (input) {
                input.value = button.getAttribute('data-filter-term') || '';
                applyFilter(input);
            }
        });
    });
})();
