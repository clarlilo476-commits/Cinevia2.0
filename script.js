// CHAVES DE API EMBUTIDAS DIRETAMENTE NO CÓDIGO
        let TMDB_API_KEY = localStorage.getItem('tmdb_api_key') || '23072480c9c99e9f8c5f652f3c3de734';
        const OMDB_API_KEY = '61e993b7';

        const BASE_URL = 'https://api.themoviedb.org/3';
        const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';

        let currentMode = 'home';
        let currentSearchQuery = '';
        let currentCategory = 'all';
        let currentPage = 1;
        let totalPages = 1;
        let currentGenreSearch = null; // Guarda a configuração da pesquisa inteligente por gênero (ex.: "anime", "dorama", "terror", "ação").

        let searchTimeout;
        const searchInput = document.getElementById('searchInput');

        // LÓGICA DO CARROSSEL
        let heroSlides = [];
        let currentHeroSlide = 0;
        let heroInterval;

        // --- PESQUISA INTELIGENTE POR GÊNERO ---
        // Permite que termos como "anime", "dorama", "terror" ou "ação" tragam direto os
        // filmes/séries mais bem avaliados daquele gênero, em vez de uma busca textual comum.
        const GENRE_SEARCH_MAP = {
            // Gêneros disponíveis no Cinévia (mesmos do filtro avançado), com sinônimos comuns.
            'acao': { movieGenre: 28, tvGenre: 10759, label: 'Ação' },
            'ação': { movieGenre: 28, tvGenre: 10759, label: 'Ação' },
            'acoes': { movieGenre: 28, tvGenre: 10759, label: 'Ação' },
            'ações': { movieGenre: 28, tvGenre: 10759, label: 'Ação' },
            'aventura': { movieGenre: 12, tvGenre: 10759, label: 'Aventura' },
            'aventuras': { movieGenre: 12, tvGenre: 10759, label: 'Aventura' },
            'comedia': { movieGenre: 35, tvGenre: 35, label: 'Comédia' },
            'comédia': { movieGenre: 35, tvGenre: 35, label: 'Comédia' },
            'comedias': { movieGenre: 35, tvGenre: 35, label: 'Comédia' },
            'drama': { movieGenre: 18, tvGenre: 18, label: 'Drama' },
            'dramas': { movieGenre: 18, tvGenre: 18, label: 'Drama' },
            'terror': { movieGenre: 27, label: 'Terror' },
            'horror': { movieGenre: 27, label: 'Terror' },
            'medo': { movieGenre: 27, label: 'Terror' },
            'assustador': { movieGenre: 27, label: 'Terror' },
            'assombrado': { movieGenre: 27, label: 'Terror' },
            'romance': { movieGenre: 10749, label: 'Romance' },
            'romances': { movieGenre: 10749, label: 'Romance' },
            'ficcao cientifica': { movieGenre: 878, tvGenre: 10765, label: 'Ficção Científica' },
            'ficção científica': { movieGenre: 878, tvGenre: 10765, label: 'Ficção Científica' },
            'ficcao': { movieGenre: 878, tvGenre: 10765, label: 'Ficção Científica' },
            'ficção': { movieGenre: 878, tvGenre: 10765, label: 'Ficção Científica' },
            'sci-fi': { movieGenre: 878, tvGenre: 10765, label: 'Ficção Científica' },
            'scifi': { movieGenre: 878, tvGenre: 10765, label: 'Ficção Científica' },
            'fantasia': { movieGenre: 14, tvGenre: 10765, label: 'Fantasia' },
            'animacao': { movieGenre: 16, tvGenre: 16, label: 'Animação' },
            'animação': { movieGenre: 16, tvGenre: 16, label: 'Animação' },
            'animado': { movieGenre: 16, tvGenre: 16, label: 'Animação' },
            'anime': { movieGenre: 16, tvGenre: 16, originLanguage: 'ja', label: 'Anime' },
            'animes': { movieGenre: 16, tvGenre: 16, originLanguage: 'ja', label: 'Anime' },
            'dorama': { tvGenre: 18, originLanguage: 'ko', label: 'Doramas' },
            'doramas': { tvGenre: 18, originLanguage: 'ko', label: 'Doramas' },
            'kdrama': { tvGenre: 18, originLanguage: 'ko', label: 'Doramas' },
            'k-drama': { tvGenre: 18, originLanguage: 'ko', label: 'Doramas' },
            'novela coreana': { tvGenre: 18, originLanguage: 'ko', label: 'Doramas' },
            'crime': { movieGenre: 80, tvGenre: 80, label: 'Crime' },
            'policial': { movieGenre: 80, tvGenre: 80, label: 'Crime' },
            'policiais': { movieGenre: 80, tvGenre: 80, label: 'Crime' },
            'documentario': { movieGenre: 99, tvGenre: 99, label: 'Documentário' },
            'documentário': { movieGenre: 99, tvGenre: 99, label: 'Documentário' },
            'documentarios': { movieGenre: 99, tvGenre: 99, label: 'Documentário' },
            'mistério': { movieGenre: 9648, tvGenre: 9648, label: 'Mistério' },
            'misterio': { movieGenre: 9648, tvGenre: 9648, label: 'Mistério' },
            'suspense': { movieGenre: 9648, tvGenre: 9648, label: 'Mistério' },
            'thriller': { movieGenre: 9648, tvGenre: 9648, label: 'Mistério' },
            'faroeste': { movieGenre: 37, tvGenre: 37, label: 'Faroeste' },
            'western': { movieGenre: 37, tvGenre: 37, label: 'Faroeste' },
            'familia': { movieGenre: 10751, tvGenre: 10751, label: 'Família' },
            'família': { movieGenre: 10751, tvGenre: 10751, label: 'Família' },
            // Categorias extras pedidas: Infantil, Halloween e Natal/Natalino.
            'infantil': { movieGenre: 10751, tvGenre: 10762, label: 'Infantil' },
            'infantis': { movieGenre: 10751, tvGenre: 10762, label: 'Infantil' },
            'criança': { movieGenre: 10751, tvGenre: 10762, label: 'Infantil' },
            'crianças': { movieGenre: 10751, tvGenre: 10762, label: 'Infantil' },
            'halloween': { movieGenre: 27, keywordQuery: 'halloween', label: 'Halloween' },
            'natal': { movieGenre: 10751, tvGenre: 10751, keywordQuery: 'christmas', label: 'Natal' },
            'natalino': { movieGenre: 10751, tvGenre: 10751, keywordQuery: 'christmas', label: 'Natal' },
            'natalina': { movieGenre: 10751, tvGenre: 10751, keywordQuery: 'christmas', label: 'Natal' },
            'natalinos': { movieGenre: 10751, tvGenre: 10751, keywordQuery: 'christmas', label: 'Natal' },
            'natalinas': { movieGenre: 10751, tvGenre: 10751, keywordQuery: 'christmas', label: 'Natal' },
            'natal/natalino': { movieGenre: 10751, tvGenre: 10751, keywordQuery: 'christmas', label: 'Natal' }
        };

        function normalizeSearchTerm(str) {
            return (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
        }

        function matchGenreSearch(query) {
            const normalized = normalizeSearchTerm(query);
            if (GENRE_SEARCH_MAP[normalized]) return GENRE_SEARCH_MAP[normalized];
            const words = normalized.split(/\s+/);
            const wordKey = Object.keys(GENRE_SEARCH_MAP).find(k => words.includes(normalizeSearchTerm(k)));
            if (wordKey) return GENRE_SEARCH_MAP[wordKey];
            // Também reconhece chaves com mais de uma palavra quando aparecem dentro da busca (ex.: "novela coreana").
            const phraseKey = Object.keys(GENRE_SEARCH_MAP).find(k => k.includes(' ') && normalized.includes(normalizeSearchTerm(k)));
            return phraseKey ? GENRE_SEARCH_MAP[phraseKey] : null;
        }

        async function resolveKeywordId(term) {
            try {
                const res = await fetch(`${BASE_URL}/search/keyword?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(term)}&page=1`);
                const data = await res.json();
                const match = (data.results || [])[0];
                return match ? match.id : null;
            } catch (error) {
                console.warn('Não foi possível resolver a palavra-chave do TMDB:', term, error);
                return null;
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            initProfileSystem();
            initHeroCarousel();
            refreshFilterGenreOptions();
            updateMyListCount();
            fetchContent();

            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                const query = e.target.value.trim();

                searchTimeout = setTimeout(() => {
                    if (query.length > 2) {
                        const genreConfig = matchGenreSearch(query);
                        currentPage = 1;
                        currentSearchQuery = query;
                        hideCategories();
                        document.querySelector('.hero').style.display = 'none';
                        if (genreConfig) {
                            currentMode = 'genresearch';
                            currentGenreSearch = genreConfig;
                            document.getElementById('sectionTitle').innerText = `Melhores de ${genreConfig.label}`;
                        } else {
                            currentMode = 'search';
                            currentGenreSearch = null;
                            // Título provisório: fetchSmartTextSearch troca para "Elenco: Nome" se a busca for de um(a) ator/atriz.
                            document.getElementById('sectionTitle').innerText = `Resultados para "${query}"`;
                        }
                        fetchContent();
                    } else if (query.length === 0 && (currentMode === 'search' || currentMode === 'genresearch')) {
                        loadHome();
                    }
                }, 500);
            });
        });

        /* --- CARROSSEL EM TELA CHEIA (ESTILO IMDB) --- */
        async function initHeroCarousel() {
            if(!TMDB_API_KEY) return;
            try {
                const requests = [
                    fetch(`${BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`).then(r => r.json()),
                    fetch(`${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=pt-BR&region=BR&page=1`).then(r => r.json()),
                    fetch(`${BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=pt-BR&region=BR&page=1`).then(r => r.json()),
                    fetch(`${BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=pt-BR&region=BR&page=1`).then(r => r.json()),
                    fetch(`${BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`).then(r => r.json())
                ];

                const datasets = await Promise.all(requests);
                const seen = new Set();
                const merged = [];

                datasets.flatMap(data => data.results || []).forEach(item => {
                    const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
                    const key = `${type}-${item.id}`;
                    if (item.backdrop_path && item.poster_path && !seen.has(key)) {
                        seen.add(key);
                        merged.push({ ...item, media_type: type });
                    }
                });

                heroSlides = merged.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0)).slice(0, 31);

                const container = document.getElementById('heroCarouselContainer');
                if(heroSlides.length === 0) return;

                let slidesHTML = '';
                heroSlides.forEach((item, index) => {
                    const title = item.title || item.name;
                    const overview = item.overview || 'Explore os detalhes desta obra incrível no catálogo.';
                    const backdrop = `https://image.tmdb.org/t/p/original${item.backdrop_path}`;
                    const poster = `${IMG_BASE_URL}${item.poster_path}`;
                    const type = item.media_type === 'tv' ? 'tv' : 'movie';
                    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

                    slidesHTML += `
                        <div class="hero-slide ${index === 0 ? 'active' : ''}">
                            <div class="hero-bg" style="background-image: url('${backdrop}')"></div>
                            <div class="hero-content-wrapper">
                                <img src="${poster}" class="hero-poster" alt="${title}" onclick="openDetails(${item.id}, '${type}')" />
                                <div class="hero-text">
                                    <h1>${title}</h1>
                                    <div class="modal-tags" style="margin-bottom: 0.8rem;">
                                        <span class="tag"><i class="fa-solid fa-star" style="color:#f5c518"></i> ${rating}</span>
                                        <span class="tag">${type === 'tv' ? 'Série' : 'Filme'}</span>
                                    </div>
                                    <p>${overview}</p>
                                </div>
                            </div>
                        </div>
                    `;
                });

                container.innerHTML = slidesHTML + `
                    <div class="hero-arrows">
                        <button onclick="changeHeroSlide(-1)"><i class="fa-solid fa-chevron-left"></i></button>
                        <button onclick="changeHeroSlide(1)"><i class="fa-solid fa-chevron-right"></i></button>
                    </div>
                `;

                currentHeroSlide = 0;
                clearInterval(heroInterval);
                startHeroInterval();
            } catch (error) {
                console.error("Erro no carrossel", error);
            }
        }

        function changeHeroSlide(direction) {
            const slides = document.querySelectorAll('.hero-slide');
            if(slides.length === 0) return;

            slides[currentHeroSlide].classList.remove('active');
            currentHeroSlide = (currentHeroSlide + direction + slides.length) % slides.length;
            slides[currentHeroSlide].classList.add('active');

            resetHeroInterval();
        }

        function startHeroInterval() {
            heroInterval = setInterval(() => { changeHeroSlide(1); }, 5000);
        }

        function resetHeroInterval() {
            clearInterval(heroInterval);
            startHeroInterval();
        }

        // --- FAIXAS DA HOME: lançamentos do ano, melhores avaliados e filmes (com aleatorização) ---
        function cineviaShuffle(arr) {
            return arr.sort(() => Math.random() - 0.5);
        }

        async function fetchHomeBestReleases() {
            const currentYear = new Date().getFullYear();
            const samplePages = cineviaShuffle([1,2,3,4,5,6,7,8]).slice(0, 3);
            const history = JSON.parse(sessionStorage.getItem('cinevia_home_page_history') || '[]');
            const recentIds = new Set(history.slice(-5).flat().map(String));
            const requests = [];
            samplePages.forEach(page => {
                requests.push(fetch(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=pt-BR&region=BR&sort_by=vote_average.desc&vote_count.gte=100&primary_release_date.gte=${currentYear}-01-01&primary_release_date.lte=${currentYear}-12-31&page=${page}`).then(r => r.json()).then(d => ({ d, type: 'movie' })));
                requests.push(fetch(`${BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&language=pt-BR&sort_by=vote_average.desc&vote_count.gte=20&first_air_date.gte=${currentYear}-01-01&first_air_date.lte=${currentYear}-12-31&page=${page}`).then(r => r.json()).then(d => ({ d, type: 'tv' })));
            });
            const datasets = await Promise.all(requests);
            const seen = new Set();
            let candidates = [];
            datasets.forEach(({ d, type }) => (d.results || []).forEach(item => {
                const key = `${type}-${item.id}`;
                if (item.poster_path && !seen.has(key) && !recentIds.has(key)) { seen.add(key); candidates.push({ ...item, media_type: type }); }
            }));
            const pageItems = cineviaShuffle(candidates).slice(0, 20);
            renderGrid(pageItems.length ? pageItems : candidates.slice(0, 20));
            history.push(pageItems.map(item => `${item.media_type}-${item.id}`));
            sessionStorage.setItem('cinevia_home_page_history', JSON.stringify(history.slice(-5)));
            totalPages = 500;
            updatePagination();
        }

        async function fetchHomeTopRated() {
            const samplePages = cineviaShuffle([1,2,3,4,5,6,7,8,9,10]).slice(0, 3);
            const history = JSON.parse(sessionStorage.getItem('cinevia_home_page_history') || '[]');
            const recentIds = new Set(history.slice(-5).flat().map(String));
            const requests = [];
            samplePages.forEach(page => {
                requests.push(fetch(`${BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=pt-BR&region=BR&page=${page}`).then(r => r.json()).then(d => ({ d, type: 'movie' })));
                requests.push(fetch(`${BASE_URL}/tv/top_rated?api_key=${TMDB_API_KEY}&language=pt-BR&page=${page}`).then(r => r.json()).then(d => ({ d, type: 'tv' })));
            });
            const datasets = await Promise.all(requests);
            const seen = new Set();
            let candidates = [];
            datasets.forEach(({ d, type }) => (d.results || []).forEach(item => {
                const key = `${type}-${item.id}`;
                if (item.poster_path && !seen.has(key) && !recentIds.has(key)) { seen.add(key); candidates.push({ ...item, media_type: type }); }
            }));
            const pageItems = cineviaShuffle(candidates).slice(0, 20);
            renderGrid(pageItems.length ? pageItems : candidates.slice(0, 20));
            history.push(pageItems.map(item => `${item.media_type}-${item.id}`));
            sessionStorage.setItem('cinevia_home_page_history', JSON.stringify(history.slice(-5)));
            totalPages = 500;
            updatePagination();
        }

        async function fetchHomeMoviesOnly() {
            const sorts = ['popularity.desc', 'vote_average.desc', 'revenue.desc'];
            const samplePages = cineviaShuffle(Array.from({ length: 20 }, (_, i) => i + 1)).slice(0, 4);
            const history = JSON.parse(sessionStorage.getItem('cinevia_home_page_history') || '[]');
            const recentIds = new Set(history.slice(-5).flat().map(String));
            const requests = samplePages.map(page => {
                const sort = sorts[Math.floor(Math.random() * sorts.length)];
                return fetch(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=pt-BR&sort_by=${sort}&vote_count.gte=80&page=${page}`).then(r => r.json());
            });
            const datasets = await Promise.all(requests);
            const seen = new Set();
            let candidates = [];
            datasets.forEach(d => (d.results || []).forEach(item => {
                const key = `movie-${item.id}`;
                if (item.poster_path && !seen.has(key) && !recentIds.has(key)) { seen.add(key); candidates.push({ ...item, media_type: 'movie' }); }
            }));
            const pageItems = cineviaShuffle(candidates).slice(0, 20);
            renderGrid(pageItems.length ? pageItems : candidates.slice(0, 20));
            history.push(pageItems.map(item => `${item.media_type}-${item.id}`));
            sessionStorage.setItem('cinevia_home_page_history', JSON.stringify(history.slice(-5)));
            totalPages = 500;
            updatePagination();
        }

        async function fetchContent() {
            const grid = document.getElementById('resultsGrid');
            const pagination = document.getElementById('paginationContainer');
            if (!TMDB_API_KEY) return;

            grid.innerHTML = '<div class="message-box"><div class="spinner"></div><p style="margin-top:15px;">A carregar dados...</p></div>';
            pagination.style.display = 'none';

            let url = '';

            if (currentMode === 'home') {
                // Faixas de página da Home: 1–5 melhores lançamentos do ano, 5–10 melhores avaliados, 10–15 somente filmes.
                try {
                    if (currentPage <= 5) {
                        document.getElementById('sectionTitle').innerText = `Melhores Lançamentos de ${new Date().getFullYear()}`;
                        await fetchHomeBestReleases();
                        return;
                    } else if (currentPage <= 10) {
                        document.getElementById('sectionTitle').innerText = 'Melhores Avaliados';
                        await fetchHomeTopRated();
                        return;
                    } else if (currentPage <= 15) {
                        document.getElementById('sectionTitle').innerText = 'Filmes Selecionados';
                        await fetchHomeMoviesOnly();
                        return;
                    }
                } catch (e) { console.warn('Falha ao montar a Home por faixa de página; usando descoberta aleatória.', e); }
                // A partir da página 16, mantém a descoberta aleatória original: embaralha resultados de páginas/ordenações variadas e evita IDs vistos nas últimas cinco páginas.
                try {
                    const history = JSON.parse(sessionStorage.getItem('cinevia_home_page_history') || '[]');
                    const recentIds = new Set(history.slice(-5).flat().map(String));
                    const pageChoices = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
                    const sorts = ['popularity.desc','vote_average.desc','primary_release_date.desc','revenue.desc'];
                    const shuffle = arr => arr.sort(() => Math.random() - 0.5);
                    const requests = shuffle(pageChoices).slice(0, 4).map(page => {
                        const sort = sorts[Math.floor(Math.random() * sorts.length)];
                        return fetch(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=pt-BR&sort_by=${sort}&vote_count.gte=80&page=${page}`).then(r => r.json());
                    });
                    const batches = await Promise.all(requests);
                    let candidates = batches.flatMap(d => d.results || []).filter(item => item.poster_path && !recentIds.has(`movie-${item.id}`));
                    const seen = new Set();
                    candidates = shuffle(candidates).filter(item => { if (seen.has(item.id)) return false; seen.add(item.id); item.media_type='movie'; return true; });
                    if (candidates.length < 12) {
                        const extra = await fetch(`${BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}&language=pt-BR&page=${Math.floor(Math.random()*20)+1}`).then(r => r.json());
                        candidates = candidates.concat((extra.results || []).filter(item => item.poster_path && !recentIds.has(`${item.media_type || (item.title?'movie':'tv')}-${item.id}`)).map(item => ({...item, media_type:item.media_type || (item.title?'movie':'tv')})));
                    }
                    const pageItems = candidates.slice(0,20);
                    renderGrid(pageItems);
                    history.push(pageItems.map(item => `${item.media_type || 'movie'}-${item.id}`));
                    sessionStorage.setItem('cinevia_home_page_history', JSON.stringify(history.slice(-5)));
                    totalPages = 500;
                    updatePagination();
                    return;
                } catch(e) { console.warn('Falha na aleatorização da Home.', e); }
                url = `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=pt-BR&sort_by=popularity.desc&page=${currentPage}`;
            } else if (currentMode === 'trending') {
                url = `${BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}&language=pt-BR&page=${currentPage}`;
            } else if (currentMode === 'search') {
                await fetchSmartTextSearch();
                return;
            } else if (currentMode === 'categories') {
                url = `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=pt-BR&with_genres=${currentCategory}&page=${currentPage}`;
            } else if (currentMode === 'movies') {
                url = `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=pt-BR&region=BR&sort_by=popularity.desc&vote_count.gte=50&page=${currentPage}`;
            } else if (currentMode === 'cinema') {
                url = `${BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=pt-BR&region=BR&page=${currentPage}`;
            } else if (currentMode === 'streaming') {
                url = `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=pt-BR&region=BR&watch_region=BR&with_watch_monetization_types=flatrate%7Cfree%7Cads&sort_by=popularity.desc&page=${currentPage}`;
            } else if (currentMode === 'series') {
                url = `${BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&language=pt-BR&sort_by=popularity.desc&vote_count.gte=50&page=${currentPage}`;
            } else if (currentMode === 'genresearch') {
                await fetchGenreSearch();
                return;
            } else if (currentMode === 'mylist') {
                await fetchMyList();
                return;
            } else if (currentMode === 'recommendations') {
                await fetchRecommendations();
                return;
            } else if (currentMode === 'filters') {
                await fetchFilteredContent();
                return;
            }

            try {
                const response = await fetch(url);
                const data = await response.json();

                if (data.results && data.results.length > 0) {
                    totalPages = data.total_pages;
                    renderGrid(data.results);
                    updatePagination();
                } else {
                    grid.innerHTML = '<div class="message-box">Nenhum resultado encontrado.</div>';
                }
            } catch (error) {
                showError("Erro de conexão. Verifique sua API Key.");
            }
        }

        // --- MINHA LISTA / FAVORITOS ---
        // getFavoriteItems substituído pela função isolada do sistema de perfil local

        function updateMyListCount() {
            const el = document.getElementById('myListCount');
            if (el) el.textContent = getFavoriteItems().length ? `(${getFavoriteItems().length})` : '';
        }

        function isFavorite(id, type) {
            return getFavoriteItems().some(item => Number(item.id) === Number(id) && item.type === type);
        }

        function toggleFavorite(id, type, title = '') {
            const favorites = getFavoriteItems();
            const index = favorites.findIndex(item => Number(item.id) === Number(id) && item.type === type);
            if (index >= 0) favorites.splice(index, 1);
            else favorites.unshift({ id: Number(id), type, title });
            saveFavoriteItems(favorites.slice(0, 50));
            updateMyListCount();
            renderCurrentListState();
            const modal = document.getElementById('detailsModal');
            if (modal?.classList.contains('active') && modal.querySelector('.modal-title')) {
                // Atualiza apenas o conteúdo atual do modal para refletir o estado do favorito.
                openDetails(id, type);
            }
        }

        function renderCurrentListState() {
            if (currentMode === 'mylist') fetchContent();
        }

        async function fetchMyList() {
            const grid = document.getElementById('resultsGrid');
            const pagination = document.getElementById('paginationContainer');
            pagination.style.display = 'none';
            const favorites = getFavoriteItems();
            if (!favorites.length) {
                grid.innerHTML = '<div class="message-box"><i class="fa-regular fa-heart" style="font-size:2rem;color:var(--accent);margin-bottom:12px;"></i><br>Sua Minha Lista está vazia.<br><span style="font-size:0.9rem;">Adicione filmes e séries usando o coração.</span></div>';
                return;
            }
            try {
                const results = await Promise.all(favorites.slice(0, 30).map(async item => {
                    const response = await fetch(`${BASE_URL}/${item.type}/${item.id}?api_key=${TMDB_API_KEY}&language=pt-BR`);
                    const data = await response.json();
                    return { ...data, media_type: item.type };
                }));
                renderGrid(results.filter(item => item && item.id));
            } catch (error) {
                showError('Não foi possível carregar sua Minha Lista.');
            }
        }

        // --- RECOMENDAÇÕES ---
        async function fetchRecommendations() {
            const grid = document.getElementById('resultsGrid');
            const pagination = document.getElementById('paginationContainer');
            pagination.style.display = 'none';
            const favorites = getFavoriteItems();
            try {
                let pool = [];
                const seeds = favorites.slice(0, 5);
                if (seeds.length) {
                    const responses = await Promise.all(seeds.map(item => fetch(`${BASE_URL}/${item.type}/${item.id}/recommendations?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`).then(r => r.json()).catch(() => ({results:[]}))));
                    responses.forEach(data => { pool.push(...(data.results || [])); });
                } else {
                    const trending = await fetch(`${BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`).then(r => r.json());
                    pool = trending.results || [];
                }
                const seen = new Set(favorites.map(item => `${item.type}-${item.id}`));
                const unique = [];
                pool.forEach(item => {
                    const type = item.media_type || (item.title ? 'movie' : 'tv');
                    const key = `${type}-${item.id}`;
                    if (!seen.has(key) && !unique.some(x => `${x.media_type}-${x.id}` === key) && (item.poster_path || item.backdrop_path)) {
                        unique.push({ ...item, media_type: type });
                    }
                });
                const sorted = unique.sort((a,b) => (b.vote_average || 0) - (a.vote_average || 0)).slice(0, 24);
                if (!sorted.length) {
                    grid.innerHTML = '<div class="message-box">Ainda não há recomendações suficientes.</div>';
                    return;
                }
                renderGrid(sorted);
            } catch (error) {
                showError('Não foi possível gerar recomendações agora.');
            }
        }

        // --- FILTROS AVANÇADOS ---
        const movieGenreOptions = [
            ['', 'Todos'], ['28|10759', 'Ação / Ação e Aventura'], ['12|10759', 'Aventura'], ['16|16', 'Animação'], ['35|35', 'Comédia'], ['80|80', 'Crime'], ['99|99', 'Documentário'], ['18|18', 'Drama'], ['10751|10751', 'Família'], ['14|10765', 'Fantasia'], ['27|', 'Terror'], ['9648|9648', 'Mistério'], ['878|10765', 'Ficção Científica'], ['10749|10749', 'Romance'], ['37|37', 'Faroeste']
        ];

        function refreshFilterGenreOptions() {
            const select = document.getElementById('filterGenre');
            if (!select) return;
            const type = document.getElementById('filterType')?.value || 'all';
            select.innerHTML = movieGenreOptions.map(([value, label]) => {
                if (type === 'tv' && value === '27|') return '';
                const actual = type === 'movie' ? (value.split('|')[0] || '') : type === 'tv' ? (value.split('|')[1] || '') : value;
                return `<option value="${actual}">${label}</option>`;
            }).join('');
        }

        function toggleFilters() {
            document.getElementById('filterPanel')?.classList.toggle('active');
        }

        function resetFilters() {
            document.getElementById('filterType').value = 'all';
            document.getElementById('filterFromYear').value = '';
            document.getElementById('filterToYear').value = '';
            document.getElementById('filterRating').value = '';
            document.getElementById('filterLanguage').value = '';
            document.getElementById('filterSort').value = 'popularity.desc';
            document.getElementById('filterVotes').value = '';
            refreshFilterGenreOptions();
            document.getElementById('filterGenre').value = '';
        }

        function applyFilters() {
            currentMode = 'filters';
            currentPage = 1;
            currentSearchQuery = '';
            searchInput.value = '';
            document.querySelector('.hero').style.display = 'none';
            hideCategories();
            setActiveNav('navHome');
            document.getElementById('sectionTitle').innerText = 'Resultados filtrados';
            fetchContent();
        }

        async function fetchFilteredContent() {
            const grid = document.getElementById('resultsGrid');
            const pagination = document.getElementById('paginationContainer');
            const type = document.getElementById('filterType').value;
            const genre = document.getElementById('filterGenre').value;
            const fromYear = document.getElementById('filterFromYear').value;
            const toYear = document.getElementById('filterToYear').value;
            const rating = document.getElementById('filterRating').value;
            const language = document.getElementById('filterLanguage').value;
            const sort = document.getElementById('filterSort').value;
            const votes = document.getElementById('filterVotes').value;
            const requests = [];
            const genreParts = genre ? genre.split('|') : ['', ''];
            const movieGenre = genreParts[0] || '';
            const tvGenre = genreParts[1] || '';

            const buildMovie = () => {
                const params = new URLSearchParams({ api_key: TMDB_API_KEY, language: 'pt-BR', region: 'BR', page: String(currentPage), sort_by: sort });
                if (movieGenre) params.set('with_genres', movieGenre);
                if (fromYear) params.set('primary_release_date.gte', `${fromYear}-01-01`);
                if (toYear) params.set('primary_release_date.lte', `${toYear}-12-31`);
                if (rating) params.set('vote_average.gte', rating);
                if (language) params.set('with_original_language', language);
                if (votes) params.set('vote_count.gte', votes);
                return fetch(`${BASE_URL}/discover/movie?${params}`).then(r => r.json());
            };
            const buildTv = () => {
                let tvSort = sort === 'primary_release_date.desc' ? 'first_air_date.desc' : sort;
                const params = new URLSearchParams({ api_key: TMDB_API_KEY, language: 'pt-BR', page: String(currentPage), sort_by: tvSort });
                if (tvGenre) params.set('with_genres', tvGenre);
                if (fromYear) params.set('first_air_date.gte', `${fromYear}-01-01`);
                if (toYear) params.set('first_air_date.lte', `${toYear}-12-31`);
                if (rating) params.set('vote_average.gte', rating);
                if (language) params.set('with_original_language', language);
                if (votes) params.set('vote_count.gte', votes);
                return fetch(`${BASE_URL}/discover/tv?${params}`).then(r => r.json());
            };

            if (type === 'movie') requests.push(buildMovie());
            else if (type === 'tv') requests.push(buildTv());
            else { requests.push(buildMovie()); requests.push(buildTv()); }

            try {
                const datasets = await Promise.all(requests);
                const results = [];
                let maxPages = 1;
                datasets.forEach((data, idx) => {
                    maxPages = Math.max(maxPages, data.total_pages || 1);
                    (data.results || []).forEach(item => results.push({ ...item, media_type: idx === 0 && type !== 'all' ? type : (idx === 0 ? 'movie' : 'tv') }));
                });
                results.sort((a,b) => (b.popularity || 0) - (a.popularity || 0));
                totalPages = Math.min(maxPages, 500);
                renderGrid(results);
                updatePagination();
            } catch (error) {
                showError('Não foi possível aplicar os filtros.');
            }
        }

        // --- PESQUISA INTELIGENTE POR GÊNERO (RESULTADO) ---
        async function fetchGenreSearch() {
            const grid = document.getElementById('resultsGrid');
            const pagination = document.getElementById('paginationContainer');
            const config = currentGenreSearch;
            if (!config) {
                grid.innerHTML = '<div class="message-box">Nenhum resultado encontrado.</div>';
                pagination.style.display = 'none';
                return;
            }
            try {
                // Para categorias temáticas sem gênero oficial no TMDB (Halloween, Natal), resolve a keyword real da API.
                const keywordId = config.keywordQuery ? await resolveKeywordId(config.keywordQuery) : null;
                const requests = [];
                if (config.movieGenre || keywordId) {
                    const params = new URLSearchParams({ api_key: TMDB_API_KEY, language: 'pt-BR', region: 'BR', sort_by: 'vote_average.desc', 'vote_count.gte': '100', page: String(currentPage) });
                    if (keywordId) params.set('with_keywords', String(keywordId));
                    else if (config.movieGenre) params.set('with_genres', String(config.movieGenre));
                    if (config.originLanguage) params.set('with_original_language', config.originLanguage);
                    requests.push(fetch(`${BASE_URL}/discover/movie?${params}`).then(r => r.json()).then(d => ({ d, type: 'movie' })));
                }
                if (config.tvGenre || keywordId) {
                    const params = new URLSearchParams({ api_key: TMDB_API_KEY, language: 'pt-BR', sort_by: 'vote_average.desc', 'vote_count.gte': '30', page: String(currentPage) });
                    if (keywordId) params.set('with_keywords', String(keywordId));
                    else if (config.tvGenre) params.set('with_genres', String(config.tvGenre));
                    if (config.originLanguage) params.set('with_original_language', config.originLanguage);
                    requests.push(fetch(`${BASE_URL}/discover/tv?${params}`).then(r => r.json()).then(d => ({ d, type: 'tv' })));
                }
                const datasets = await Promise.all(requests);
                let merged = [];
                let maxPages = 1;
                datasets.forEach(({ d, type }) => {
                    maxPages = Math.max(maxPages, d.total_pages || 1);
                    (d.results || []).forEach(item => { if (item.poster_path) merged.push({ ...item, media_type: type }); });
                });
                merged.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
                if (!merged.length) {
                    grid.innerHTML = `<div class="message-box">Nenhum resultado encontrado para "${config.label}".</div>`;
                    pagination.style.display = 'none';
                    return;
                }
                renderGrid(merged);
                totalPages = Math.min(maxPages, 500);
                updatePagination();
            } catch (error) {
                showError(`Não foi possível buscar por "${config.label}" agora.`);
            }
        }

        // --- PESQUISA POR TEXTO, COM DETECÇÃO DE ATOR/ATRIZ ---
        // Se o termo buscado corresponder ao nome de uma pessoa no TMDB, mostra os filmes/séries
        // em que ela está no Elenco. Caso contrário, cai na busca normal por título.
        async function fetchSmartTextSearch() {
            const grid = document.getElementById('resultsGrid');
            const pagination = document.getElementById('paginationContainer');
            const query = currentSearchQuery;
            try {
                const personRes = await fetch(`${BASE_URL}/search/person?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}&page=1`);
                const personData = await personRes.json();
                const topPerson = (personData.results || [])[0];
                const normalizedQuery = normalizeSearchTerm(query);

                if (topPerson && normalizeSearchTerm(topPerson.name) === normalizedQuery) {
                    const creditsRes = await fetch(`${BASE_URL}/person/${topPerson.id}/combined_credits?api_key=${TMDB_API_KEY}&language=pt-BR`);
                    const creditsData = await creditsRes.json();
                    const seen = new Set();
                    const castItems = (creditsData.cast || []).filter(item => {
                        if (!item.poster_path || (item.media_type !== 'movie' && item.media_type !== 'tv')) return false;
                        const key = `${item.media_type}-${item.id}`;
                        if (seen.has(key)) return false;
                        seen.add(key);
                        return true;
                    }).sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

                    if (castItems.length) {
                        document.getElementById('sectionTitle').innerText = `Elenco: ${topPerson.name}`;
                        const perPage = 20;
                        totalPages = Math.max(1, Math.ceil(castItems.length / perPage));
                        const pageItems = castItems.slice((currentPage - 1) * perPage, currentPage * perPage);
                        renderGrid(pageItems);
                        updatePagination();
                        return;
                    }
                }
            } catch (error) {
                console.warn('Falha na pesquisa por ator/atriz; usando busca padrão.', error);
            }

            // Busca padrão por título (comportamento original) quando não é reconhecido como ator/atriz.
            try {
                const response = await fetch(`${BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}&page=${currentPage}`);
                const data = await response.json();
                if (data.results && data.results.length > 0) {
                    totalPages = data.total_pages;
                    renderGrid(data.results);
                    updatePagination();
                } else {
                    grid.innerHTML = '<div class="message-box">Nenhum resultado encontrado.</div>';
                }
            } catch (error) {
                showError('Erro de conexão. Verifique sua API Key.');
            }
        }

        // --- CINÉVIA SCORE ---
        function calculateCineviaScore(item) {
            const rating = Number(item.vote_average || 0);
            const votes = Number(item.vote_count || 0);
            const popularity = Number(item.popularity || 0);
            const ratingBase = Math.min(100, Math.max(0, rating * 10));
            const confidence = Math.min(100, Math.log10(votes + 1) / 4 * 100);
            const popularityBonus = Math.min(100, Math.log10(popularity + 1) / 3 * 100);
            const score = (ratingBase * 0.72) + (confidence * 0.18) + (popularityBonus * 0.10);
            return Math.round(score);
        }

        // --- TRAILERS ---
        function findBestTrailer(videos) {
            const usable = (videos || []).filter(v => v.site === 'YouTube' && v.key && ['Trailer','Teaser'].includes(v.type));
            if (!usable.length) return null;
            return usable.sort((a,b) => Number(Boolean(b.official)) - Number(Boolean(a.official)) || (a.type === 'Trailer' ? -1 : 1))[0];
        }

        // Mantém uma lista de opções para o caso de um vídeo não permitir incorporação.
        let trailerCandidates = [];
        let trailerCandidateIndex = 0;
        let trailerPlayer = null;
        let trailerOpenRequestId = 0;
        let youtubeIframeApiPromise = null;
        let currentTrailerTitle = 'Trailer';

        function getTrailerCandidates(videos) {
            return (videos || [])
                .filter(video => video.site === 'YouTube' && video.key && ['Trailer', 'Teaser'].includes(video.type))
                .sort((a, b) =>
                    Number(Boolean(b.official)) - Number(Boolean(a.official)) ||
                    Number(b.type === 'Trailer') - Number(a.type === 'Trailer') ||
                    Number(b.iso_639_1 === 'pt') - Number(a.iso_639_1 === 'pt')
                );
        }

        function loadYouTubeIframeAPI() {
            if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
            if (youtubeIframeApiPromise) return youtubeIframeApiPromise;

            youtubeIframeApiPromise = new Promise((resolve, reject) => {
                const scriptUrl = 'https://www.youtube.com/iframe_api';
                const existingScript = Array.from(document.scripts).find(script => script.src === scriptUrl);
                const previousCallback = window.onYouTubeIframeAPIReady;

                window.onYouTubeIframeAPIReady = function () {
                    if (typeof previousCallback === 'function') {
                        try { previousCallback(); } catch (error) { console.error('Erro no callback anterior do player do YouTube:', error); }
                    }
                    if (window.YT && window.YT.Player) resolve(window.YT);
                    else {
                        youtubeIframeApiPromise = null;
                        reject(new Error('A API do player do YouTube não foi inicializada.'));
                    }
                };

                if (!existingScript) {
                    const script = document.createElement('script');
                    script.src = scriptUrl;
                    script.async = true;
                    script.onerror = () => {
                        script.remove();
                        youtubeIframeApiPromise = null;
                        reject(new Error('Não foi possível carregar a API do player do YouTube.'));
                    };
                    document.head.appendChild(script);
                }
            });

            return youtubeIframeApiPromise;
        }

        function destroyTrailerPlayer() {
            if (trailerPlayer && typeof trailerPlayer.destroy === 'function') {
                try { trailerPlayer.destroy(); } catch (error) { /* O player pode já ter sido removido pelo navegador. */ }
            }
            trailerPlayer = null;
        }

        function showTrailerFallback(message, trailer = trailerCandidates[trailerCandidateIndex]) {
            const wrap = document.getElementById('trailerFrameWrap');
            if (!wrap) return;
            destroyTrailerPlayer();
            wrap.innerHTML = '';

            const messageBox = document.createElement('div');
            messageBox.className = 'trailer-message';
            messageBox.style.minHeight = '100%';
            messageBox.style.display = 'flex';
            messageBox.style.flexDirection = 'column';
            messageBox.style.alignItems = 'center';
            messageBox.style.justifyContent = 'center';
            messageBox.style.gap = '1rem';
            messageBox.textContent = message;

            if (trailer && trailer.key) {
                const alternativeLink = document.createElement('a');
                alternativeLink.href = `https://www.youtube.com/watch?v=${encodeURIComponent(trailer.key)}`;
                alternativeLink.target = '_blank';
                alternativeLink.rel = 'noopener noreferrer';
                alternativeLink.className = 'trailer-fallback-link';
                alternativeLink.textContent = 'Abrir este trailer no YouTube';
                alternativeLink.style.display = 'inline-flex';
                alternativeLink.style.alignItems = 'center';
                alternativeLink.style.justifyContent = 'center';
                alternativeLink.style.marginTop = '0.25rem';
                alternativeLink.style.padding = '10px 16px';
                alternativeLink.style.borderRadius = '7px';
                alternativeLink.style.background = 'var(--accent)';
                alternativeLink.style.color = '#fff';
                alternativeLink.style.fontWeight = '800';
                alternativeLink.style.textDecoration = 'none';
                messageBox.appendChild(alternativeLink);
            }

            wrap.appendChild(messageBox);
        }

        function handleTrailerPlayerError(event, requestId) {
            if (requestId !== trailerOpenRequestId || !document.getElementById('trailerOverlay')?.classList.contains('active')) return;

            const errorCode = Number(event.data);
            const failedTrailer = trailerCandidates[trailerCandidateIndex];

            // Erros do vídeo (removido, inválido ou incorporação bloqueada): tenta outro trailer/teaser do TMDB.
            if ([2, 5, 100, 101, 150].includes(errorCode) && trailerCandidateIndex < trailerCandidates.length - 1) {
                trailerCandidateIndex++;
                const nextTrailer = trailerCandidates[trailerCandidateIndex];
                try {
                    if (trailerPlayer && typeof trailerPlayer.loadVideoById === 'function') {
                        trailerPlayer.loadVideoById(nextTrailer.key);
                        return;
                    }
                } catch (error) {
                    console.warn('Não foi possível carregar o próximo trailer incorporado:', error);
                }
            }

            if (errorCode === 153) {
                const message = window.location.protocol === 'file:'
                    ? 'O Cinévia foi aberto diretamente como arquivo local. O YouTube pode exigir um endereço HTTP/HTTPS para reproduzir o vídeo incorporado. Abra o projeto com um servidor local (por exemplo, Live Server) ou publique o site.'
                    : 'O YouTube não recebeu as informações de origem necessárias para o player incorporado. Verifique se o site está aberto por HTTP/HTTPS e se o navegador não está bloqueando essas informações.';
                showTrailerFallback(message, failedTrailer);
                return;
            }

            if ([101, 150].includes(errorCode)) {
                showTrailerFallback('Os trailers disponíveis encontrados para este filme não permitem reprodução incorporada. Isso é definido pelo responsável pelo vídeo.', trailerCandidates[trailerCandidateIndex]);
            } else if (errorCode === 100) {
                showTrailerFallback('Os trailers disponíveis estão removidos, privados ou indisponíveis para reprodução incorporada.', trailerCandidates[trailerCandidateIndex]);
            } else {
                showTrailerFallback('Não foi possível reproduzir este trailer dentro do Cinévia. O vídeo pode estar indisponível ou bloquear a incorporação.', trailerCandidates[trailerCandidateIndex] || failedTrailer);
            }
        }

        function createTrailerPlayer(requestId) {
            const wrap = document.getElementById('trailerFrameWrap');
            const trailer = trailerCandidates[trailerCandidateIndex];
            if (!wrap || !trailer || requestId !== trailerOpenRequestId) return;

            wrap.innerHTML = '';
            const iframe = document.createElement('iframe');
            iframe.id = 'cineviaYouTubePlayer';
            iframe.className = 'trailer-frame';
            const playerParams = new URLSearchParams({ autoplay: '1', enablejsapi: '1', rel: '0', playsinline: '1' });
            if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
                playerParams.set('origin', window.location.origin);
            }
            iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(trailer.key)}?${playerParams.toString()}`;
            iframe.title = `${currentTrailerTitle} — Trailer`;
            iframe.allow = 'autoplay; encrypted-media; picture-in-picture; web-share';
            iframe.allowFullscreen = true;
            iframe.referrerPolicy = 'strict-origin-when-cross-origin';
            wrap.appendChild(iframe);

            trailerPlayer = new YT.Player(iframe, {
                events: {
                    onError: event => handleTrailerPlayerError(event, requestId)
                }
            });
        }

        async function openTrailer(movieId, title = '') {
            currentTrailerTitle = title || document.querySelector('#modalContent .modal-title')?.textContent?.trim() || 'Trailer';
            const overlay = document.getElementById('trailerOverlay');
            const wrap = document.getElementById('trailerFrameWrap');
            const requestId = ++trailerOpenRequestId;

            destroyTrailerPlayer();
            trailerCandidates = [];
            trailerCandidateIndex = 0;
            document.getElementById('trailerTitle').textContent = `Trailer — ${currentTrailerTitle}`;
            wrap.innerHTML = '<div class="trailer-message"><div class="spinner"></div><p style="margin-top:12px;">Carregando trailer...</p></div>';
            overlay.classList.add('active');

            try {
                const response = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=pt-BR&include_video_language=pt-BR,en-US,null`);
                if (!response.ok) throw new Error('Não foi possível consultar os trailers no TMDB.');
                const data = await response.json();
                if (requestId !== trailerOpenRequestId) return;

                trailerCandidates = getTrailerCandidates(data.results || []);
                if (!trailerCandidates.length) {
                    wrap.innerHTML = '<div class="trailer-message">Este filme não possui um trailer disponível no TMDB.</div>';
                    return;
                }

                await loadYouTubeIframeAPI();
                if (requestId !== trailerOpenRequestId || !overlay.classList.contains('active')) return;
                createTrailerPlayer(requestId);
            } catch (error) {
                if (requestId !== trailerOpenRequestId) return;
                showTrailerFallback('Não foi possível iniciar o player incorporado. Verifique sua conexão e tente novamente.', trailerCandidates[0]);
            }
        }

        function closeTrailer(event) {
            if (event && event.target && !event.target.classList.contains('trailer-overlay')) return;
            trailerOpenRequestId++;
            const overlay = document.getElementById('trailerOverlay');
            const wrap = document.getElementById('trailerFrameWrap');
            overlay.classList.remove('active');
            destroyTrailerPlayer();
            trailerCandidates = [];
            trailerCandidateIndex = 0;
            wrap.innerHTML = '';
        }

        // --- SURPREENDA-ME ---
        async function surpriseMe() {
            try {
                const data = await fetch(`${BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`).then(r => r.json());
                const choices = (data.results || []).filter(item => item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv'));
                if (!choices.length) return;
                const pick = choices[Math.floor(Math.random() * choices.length)];
                openDetails(pick.id, pick.media_type);
            } catch (error) {
                showError('Não foi possível escolher uma recomendação agora.');
            }
        }

        function renderGrid(items) {
            const grid = document.getElementById('resultsGrid');
            grid.innerHTML = '';

            items.forEach(item => {
                if (!item.poster_path && !item.profile_path) return;

                const title = item.title || item.name;
                const date = item.release_date || item.first_air_date || '';
                const year = date ? date.split('-')[0] : 'N/A';
                const rating = item.vote_average ? item.vote_average.toFixed(1) : 'NR';
                const imagePath = item.poster_path || item.profile_path;
                const mediaType = item.media_type || (item.title ? 'movie' : 'tv');

                const card = document.createElement('div');
                card.className = 'card';
                card.onclick = () => openDetails(item.id, mediaType);

                card.innerHTML = `
                    <div class="card-img-wrapper">
                        <button class="favorite-btn ${isFavorite(item.id, mediaType) ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite(${item.id}, '${mediaType}');"><i class="fa-${isFavorite(item.id, mediaType) ? 'solid' : 'regular'} fa-heart"></i></button>
                        <img src="${IMG_BASE_URL}${imagePath}" alt="${title}" class="card-img" loading="lazy">
                        ${rating !== 'NR' ? `<div class="rating-badge"><i class="fa-solid fa-star"></i> ${rating}</div>` : ''}
                    </div>
                    <div class="card-info">
                        <h3 class="card-title">${title}</h3>
                        <div class="card-meta">${year} • ${mediaType === 'tv' ? 'Série' : 'Filme'} • <span class="cinevia-score">CV ${calculateCineviaScore(item)}</span></div>
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        /* --- DETALHES + INTEGRAÇÃO TMDB & OMDB + ONDE ASSISTIR --- */
        async function openDetails(id, type) {
            if (type === 'person') return;

            const modal = document.getElementById('detailsModal');
            const content = document.getElementById('modalContent');
            content.innerHTML = '<div style="padding: 4rem; width: 100%; text-align: center;"><div class="spinner"></div></div>';
            modal.classList.add('active');

            try {
                const detailsUrl = `${BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&language=pt-BR&append_to_response=release_dates,content_ratings,watch/providers,external_ids,credits,videos&include_video_language=pt-BR,en-US,null`;
                const res = await fetch(detailsUrl);
                const data = await res.json();

                let omdbData = null;
                const imdbId = data.imdb_id || data.external_ids?.imdb_id;
                if (imdbId && OMDB_API_KEY) {
                    try {
                        const omdbRes = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${imdbId}`);
                        omdbData = await omdbRes.json();
                    } catch(e) { console.error("Erro ao buscar dados do OMDb:", e); }
                }

                renderModal(data, type, omdbData);
            } catch (error) {
                content.innerHTML = '<div style="padding: 2rem; color: white;">Erro ao carregar detalhes.</div>';
            }
        }

        function renderModal(data, type, omdbData = null) {
            const content = document.getElementById('modalContent');
            const title = data.title || data.name;
            const overview = data.overview || 'Sinopse não disponível em português.';
            const poster = data.poster_path ? `${IMG_BASE_URL}${data.poster_path}` : 'https://via.placeholder.com/500x750?text=Sem+Imagem';

            const releaseDate = data.release_date || data.first_air_date || 'N/A';
            const year = releaseDate !== 'N/A' ? releaseDate.split('-')[0] : 'N/A';

            const duration = data.runtime ? `${data.runtime} min` : (data.episode_run_time && data.episode_run_time[0] ? `${data.episode_run_time[0]} min` : 'N/A');
            const status = data.status || 'N/A';

            let ageRating = 'Livre';
            let ageColor = '#4ade80';

            if (type === 'movie' && data.release_dates && data.release_dates.results) {
                const brRelease = data.release_dates.results.find(r => r.iso_3166_1 === 'BR');
                if (brRelease && brRelease.release_dates[0]?.certification) ageRating = brRelease.release_dates[0].certification;
            } else if (type === 'tv' && data.content_ratings && data.content_ratings.results) {
                const brRating = data.content_ratings.results.find(r => r.iso_3166_1 === 'BR');
                if (brRating) ageRating = brRating.rating;
            }

            if(ageRating === '18') ageColor = '#ef4444';
            else if(ageRating === '16') ageColor = '#f97316';
            else if(ageRating === '14' || ageRating === '12') ageColor = '#eab308';
            else if(ageRating === '10') ageColor = '#3b82f6';

            const genres = data.genres ? data.genres.map(g => `<span class="tag">${g.name}</span>`).join('') : '';

            let scoresHtml = `
                <div class="score-badge">
                    <i class="fa-solid fa-star" style="color: #f5c518"></i> TMDB: ${data.vote_average ? data.vote_average.toFixed(1) : 'N/A'}
                </div>
                <div class="score-badge">
                    <i class="fa-solid fa-clapperboard" style="color:var(--accent)"></i> Cinévia Score: <span class="cinevia-score">${calculateCineviaScore(data)}/100</span>
                </div>
            `;

            if (omdbData && omdbData.Response !== "False") {
                if (omdbData.imdbRating && omdbData.imdbRating !== 'N/A') {
                    scoresHtml += `
                        <div class="score-badge">
                            <i class="fa-brands fa-imdb" style="color: #f5c518"></i> IMDb: ${omdbData.imdbRating}
                        </div>
                    `;
                }
                if (omdbData.Ratings) {
                    const rt = omdbData.Ratings.find(r => r.Source === 'Rotten Tomatoes');
                    if (rt) {
                        scoresHtml += `
                            <div class="score-badge">
                                <i class="fa-solid fa-apple-whole" style="color: #fa320a"></i> Rotten: ${rt.Value}
                            </div>
                        `;
                    }
                }
            }

            let providersHtml = '';
            const watchProviders = data['watch/providers']?.results?.BR;
            if (watchProviders && (watchProviders.flatrate || watchProviders.rent || watchProviders.buy)) {
                const list = watchProviders.flatrate || watchProviders.rent || watchProviders.buy;
                const providerLoginUrl = (name) => {
                    const n = (name || '').toLowerCase();
                    const known = [
                        [/netflix/, 'https://www.netflix.com/login'],
                        [/prime video|amazon prime/, 'https://www.primevideo.com/'],
                        [/disney\+|disney plus/, 'https://www.disneyplus.com/login'],
                        [/max|hbo max/, 'https://www.max.com/'],
                        [/apple tv/, 'https://tv.apple.com/'],
                        [/globoplay/, 'https://globoplay.globo.com/'],
                        [/paramount\+|paramount plus/, 'https://www.paramountplus.com/'],
                        [/crunchyroll/, 'https://www.crunchyroll.com/login'],
                        [/mubi/, 'https://mubi.com/users/sign_in'],
                        [/telecine/, 'https://www.telecine.com.br/'],
                        [/youtube/, 'https://www.youtube.com/'],
                        [/pluto tv/, 'https://pluto.tv/'],
                        [/looke/, 'https://www.looke.com.br/'],
                        [/mercado play/, 'https://www.mercadolivre.com.br/'],
                        [/google play/, 'https://play.google.com/store/movies']
                    ];
                    return (known.find(([pattern]) => pattern.test(n)) || [null, null])[1];
                };
                const unmatchedProviders = list.filter(p => !providerLoginUrl(p.provider_name)).map(p => p.provider_name);
                const logosHtml = list.map(p => {
                    const href = providerLoginUrl(p.provider_name);
                    const logo = `<img src="${IMG_BASE_URL}${p.logo_path}" alt="${p.provider_name}" title="${p.provider_name}${href ? ' — abrir serviço' : ' — URL de acesso não configurada'}" class="provider-logo">`;
                    return href ? `<a class="provider-link" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="Abrir ${p.provider_name}">${logo}</a>` : `<span class="provider-link provider-link-unmapped" title="URL de acesso não configurada para ${p.provider_name}">${logo}<small>URL pendente</small></span>`;
                }).join('');
                if (unmatchedProviders.length) console.warn('[Cinévia] URLs de acesso pendentes para provedores:', [...new Set(unmatchedProviders)]);
                providersHtml = `
                    <div class="streaming-providers">
                        <span class="streaming-title">Disponível em:</span>
                        <div class="provider-logos">${logosHtml}</div>
                    </div>
                `;
            }

            // Informações adicionais de filmes: orçamento, receita, diretor e escritores.
            let advancedHtml = '';
            if (type === 'movie') {
                const director = (data.credits?.crew || []).filter(p => p.job === 'Director').map(p => p.name).filter((v, i, a) => a.indexOf(v) === i).join(', ') || 'Não informado';
                const writers = (data.credits?.crew || []).filter(p => ['Writer', 'Screenplay', 'Story'].includes(p.job)).map(p => p.name).filter((v, i, a) => a.indexOf(v) === i).join(', ') || 'Não informado';
                const budget = data.budget ? `US$ ${Number(data.budget).toLocaleString('en-US')}` : 'Não informado';
                const revenue = data.revenue ? `US$ ${Number(data.revenue).toLocaleString('en-US')}` : 'Não informado';
                const isFav = isFavorite(data.id, 'movie');
                const score = calculateCineviaScore(data);
                const trailerExists = findBestTrailer(data.videos?.results || []) !== null;
                const castPeople = (data.credits?.cast || []).filter(p => p.profile_path).slice(0, 12);
                advancedHtml = `
                    <details class="expandable-details">
                        <summary>Mais informações do filme</summary>
                        <div class="expandable-body">
                            <div class="feature-actions">
                                <button class="feature-btn ${trailerExists ? '' : 'disabled'}" ${trailerExists ? `onclick="openTrailer(${data.id})"` : 'disabled'}><i class="fa-solid fa-play"></i> ${trailerExists ? 'Assistir trailer' : 'Trailer indisponível'}</button>
                                <button class="favorite-detail-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite(${data.id}, 'movie')"><i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i> ${isFav ? 'Na Minha Lista' : 'Minha Lista'}</button>
                            </div>
                            <div class="crew-grid">
                                <div class="crew-item"><span>Diretor</span><strong>${director}</strong></div>
                                <div class="crew-item"><span>Escritor(es)</span><strong>${writers}</strong></div>
                                <div class="crew-item"><span>Orçamento</span><strong>${budget}</strong></div>
                                <div class="crew-item"><span>Receita</span><strong>${revenue}</strong></div>
                            </div>
                            <div class="crew-item"><span>Cinévia Score</span><strong class="cinevia-score">${score}/100</strong></div>
                        </div>
                    </details>
                `;
                if (castPeople.length) {
                    advancedHtml += `
                        <details class="expandable-details">
                            <summary>Elenco</summary>
                            <div class="expandable-body">
                                <div class="cast-grid">
                                    ${castPeople.map(p => `<div class="cast-card"><img class="cast-img" src="https://image.tmdb.org/t/p/w185${p.profile_path}" alt="${p.name}" loading="lazy"><div><div class="cast-name">${p.name}</div><div class="cast-character">${p.character || 'Personagem não informado'}</div></div></div>`).join('')}
                                </div>
                            </div>
                        </details>
                    `;
                }
            } else {
                const creators = data.created_by?.map(p => p.name).join(', ') || 'Não informado';
                const isFav = isFavorite(data.id, 'tv');
                const score = calculateCineviaScore(data);
                advancedHtml = `
                    <details class="expandable-details" id="episodesDetails" ontoggle="handleEpisodesToggle(${data.id}, this)">
                        <summary>Episódios e avaliações</summary>
                        <div class="expandable-body">
                            <div class="feature-actions">
                                <button class="favorite-detail-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite(${data.id}, 'tv')"><i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i> ${isFav ? 'Na Minha Lista' : 'Minha Lista'}</button>
                            </div>
                            <div class="crew-grid">
                                <div class="crew-item"><span>Criador(es)</span><strong>${creators}</strong></div>
                                <div class="crew-item"><span>Temporadas</span><strong>${data.number_of_seasons ?? 'N/A'}</strong></div>
                                <div class="crew-item"><span>Episódios</span><strong>${data.number_of_episodes ?? 'N/A'}</strong></div>
                                <div class="crew-item"><span>Status</span><strong>${status}</strong></div>
                            </div>
                            <div class="crew-item"><span>Cinévia Score</span><strong class="cinevia-score">${score}/100</strong></div>
                            <div class="episodes-toolbar">
                                <div>
                                    <span class="episode-select-label">Temporada</span>
                                    <select class="season-select" id="seasonSelect_${data.id}" onchange="loadSeasonEpisodes(${data.id}, this.value)">
                                        ${(data.seasons || []).map(s => `<option value="${s.season_number}">${s.name}</option>`).join('')}
                                    </select>
                                </div>
                            </div>
                            <div class="episode-grid" id="episodeGrid_${data.id}"><div class="episode-loading"><div class="spinner"></div><p style="margin-top:10px;">Selecione uma temporada para ver os episódios.</p></div></div>
                        </div>
                    </details>
                `;
                const castPeople = (data.credits?.cast || []).filter(p => p.profile_path).slice(0, 12);
                if (castPeople.length) {
                    advancedHtml += `
                        <details class="expandable-details">
                            <summary>Elenco</summary>
                            <div class="expandable-body">
                                <div class="cast-grid">
                                    ${castPeople.map(p => `<div class="cast-card"><img class="cast-img" src="https://image.tmdb.org/t/p/w185${p.profile_path}" alt="${p.name}" loading="lazy"><div><div class="cast-name">${p.name}</div><div class="cast-character">${p.character || 'Personagem não informado'}</div></div></div>`).join('')}
                                </div>
                            </div>
                        </details>
                    `;
                }
            }

            content.innerHTML = `
                <button class="modal-close" onclick="forceCloseModal()"><i class="fa-solid fa-xmark"></i></button>
                <img src="${poster}" alt="${title}" class="modal-img">
                <div class="modal-info">
                    <h2 class="modal-title">${title}</h2>

                    <div class="modal-tags">
                        <span class="age-rating" style="background-color: ${ageColor}">${ageRating}</span>
                        ${genres}
                    </div>

                    <div class="external-scores">
                        ${scoresHtml}
                    </div>

                    ${providersHtml}

                    <div class="synopsis-section">
                        <p class="modal-desc">${overview}</p>
                        ${overview.length > 280 ? `<button class="synopsis-more-btn" onclick="openSynopsisQuadrant()"><i class="fa-solid fa-expand"></i> Mostrar mais</button>` : ''}
                    </div>

                    <div class="modal-meta-grid">
                        <div class="meta-item"><span>Lançamento</span> ${year}</div>
                        <div class="meta-item"><span>Duração</span> ${duration}</div>
                        <div class="meta-item"><span>Tipo</span> ${type === 'tv' ? 'Série de TV' : 'Filme'}</div>
                        <div class="meta-item"><span>Status</span> ${status}</div>
                    </div>

                    <div class="feature-actions">
                        <button class="favorite-detail-btn ${isFavorite(data.id, type) ? 'active' : ''}" onclick="toggleFavorite(${data.id}, '${type}')"><i class="fa-${isFavorite(data.id, type) ? 'solid' : 'regular'} fa-heart"></i> ${isFavorite(data.id, type) ? 'Na Minha Lista' : 'Adicionar à Minha Lista'}</button>
                    </div>

                    ${advancedHtml}
                </div>
            `;

            // Info, episódios e elenco são painéis exclusivos: apenas um pode ficar aberto.
            const expandableItems = Array.from(content.querySelectorAll('.expandable-details'));
            expandableItems.forEach(details => {
                details.addEventListener('toggle', () => {
                    const body = details.querySelector('.expandable-body');
                    if (!details.open) {
                        body?.classList.remove('is-overflowing');
                        return;
                    }

                    expandableItems.forEach(other => {
                        if (other !== details && other.open) {
                            other.open = false;
                            other.querySelector('.expandable-body')?.classList.remove('is-overflowing');
                        }
                    });

                    if (body) {
                        body.classList.remove('is-overflowing');
                        requestAnimationFrame(() => {
                            if (!details.open || !body.isConnected || getComputedStyle(body).position !== 'absolute') return;
                            const bounds = body.getBoundingClientRect();
                            if (bounds.right > window.innerWidth - 12 || bounds.left < 12) {
                                body.classList.add('is-overflowing');
                            }
                        });
                    }
                });
            });
        }

        async function handleEpisodesToggle(id, detailsEl) {
            if (!detailsEl.open) return;
            const select = document.getElementById(`seasonSelect_${id}`);
            if (!select || !select.value) return;
            const grid = document.getElementById(`episodeGrid_${id}`);
            if (grid.dataset.loaded !== select.value) {
                await loadSeasonEpisodes(id, select.value);
            }
        }

        async function loadSeasonEpisodes(tvId, seasonNumber) {
            const grid = document.getElementById(`episodeGrid_${tvId}`);
            if (!grid || !TMDB_API_KEY || !seasonNumber) return;

            grid.innerHTML = '<div class="episode-loading"><div class="spinner"></div><p style="margin-top:10px;">Carregando episódios...</p></div>';
            try {
                const response = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}&language=pt-BR`);
                const data = await response.json();
                const episodes = data.episodes || [];

                if (!episodes.length) {
                    grid.innerHTML = '<div class="episode-loading">Nenhum episódio encontrado para esta temporada.</div>';
                    return;
                }

                grid.innerHTML = episodes.map(ep => {
                    const still = ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : 'https://via.placeholder.com/300x450?text=Sem+Imagem';
                    const rating = ep.vote_average ? ep.vote_average.toFixed(1) : 'N/A';
                    const airDate = ep.air_date ? ep.air_date.split('-').reverse().join('/') : 'N/A';
                    const overview = ep.overview || 'Sem sinopse disponível.';
                    return `
                        <article class="episode-card">
                            <img class="episode-img" src="${still}" alt="${ep.name || `Episódio ${ep.episode_number}`}" loading="lazy">
                            <div class="episode-content">
                                <div class="episode-number">EP. ${ep.episode_number}</div>
                                <div class="episode-title">${ep.name || 'Episódio sem título'}</div>
                                <div class="episode-meta"><span class="episode-rating"><i class="fa-solid fa-star"></i> ${rating}</span><span>${airDate}</span></div>
                                <div class="episode-overview">${overview}</div>
                            </div>
                        </article>
                    `;
                }).join('');
                grid.dataset.loaded = String(seasonNumber);
            } catch (error) {
                console.error('Erro ao carregar episódios:', error);
                grid.innerHTML = '<div class="episode-loading" style="color:#ef4444;">Não foi possível carregar os episódios.</div>';
            }
        }

        // --- NAVEGAÇÃO E ESTADOS ---
        function setActiveNav(id) {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.getElementById(id).classList.add('active');
        }

        function loadMyList() {
            currentMode = 'mylist';
            currentPage = 1;
            searchInput.value = '';
            document.getElementById('sectionTitle').innerText = 'Minha Lista';
            document.querySelector('.hero').style.display = 'none';
            setActiveNav('navMyList');
            hideCategories();
            fetchContent();
        }

        function loadRecommendations() {
            currentMode = 'recommendations';
            currentPage = 1;
            searchInput.value = '';
            document.getElementById('sectionTitle').innerText = 'Recomendados para você';
            document.querySelector('.hero').style.display = 'none';
            setActiveNav('navRecommendations');
            hideCategories();
            fetchContent();
        }

        function loadHome() {
            currentMode = 'home';
            currentPage = 1;
            searchInput.value = '';
            document.getElementById('sectionTitle').innerText = 'Filmes em Destaque';
            document.querySelector('.hero').style.display = 'block';
            setActiveNav('navHome');
            hideCategories();
            fetchContent();
        }

        function loadTrending() {
            currentMode = 'trending';
            currentPage = 1;
            searchInput.value = '';
            document.getElementById('sectionTitle').innerText = 'Em Alta nesta Semana';
            document.querySelector('.hero').style.display = 'none';
            setActiveNav('navTrending');
            hideCategories();
            fetchContent();
        }

        function loadMovies() {
            currentMode = 'movies';
            currentPage = 1;
            searchInput.value = '';
            document.getElementById('sectionTitle').innerText = 'Filmes';
            document.querySelector('.hero').style.display = 'none';
            setActiveNav('navMovies');
            hideCategories();
            fetchContent();
        }

        function loadCinemaMovies() {
            currentMode = 'cinema';
            currentPage = 1;
            searchInput.value = '';
            document.getElementById('sectionTitle').innerText = 'Filmes em Cartaz (Cinema)';
            document.querySelector('.hero').style.display = 'none';
            setActiveNav('navCinema');
            hideCategories();
            fetchContent();
        }

        function loadStreamingMovies() {
            currentMode = 'streaming';
            currentPage = 1;
            searchInput.value = '';
            document.getElementById('sectionTitle').innerText = 'Filmes em Streaming';
            document.querySelector('.hero').style.display = 'none';
            setActiveNav('navStreaming');
            hideCategories();
            fetchContent();
        }

        function loadSeries() {
            currentMode = 'series';
            currentPage = 1;
            searchInput.value = '';
            document.getElementById('sectionTitle').innerText = 'Séries';
            document.querySelector('.hero').style.display = 'none';
            setActiveNav('navSeries');
            hideCategories();
            fetchContent();
        }

        function toggleCategoriesView() {
            currentMode = 'categories';
            currentPage = 1;
            searchInput.value = '';
            document.getElementById('sectionTitle').innerText = 'Explorar por Categoria';
            document.querySelector('.hero').style.display = 'none';
            setActiveNav('navCategories');

            const catBar = document.getElementById('categoriesBar');
            catBar.classList.add('active');

            document.querySelector('.cat-btn').click();
        }

        function hideCategories() {
            document.getElementById('categoriesBar').classList.remove('active');
        }

        function filterByCategory(catId, event) {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            event.target.classList.add('active');

            currentCategory = catId === 'all' ? '' : catId;
            currentMode = 'categories';
            currentPage = 1;

            if(catId === 'all') {
                currentMode = 'home';
                document.getElementById('sectionTitle').innerText = 'Todos os Gêneros (Populares)';
            } else {
                document.getElementById('sectionTitle').innerText = 'Categoria: ' + event.target.innerText;
            }
            fetchContent();
        }

        // --- PAGINAÇÃO ---
        function updatePagination() {
            const container = document.getElementById('paginationContainer');
            const info = document.getElementById('pageInfo');
            const btnPrev = document.getElementById('prevPage');
            const btnNext = document.getElementById('nextPage');

            if (totalPages > 1) {
                container.style.display = 'flex';
                info.innerText = `Página ${currentPage} de ${totalPages > 500 ? 500 : totalPages}`;
                btnPrev.disabled = currentPage === 1;
                btnNext.disabled = currentPage >= (totalPages > 500 ? 500 : totalPages);
            } else {
                container.style.display = 'none';
            }
        }

        function changePage(delta) {
            currentPage += delta;
            fetchContent();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // --- MODAIS ---
        function openSynopsisQuadrant() {
            const synopsis = document.querySelector('#modalContent .modal-desc');
            if (!synopsis) return;
            let panel = document.getElementById('synopsisQuadrant');
            if (!panel) {
                panel = document.createElement('div');
                panel.id = 'synopsisQuadrant';
                panel.className = 'synopsis-quadrant';
                panel.innerHTML = `
                    <div class="synopsis-quadrant-card" role="dialog" aria-modal="true" aria-labelledby="synopsisQuadrantTitle">
                        <button class="synopsis-quadrant-close" type="button" aria-label="Fechar sinopse" onclick="closeSynopsisQuadrant()"><i class="fa-solid fa-xmark"></i></button>
                        <span class="synopsis-quadrant-label">CINÉVIA · SINOPSE</span>
                        <h3 id="synopsisQuadrantTitle"></h3>
                        <div class="synopsis-quadrant-text"></div>
                    </div>`;
                document.body.appendChild(panel);
                panel.addEventListener('click', event => { if (event.target === panel) closeSynopsisQuadrant(); });
            }
            panel.querySelector('h3').textContent = document.querySelector('#modalContent .modal-title')?.textContent || 'Sinopse';
            panel.querySelector('.synopsis-quadrant-text').textContent = synopsis.textContent;
            panel.classList.add('active');
            document.addEventListener('keydown', synopsisEscapeHandler);
        }

        function closeSynopsisQuadrant() {
            document.getElementById('synopsisQuadrant')?.classList.remove('active');
            document.removeEventListener('keydown', synopsisEscapeHandler);
        }

        function synopsisEscapeHandler(event) {
            if (event.key === 'Escape') closeSynopsisQuadrant();
        }

        function closeModal(e) {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.classList.remove('active');
                if (e.target.id === 'detailsModal') {
                    document.getElementById('modalContent').innerHTML = '';
                }
            }
        }

        function forceCloseModal() {
            document.getElementById('detailsModal').classList.remove('active');
            document.getElementById('settingsModal').classList.remove('active');
        }

        function openSettingsModal() {
            document.getElementById('settingsModal').classList.add('active');
            document.getElementById('apiKeyInput').value = TMDB_API_KEY;
        }

        function saveSettings() {
            const key = document.getElementById('apiKeyInput').value.trim();
            if (key) {
                localStorage.setItem('tmdb_api_key', key);
                TMDB_API_KEY = key;
                document.getElementById('settingsMsg').style.display = 'block';
                setTimeout(() => { forceCloseModal(); initHeroCarousel(); loadHome(); }, 1000);
            }
        }

        function showError(msg) {
            const grid = document.getElementById('resultsGrid');
            grid.innerHTML = `<div class="message-box" style="color: #ef4444">${msg}</div>`;
        }


/* ======================================================================
   SISTEMA DE PERFIS LOCAIS, QUESTIONÁRIO E PERSONALIZAÇÃO ("SUA EXPERIÊNCIA CINÉVIA")
   ====================================================================== */

const PROFILES_STORAGE_KEY = 'cinevia_local_profiles_v1';
const ACTIVE_PROFILE_KEY = 'cinevia_active_profile_id';
const LEGACY_FAVORITES_KEY = 'cinevia_favorites';

let currentProfile = null;
let onboardingData = { step: 1, name: '', isVisitor: false, origin: '', purpose: '', genres: [], types: [], storyType: '', era: '' };

function getProfilesFromStorage() {
    try {
        return JSON.parse(localStorage.getItem(PROFILES_STORAGE_KEY) || '[]');
    } catch (e) {
        return [];
    }
}

function saveProfilesToStorage(profiles) {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
}

function getActiveProfileId() {
    return localStorage.getItem(ACTIVE_PROFILE_KEY);
}

function setActiveProfileId(id) {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
}

function initProfileSystem() {
    let profiles = getProfilesFromStorage();
    
    // Migração de favoritos legados se existirem
    const legacyFavs = localStorage.getItem(LEGACY_FAVORITES_KEY);
    if (legacyFavs && profiles.length === 0) {
        try {
            const parsedFavs = JSON.parse(legacyFavs);
            if (Array.isArray(parsedFavs) && parsedFavs.length > 0) {
                const defaultProfile = {
                    id: 'profile_' + Date.now(),
                    name: 'Perfil Principal',
                    isVisitor: false,
                    createdAt: new Date().toISOString(),
                    favorites: parsedFavs,
                    preferences: {},
                    searchHistory: []
                };
                profiles.push(defaultProfile);
                saveProfilesToStorage(profiles);
                setActiveProfileId(defaultProfile.id);
            }
        } catch (e) {
            console.warn('Erro ao migrar favoritos antigos:', e);
        }
    }

    profiles = getProfilesFromStorage();
    let activeId = getActiveProfileId();

    if (profiles.length === 0) {
        // Primeiro acesso sem perfil -> Exibir Onboarding / Tela Inicial de Entrada
        showFirstAccessOnboarding();
    } else {
        currentProfile = profiles.find(p => p.id === activeId) || profiles[0];
        setActiveProfileId(currentProfile.id);
        updateActiveProfileUI();
    }
}

function updateActiveProfileUI() {
    const label = document.getElementById('activeProfileLabel');
    if (label && currentProfile) {
        label.textContent = currentProfile.name + (currentProfile.isVisitor ? ' (Visitante)' : '');
    }
}

function showFirstAccessOnboarding() {
    onboardingData = { step: 0, name: '', isVisitor: false, origin: '', purpose: '', genres: [], types: [], storyType: '', era: '' };
    renderOnboardingStep();
    document.getElementById('onboardingModal').classList.add('active');
}

function renderOnboardingStep() {
    const container = document.getElementById('onboardingStepContainer');
    if (!container) return;

    if (onboardingData.step === 0) {
        // Escolha inicial: Criar perfil ou Visitante
        container.innerHTML = `
            <h2 style="font-family: var(--font-title); color: var(--accent); margin-bottom: 0.8rem; text-align:center;">Bem-vindo ao Cinévia</h2>
            <p style="color: var(--text-muted); font-size: 0.95rem; text-align:center; margin-bottom: 1.8rem; line-height: 1.5;">
                Sua experiência de descoberta de filmes e séries. Como você gostaria de acessar neste navegador?
            </p>
            <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">
                <div class="card" style="padding: 1.2rem; background: var(--bg-card); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; cursor: pointer;" onclick="startCreateProfile(false)">
                    <h3 style="color: white; font-size: 1.1rem; margin-bottom: 0.4rem;"><i class="fa-solid fa-user-plus" style="color:var(--accent);"></i> Criar Perfil Local</h3>
                    <p style="color: var(--text-muted); font-size: 0.85rem;">Personalize suas preferências, listas de favoritos e recomendações guardadas neste navegador.</p>
                </div>
                <div class="card" style="padding: 1.2rem; background: var(--bg-card); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; cursor: pointer;" onclick="startCreateProfile(true)">
                    <h3 style="color: white; font-size: 1.1rem; margin-bottom: 0.4rem;"><i class="fa-solid fa-user-secret" style="color:var(--accent);"></i> Continuar como Visitante</h3>
                    <p style="color: var(--text-muted); font-size: 0.85rem;">Acesse diretamente sem precisar informar nome. Você poderá salvar favoritos e configurar gostos normalmente.</p>
                </div>
            </div>
        `;
    } else if (onboardingData.step === 1) {
        // Nome do perfil (se não visitante) + Etapa A: Origem
        container.innerHTML = `
            <span style="color:var(--accent); font-weight:800; font-size:0.8rem; text-transform:uppercase; letter-spacing:1px;">Passo 1 de 2</span>
            <h2 style="font-family: var(--font-title); margin: 0.5rem 0 1rem;">Sua Experiência Cinévia</h2>
            
            ${!onboardingData.isVisitor ? `
            <div class="settings-field" style="margin-bottom: 1.2rem;">
                <label for="profileNameInput">Nome do Perfil Local *</label>
                <input type="text" id="profileNameInput" placeholder="Ex: Lucas, CinemaEmCasa..." value="${onboardingData.name}">
            </div>
            ` : ''}

            <div class="settings-field" style="margin-bottom: 1rem;">
                <label>Como você conheceu o Cinévia?</label>
                <select id="originInput" style="padding:0.8rem; background:var(--bg-dark); color:white; border:1px solid rgba(255,255,255,0.1); border-radius:6px;">
                    <option value="Redes sociais">Redes sociais</option>
                    <option value="Pesquisa na web">Pesquisa no Google / Buscador</option>
                    <option value="Indicação de amigos">Indicação de amigos ou familiares</option>
                    <option value="YouTube ou Criador">YouTube ou Criador de Conteúdo</option>
                    <option value="Fórum/Comunidade">Fórum ou Comunidade Online</option>
                    <option value="Outro">Outro</option>
                    <option value="Prefiro não responder">Prefiro não responder</option>
                </select>
            </div>

            <div class="settings-field" style="margin-bottom: 1.5rem;">
                <label>O que você veio fazer no Cinévia hoje?</label>
                <select id="purposeInput" style="padding:0.8rem; background:var(--bg-dark); color:white; border:1px solid rgba(255,255,255,0.1); border-radius:6px;">
                    <option value="Encontrar algo para assistir">Encontrar algo para assistir</option>
                    <option value="Descobrir lançamentos">Descobrir lançamentos</option>
                    <option value="Pesquisar um título">Pesquisar um título específico</option>
                    <option value="Conferir avaliações">Conferir avaliações</option>
                    <option value="Explorar recomendações">Explorar recomendações</option>
                </select>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center;">
                <button class="feature-btn" onclick="skipOnboardingStep(1)">Pular pergunta</button>
                <button class="save-btn" style="margin-top:0;" onclick="submitOnboardingStep1()">Avançar <i class="fa-solid fa-arrow-right"></i></button>
            </div>
        `;
    } else if (onboardingData.step === 2) {
        // Etapa B: Preferências de entretenimento
        const genreList = [
            { id: 28, name: 'Ação' }, { id: 12, name: 'Aventura' }, { id: 16, name: 'Animação/Anime' },
            { id: 35, name: 'Comédia' }, { id: 80, name: 'Crime' }, { id: 99, name: 'Documentário' },
            { id: 18, name: 'Drama' }, { id: 14, name: 'Fantasia' }, { id: 878, name: 'Ficção Científica' },
            { id: 9648, name: 'Mistério' }, { id: 10749, name: 'Romance' }, { id: 27, name: 'Terror / Suspense' }
        ];

        let genresHtml = genreList.map(g => `
            <label class="cat-btn ${onboardingData.genres.includes(g.id) ? 'active' : ''}" style="display:inline-flex; align-items:center; gap:6px; cursor:pointer;">
                <input type="checkbox" value="${g.id}" ${onboardingData.genres.includes(g.id) ? 'checked' : ''} onchange="toggleGenrePref(${g.id}, this.checked)" style="display:none;">
                ${g.name}
            </label>
        `).join(' ');

        container.innerHTML = `
            <span style="color:var(--accent); font-weight:800; font-size:0.8rem; text-transform:uppercase; letter-spacing:1px;">Passo 2 de 2</span>
            <h2 style="font-family: var(--font-title); margin: 0.5rem 0 1rem;">Gostos & Preferências</h2>
            
            <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:0.5rem; font-weight:700;">Quais gêneros você costuma gostar?</p>
            <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:1.2rem;">
                ${genresHtml}
            </div>

            <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:0.5rem; font-weight:700;">Que tipo de história prefere?</p>
            <select id="storyTypeInput" style="width:100%; padding:0.8rem; background:var(--bg-dark); color:white; border:1px solid rgba(255,255,255,0.1); border-radius:6px; margin-bottom:1.2rem;">
                <option value="equilibrada">Equilibrada / Sem preferência</option>
                <option value="leve">Leve e divertida</option>
                <option value="intensa">Intensa e emocionante</option>
                <option value="complexa">Complexa e surpreendente</option>
            </select>

            <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:0.5rem; font-weight:700;">Preferência de época:</p>
            <select id="eraInput" style="width:100%; padding:0.8rem; background:var(--bg-dark); color:white; border:1px solid rgba(255,255,255,0.1); border-radius:6px; margin-bottom:1.5rem;">
                <option value="ambos">Lançamentos e Clássicos (Ambos)</option>
                <option value="lancamentos">Mais Lançamentos / Recentes</option>
                <option value="classicos">Mais Clássicos / Antigos</option>
            </select>

            <div style="display:flex; justify-content:space-between; align-items:center;">
                <button class="feature-btn" onclick="skipOnboardingStep(2)">Pular e Concluir</button>
                <button class="save-btn" style="margin-top:0;" onclick="finishOnboarding()"><i class="fa-solid fa-check"></i> Salvar e Explorar</button>
            </div>
        `;
    }
}

function startCreateProfile(isVisitor = false) {
    onboardingData.isVisitor = isVisitor;
    onboardingData.name = isVisitor ? 'Visitante' : '';
    onboardingData.step = 1;
    renderOnboardingStep();
}

function toggleGenrePref(id, checked) {
    if (checked) {
        if (!onboardingData.genres.includes(id)) onboardingData.genres.push(id);
    } else {
        onboardingData.genres = onboardingData.genres.filter(g => g !== id);
    }
    renderOnboardingStep();
}

function submitOnboardingStep1() {
    if (!onboardingData.isVisitor) {
        const inputName = document.getElementById('profileNameInput')?.value.trim();
        if (!inputName) {
            alert('Por favor, informe um nome para o perfil local.');
            return;
        }
        onboardingData.name = inputName;
    }
    onboardingData.origin = document.getElementById('originInput')?.value || 'Não informado';
    onboardingData.purpose = document.getElementById('purposeInput')?.value || 'Não informado';
    onboardingData.step = 2;
    renderOnboardingStep();
}

function skipOnboardingStep(step) {
    if (step === 1) {
        if (!onboardingData.isVisitor && !onboardingData.name) onboardingData.name = 'Meu Perfil';
        onboardingData.step = 2;
        renderOnboardingStep();
    } else if (step === 2) {
        finishOnboarding();
    }
}

function finishOnboarding() {
    onboardingData.storyType = document.getElementById('storyTypeInput')?.value || 'equilibrada';
    onboardingData.era = document.getElementById('eraInput')?.value || 'ambos';

    const profiles = getProfilesFromStorage();
    const newProfile = {
        id: 'profile_' + Date.now(),
        name: onboardingData.name || (onboardingData.isVisitor ? 'Visitante' : 'Perfil Local'),
        isVisitor: onboardingData.isVisitor,
        createdAt: new Date().toISOString(),
        favorites: [],
        preferences: {
            origin: onboardingData.origin,
            purpose: onboardingData.purpose,
            genres: onboardingData.genres || [],
            storyType: onboardingData.storyType,
            era: onboardingData.era
        },
        searchHistory: []
    };

    profiles.push(newProfile);
    saveProfilesToStorage(profiles);
    setActiveProfileId(newProfile.id);
    currentProfile = newProfile;

    document.getElementById('onboardingModal').classList.remove('active');
    updateActiveProfileUI();
    loadHome();
}

// Gerenciamento e Troca de Perfis
function openProfileModal() {
    const modal = document.getElementById('profileModal');
    const list = document.getElementById('profilesList');
    const profiles = getProfilesFromStorage();

    list.innerHTML = profiles.map(p => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-dark); padding:10px 14px; border-radius:8px; border: 1px solid ${p.id === currentProfile?.id ? 'var(--accent)' : 'rgba(255,255,255,0.08)'};">
            <div>
                <strong style="color:white; font-size:0.95rem;">${p.name} ${p.isVisitor ? '<span style="font-size:0.75rem; color:var(--text-muted);">(Visitante)</span>' : ''}</strong>
                <div style="font-size:0.78rem; color:var(--text-muted);">${(p.favorites || []).length} favoritos salva(os)</div>
            </div>
            <div style="display:flex; gap:6px;">
                ${p.id !== currentProfile?.id ? `<button class="feature-btn" style="font-size:0.8rem; padding:5px 10px;" onclick="switchProfile('${p.id}')">Ativar</button>` : `<span style="color:var(--accent); font-size:0.8rem; font-weight:800; align-self:center;">Ativo</span>`}
                <button class="feature-btn" style="font-size:0.8rem; padding:5px 8px; color:#ef4444;" onclick="deleteProfile('${p.id}')"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');

    modal.classList.add('active');
}

function switchProfile(profileId) {
    const profiles = getProfilesFromStorage();
    const target = profiles.find(p => p.id === profileId);
    if (target) {
        currentProfile = target;
        setActiveProfileId(target.id);
        updateActiveProfileUI();
        forceCloseModal();
        loadHome();
    }
}

function deleteProfile(profileId) {
    let profiles = getProfilesFromStorage();
    if (profiles.length <= 1) {
        alert('É necessário manter pelo menos um perfil local.');
        return;
    }
    if (confirm('Deseja realmente remover este perfil e seus dados locais?')) {
        profiles = profiles.filter(p => p.id !== profileId);
        saveProfilesToStorage(profiles);
        if (currentProfile?.id === profileId) {
            currentProfile = profiles[0];
            setActiveProfileId(currentProfile.id);
        }
        updateActiveProfileUI();
        openProfileModal();
        loadHome();
    }
}

function showCreateProfileForm() {
    forceCloseModal();
    showFirstAccessOnboarding();
}

function openPreferencesModal() {
    if (!currentProfile) return;
    onboardingData = {
        step: 2,
        name: currentProfile.name,
        isVisitor: currentProfile.isVisitor,
        genres: currentProfile.preferences?.genres || [],
        storyType: currentProfile.preferences?.storyType || 'equilibrada',
        era: currentProfile.preferences?.era || 'ambos'
    };
    forceCloseModal();
    renderOnboardingStep();
    document.getElementById('onboardingModal').classList.add('active');
}

function exportProfileBackup() {
    if (!currentProfile) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentProfile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cinevia_profile_${currentProfile.name.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function triggerImportProfileBackup() {
    document.getElementById('importBackupInput').click();
}

function importProfileBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (imported && imported.name) {
                imported.id = 'profile_' + Date.now();
                const profiles = getProfilesFromStorage();
                profiles.push(imported);
                saveProfilesToStorage(profiles);
                switchProfile(imported.id);
                alert('Perfil importado com sucesso!');
            } else {
                alert('Arquivo de backup inválido.');
            }
        } catch(err) {
            alert('Erro ao importar backup.');
        }
    };
    reader.readAsText(file);
}

/* Subtituição de getFavoriteItems / toggleFavorite por Profile Isolation */
function getFavoriteItems() {
    if (currentProfile) {
        return currentProfile.favorites || [];
    }
    return [];
}

function saveFavoriteItems(favorites) {
    if (currentProfile) {
        currentProfile.favorites = favorites;
        const profiles = getProfilesFromStorage();
        const index = profiles.findIndex(p => p.id === currentProfile.id);
        if (index >= 0) {
            profiles[index] = currentProfile;
            saveProfilesToStorage(profiles);
        }
    }
}

