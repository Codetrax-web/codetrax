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
        home: `<h1>Dashboard</h1>${renderSearch()}`,
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
                <h1>Portafolio</h1>
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
                <h1 class="about-title">Recursos</h1>
                <div id="recursos-container"></div>
            </section>
        `

    };
        async function loadRecursos() {
        const container = document.getElementById('recursos-container');
        if (!container) return;

        try {
            const response = await fetch('./data/recursos/recursos.json');
            const recursos = await response.json();
            
            container.innerHTML = recursos.map(item => `
    <div class="about-card">
        <img src="${item.imagen}" alt="${item.titulo}">
        <h3>${item.titulo}</h3>
        <p>${item.descripcion}</p>
        <a href="${item.url}" target="_blank">
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
