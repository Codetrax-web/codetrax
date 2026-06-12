document.addEventListener('DOMContentLoaded', () => {
    // Referencia al contenedor principal para inyección de vistas
    const mainContent = document.getElementById('content');

    // =====================================
    // ESTRUCTURAS DE DATOS Y RENDERIZADO
    // =====================================

    // Generador de plantilla para el buscador
    const renderSearch = () => `
        <label class="gt-field">
            <span class="gt-input">
                <span class="gt-input__prompt">&gt;</span>
                <input type="text" id="gt-input-target" class="gt-input__control" placeholder="./build/main">
            </span>
        </label>
    `;

    // Almacenamiento local de proyectos
    let portfolioProjects = [];

    // =====================================
    // LÓGICA DEL PORTAFOLIO
    // =====================================

    // Obtiene datos del servidor y renderiza inicialmente
    async function loadPortfolio() {
        const grid = document.getElementById('portfolio-grid');
        if (!grid) return;

        try {
           const response = await fetch('./data/portafolio/index.json');
            portfolioProjects = await response.json();
            renderPortfolio('Todos');
            initializeFilters();
        } catch (error) {
            console.error('Error cargando portafolio:', error);
            grid.innerHTML = '<p>No se pudieron cargar los proyectos.</p>';
        }
    }

    // Filtra y actualiza el DOM de la cuadrícula de proyectos
    function renderPortfolio(category) {
        const grid = document.getElementById('portfolio-grid');
        if (!grid) return;

       let filteredProjects = category !== 'Todos' 
    ? portfolioProjects.filter(project => project.categoria.toLowerCase() === category.toLowerCase())
    : portfolioProjects;

        if (filteredProjects.length === 0) {
            grid.innerHTML = '<p>No hay proyectos disponibles.</p>';
            return;
        }

        grid.innerHTML = filteredProjects.map(project => `
            <div class="project-card">
                <img src="${project.imagen}" alt="${project.titulo}">
                <h3>${project.titulo}</h3>
                <p>${project.descripcion}</p>
                <a href="${project.url}" target="_blank" class="project-link">
                    <button class="button">
                        <div class="blob1"></div>
                        <div class="blob2"></div>
                        <div class="inner">Ver Proyecto</div>
                    </button>
                </a>
            </div>
        `).join('');
    }

    // Configura listeners para los botones de filtrado
    function initializeFilters() {
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                renderPortfolio(button.dataset.filter);
            });
        });
    }

    // =====================================
    // GESTIÓN DE VISTAS (PÁGINAS)
    // =====================================

    const views = {
      home: `
    <h1>Dashboard</h1>
    ${renderSearch()}
    <div class="social-container">
        <a href="URL_GITHUB" target="_blank" class="light-button"><button class="bt"><div class="button-holder"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.44 9.8 8.21 11.39.6.11.82-.26.82-.57v-2.04c-3.33.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.54-1.52.11-3.17 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.4s2.04.13 3 .4c2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.76.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.48 5.92.42.36.81 1.09.81 2.22v3.29c0 .32.22.69.82.57C20.57 21.8 24 17.31 24 12c0-6.63-5.37-12-12-12z"/></svg><p>GitHub</p></div></button></a>
        <a href="URL_YOUTUBE" target="_blank" class="light-button"><button class="bt"><div class="button-holder"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg><p>YouTube</p></div></button></a>
        <a href="URL_INSTA" target="_blank" class="light-button"><button class="bt"><div class="button-holder"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.77 1.683 4.918 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.918 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.012-3.584.07-4.849.148-3.259 1.685-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.272 2.695.072 7.053.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg><p>Instagram</p></div></button></a>
        <a href="URL_TIKTOK" target="_blank" class="light-button"><button class="bt"><div class="button-holder"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-1.04-.57-.3-1.09-.67-1.47-1.16v7.21c0 3.75-3 6.78-6.7 6.78-3.7 0-6.7-3.03-6.7-6.78s3-6.78 6.7-6.78c.26 0 .52.01.78.02v4.65c-.26-.01-.52-.02-.78-.02-1.8 0-3.27 1.47-3.27 3.28 0 1.81 1.47 3.28 3.27 3.28 1.8 0 3.27-1.47 3.27-3.28V.02z"/></svg><p>TikTok</p></div></button></a>
        <a href="URL_DISCORD" target="_blank" class="light-button"><button class="bt"><div class="button-holder"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg><p>Discord</p></div></button></a>
        <a href="URL_WA" target="_blank" class="light-button"><button class="bt"><div class="button-holder"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.148-.67-1.613-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.894 9.894 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.001 0C5.373 0 0 5.373 0 12.001c0 2.09.547 4.133 1.589 5.932L.057 23.943l6.233-1.636a11.82 11.82 0 0 0 5.712 1.455h.007c6.627 0 12-5.373 12-12.001a11.815 11.815 0 0 0-3.486-8.455"/></svg><p>WhatsApp</p></div></button></a>
    </div>
`
        ,
        files: `
    <section class="about-section">
        <h1 class="about-title">Sobre CodeTrax</h1>
        <div class="about-card"><h2>¿Qué es CodeTrax?</h2><p>Crear experiencias...</p></div>
        <div class="about-card"><h2>Nuestra Misión</h2><p>Crear experiencias...</p></div>
        <div class="about-card">
            <h2>Nuestro Equipo</h2>
            <div class="team-grid">
                <div class="container">
                    <div class="card">
                    <div class="profile-tag">Fundador</div>
                    <img src="assets/team/Damian.jpg" alt="Foto" class="team-photo">
                    <h2>Damian cruz</h2>
                    <p>Desarrollador prinsipal</p>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
`,
        plans: `
            <div class="portfolio-page">
                <h1>Recursos</h1>
                <p>Descripción de mis recursos aquí.</p>
                <div class="portfolio-filters">
                    <button class="filter-btn active" data-filter="Todos">Todos</button>
                    <button class="filter-btn" data-filter="Juegos">Juegos</button>
                    <button class="filter-btn" data-filter="Office">Office</button>
                    <button class="filter-btn" data-filter="Codigo">Código</button>
                </div>
                <div id="portfolio-grid"></div>
            </div>
        `,
                settings: `
            <section class="about-section">
                <h1 class="about-title">Portafolio</h1>
                <p>Descripción de mis recursos aquí.</p>
                <div id="recursos-container"></div>
            </section>
        `

    };
        async function loadRecursos() {
        const container = document.getElementById('recursos-container');
        if (!container) return;

        try {
            const response = await fetch('./data/recursos/recursos.json');
            const recursos = await response.json()
container.innerHTML = recursos.map(item => `
    <div class="project-card">
        <img src="${item.imagen}" alt="${item.titulo}">
        <h3>${item.titulo}</h3>
        <p>${item.descripcion}</p>
        <a href="${item.url}" target="_blank" class="project-link">
            <button class="button">
                <div class="blob1"></div>
                <div class="blob2"></div>
                <div class="inner">Visita</div>
            </button>
        </a>
    </div>
`).join('');


        } catch (error) {
            console.error('Error cargando recursos:', error);
            container.innerHTML = '<p>No se pudieron cargar los recursos.</p>';
        }
    }

    // =====================================
    // INICIALIZACIÓN Y EVENTOS GLOBALES
    // =====================================

    mainContent.innerHTML = views.home;

    // Navegación: cambio de contenido dinámico
    document.querySelectorAll('.menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.menu a.active')?.classList.remove('active');
            link.classList.add('active');
            
                        const section = link.getAttribute('data-section');
            mainContent.innerHTML = views[section];
            
            if (section === 'plans') loadPortfolio();
            if (section === 'settings') loadRecursos(); // Esta línea es la que falta

        });
    });

    // Atajo: enfoque rápido al buscador con '/'
    document.addEventListener('keydown', (e) => {
        if (e.key === '/') {
            const input = document.getElementById('gt-input-target');
            if (input) {
                e.preventDefault();
                input.focus();
            }
        }
    });

    console.log("CodeTrax inicializado correctamente.");
});
