/* =====================================================
   INICIALIZACIÓN DEL DOM
   Espera a que el HTML cargue para ejecutar la lógica
===================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('content');

    /* =====================================================
       ESTRUCTURAS DE DATOS Y RENDERIZADO
    ===================================================== */
    const renderSearch = () => `
        <label class="gt-field">
            <span class="gt-input">
                <span class="gt-input__prompt">&gt;</span>
                <input type="text" id="gt-input-target" class="gt-input__control" placeholder="./build/main">
            </span>
        </label>
    `;

    let portfolioProjects = [];
    /* FIN ESTRUCTURAS DE DATOS */

    /* =====================================================
       LÓGICA DEL PORTAFOLIO
       Carga datos externos y gestiona filtros
    ===================================================== */
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

    function initializeFilters() {
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                renderPortfolio(button.dataset.filter);
            });
        });
    }
    /* FIN LÓGICA DEL PORTAFOLIO */

    /* =====================================================
       GESTIÓN DE VISTAS
       Definición de las plantillas HTML para cada sección
    ===================================================== */
    const views = {
      home: `
        <h1>Dashboard</h1>
        ${renderSearch()}
        <div class="social-container">
            <a href="https://github.com/Codetrax-web" target="_blank" class="neon-button">GitHub</a>
            <a href="https://www.youtube.com/@DAMIANCDX" target="_blank" class="neon-button">YouTube</a>
            <a href="https://www.instagram.com/damia_ncv" target="_blank" class="neon-button">Instagram</a>
            <a href="https://www.tiktok.com/@damian_cdx?is_from_webapp=1&sender_device=pc" target="_blank" class="neon-button">TikTok</a>
            <a href="https://discord.com/invite/rsAwuCg6xK" target="_blank" class="neon-button">Discord</a>
            <a href="https://wa.me/5578526705" target="_blank" class="neon-button">WhatsApp</a>
        </div>
      `,
      files: `
        <section class="about-section">
            <h1 class="about-title">Sobre CodeTrax</h1>
            <div class="about-card"><h2>¿Qué es CodeTrax?</h2><p>En Codetrax ayudamos a que tus ideas digitales dejen de ser solo eso: ideas. Transformamos tu visión en proyectos reales, desde la planificación hasta la ejecución, con soluciones creativas y tecnológicas que funcionan. Nuestro objetivo es que cada proyecto no solo exista, sino que destaque en el mundo digital.</p></div>
            <div class="about-card"><h2>Nuestra Misión</h2><p>Es simple: que la tecnología trabaje para ti, no al revés.
            Innovación
            Compromiso
            Resultados unicos
            Colaboración</p></div>
            <div class="about-card">
                <h2>Nuestro Equipo</h2>
                <div class="team-grid">
                    <div class="container">
                        <div class="card red">
                            <div class="profile-tag">Fundador</div>
                            <img src="assets/team/Damian.jpg" alt="Foto" class="team-photo">
                            <h2>Damian cruz</h2>
                            <p>Desarrollador principal | Codetrax</p>
                        </div>
                    </div>
                    <div class="team-grid">
                        <div class="container">
                            <div class="card blue">
                                <div class="profile-tag">Socio</div>
                                <img src="assets/team/tecno.jpg" alt="Foto" class="team-photo">
                                <h2>Tecno 730</h2>
                                <p>Disellador | tecno730</p>
                            </div>
                        </div>
                        <div class="container">
                            <div class="card green">
                                <div class="profile-tag">Socio</div>
                                <img src="assets/team/Miguel.jpg" alt="Foto" class="team-photo">
                                <h2>Miguel Pandares</h2>
                                <p>Desarrollador | Axira studios</p>
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
            <p>Un compendio de herramientas, utilidades de oficina y recursos para el desarrollo, junto con el toque divertido necesario para que la tecnología no sea aburrida.</p>
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
            <p>Aquí verás cómo transformo conceptos en código funcional, priorizando siempre la arquitectura y la eficiencia sobre lo superficial.</p>
            <div id="recursos-container"></div>
        </section>
      `,
    contacto: `
    <section class="about-section" style="display: flex; justify-content: center; align-items: center; min-height: 80vh; padding: 20px;">
        <div class="glass-container" style="position: relative; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(10px); border-radius: 20px; padding: 30px; width: 100%; max-width: 450px; border: 1px solid rgba(255,255,255,0.1);">
            <h1 style="color: #ffffff; font-size: 2rem; margin-bottom: 20px;">Contacto.</h1>
            <form action="https://formspree.io/f/xeewykke" method="POST" target="_blank" style="display: flex; flex-direction: column; gap: 15px;">
                <!-- Campos reorganizados en columna -->
                <input type="text" name="nombre" placeholder="Nombre" required style="padding:12px; background:rgba(51,65,85,0.6); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:white;">
                <input type="text" name="apellido" placeholder="Apellido" required style="padding:12px; background:rgba(51,65,85,0.6); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:white;">
                <input type="tel" name="telefono" placeholder="Teléfono" required style="padding:12px; background:rgba(51,65,85,0.6); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:white;">
                <input type="email" name="email" placeholder="Email" required style="padding:12px; background:rgba(51,65,85,0.6); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:white;">
                <textarea name="mensaje" placeholder="Mensaje" rows="4" required style="padding:12px; background:rgba(51,65,85,0.6); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:white;"></textarea>
                <button type="submit" style="background:linear-gradient(135deg, #a855f7, #3b82f6); color:white; border:none; padding:14px; border-radius:12px; font-weight:bold; cursor:pointer;">Enviar</button>
            </form>
        </div>
    </section>
`
    };
    /* FIN GESTIÓN DE VISTAS */

    /* =====================================================
       LÓGICA DE RECURSOS
       Carga dinámica de los recursos adicionales
    ===================================================== */
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
    /* FIN LÓGICA DE RECURSOS */

    /* =====================================================
       INICIALIZACIÓN Y EVENTOS GLOBALES
       Controla navegación, atajos de teclado y buscador
    ===================================================== */
    mainContent.innerHTML = views.home;

    document.querySelectorAll('.menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.menu a.active')?.classList.remove('active');
            link.classList.add('active');
            
            const section = link.getAttribute('data-section');
            mainContent.innerHTML = views[section];
            
            if (section === 'plans') loadPortfolio();
            if (section === 'settings') loadRecursos();
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === '/') {
            const input = document.getElementById('gt-input-target');
            if (input) {
                e.preventDefault();
                input.focus();
            }
        }
    });

   // Delegación de eventos para el buscador (Reemplazo optimizado)
document.addEventListener('input', (e) => {
    if (e.target.id === 'gt-input-target') {
        const searchTerm = e.target.value.toLowerCase();
        // Limitamos la búsqueda al contenedor dinámico para evitar conflictos globales
        const content = document.getElementById('content');
        const cards = content.querySelectorAll('.project-card'); 

        cards.forEach(card => {
            // Usamos encadenamiento opcional para evitar errores si no encuentra texto
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
            
            // Aplicamos el filtrado visual
            card.style.display = (title.includes(searchTerm) || desc.includes(searchTerm)) 
                ? 'flex' 
                : 'none';
        });
    }
});

    console.log("CodeTrax inicializado correctamente.");
    /* FIN INICIALIZACIÓN Y EVENTOS GLOBALES */
});

