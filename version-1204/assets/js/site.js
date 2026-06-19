(() => {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', () => {
            mobileNav.classList.toggle('open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let current = 0;

        const showSlide = (index) => {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('active', dotIndex === current);
            });
        };

        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                showSlide(Number(dot.dataset.heroDot || 0));
            });
        });

        if (slides.length > 1) {
            window.setInterval(() => {
                showSlide(current + 1);
            }, 5200);
        }
    }

    const normalise = (value) => String(value || '').trim().toLowerCase();

    const buildSearchItem = (item) => {
        const link = document.createElement('a');
        link.href = item.url;
        link.className = 'search-item';
        link.innerHTML = `
            <img src="${item.cover}" alt="${item.title}" loading="lazy">
            <span>
                <strong>${item.title}</strong>
                <span>${item.year} · ${item.region} · ${item.type}</span>
            </span>
        `;
        return link;
    };

    const bindGlobalSearch = (input) => {
        const wrapper = input.closest('.header-search, .wide-search');
        const panel = wrapper ? wrapper.querySelector('[data-search-panel]') : null;

        if (!panel) {
            return;
        }

        input.addEventListener('input', () => {
            const keyword = normalise(input.value);
            panel.innerHTML = '';

            if (!keyword) {
                panel.classList.remove('open');
                return;
            }

            const index = Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];
            const results = index.filter((item) => {
                const target = normalise([
                    item.title,
                    item.year,
                    item.region,
                    item.type,
                    item.category,
                    item.tags
                ].join(' '));
                return target.includes(keyword);
            }).slice(0, 12);

            if (results.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'search-item';
                empty.textContent = '没有找到匹配影片';
                panel.appendChild(empty);
            } else {
                results.forEach((item) => panel.appendChild(buildSearchItem(item)));
            }

            panel.classList.add('open');
        });

        document.addEventListener('click', (event) => {
            if (!wrapper.contains(event.target)) {
                panel.classList.remove('open');
            }
        });
    };

    document.querySelectorAll('[data-global-search]').forEach(bindGlobalSearch);

    const bindPageFilter = () => {
        const scope = document.querySelector('[data-filter-scope]');
        const cards = scope ? Array.from(scope.querySelectorAll('[data-movie-card]')) : [];
        const keywordInput = document.querySelector('[data-page-filter]');
        const yearSelect = document.querySelector('[data-filter-year]');
        const typeSelect = document.querySelector('[data-filter-type]');
        const empty = document.querySelector('[data-empty-state]');

        if (!scope || cards.length === 0) {
            return;
        }

        const apply = () => {
            const keyword = normalise(keywordInput ? keywordInput.value : '');
            const year = yearSelect ? normalise(yearSelect.value) : '';
            const type = typeSelect ? normalise(typeSelect.value) : '';
            let visible = 0;

            cards.forEach((card) => {
                const target = normalise([
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.tags
                ].join(' '));
                const yearMatch = !year || normalise(card.dataset.year) === year;
                const typeMatch = !type || target.includes(type);
                const keywordMatch = !keyword || target.includes(keyword);
                const show = yearMatch && typeMatch && keywordMatch;
                card.classList.toggle('is-hidden-by-filter', !show);
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('open', visible === 0);
            }
        };

        [keywordInput, yearSelect, typeSelect].forEach((element) => {
            if (element) {
                element.addEventListener('input', apply);
                element.addEventListener('change', apply);
            }
        });
    };

    bindPageFilter();
})();
