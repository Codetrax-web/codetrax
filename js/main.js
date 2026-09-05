/* =====================================================
   CONFIGURACIÓN Y CONEXIÓN A SHEET.BEST / GOOGLE SHEETS
===================================================== */
// Coloca aquí la URL de tu API en Sheet.best
const SHEET_BEST_API_URL = 'https://api.sheetbest.com/sheets/71f37bb9-d490-4b35-842c-b265c96fb0f8';

/* =====================================================
   INICIALIZACIÓN DEL DOM
===================================================== */
document.addEventListener('DOMContentLoaded', () => {
    loadDataAndSyncCounters().catch(err => console.error("Error al inicializar datos:", err));
    console.log("CodeTrax inicializado correctamente.");
    const mainContent = document.getElementById('content');

    /* =====================================================
       ESTRUCTURAS DE DATOS Y BÚSQUEDA
    ===================================================== */
    const renderSearch = () => `
    <div class="gt-field">
        <div class="search-bar-container">
            <i class="fa-solid fa-magnifying-glass search-icon-left"></i>
            <input type="text" id="gt-input-target" class="search-input" placeholder="Search...">
            <button class="search-btn" type="button">
                <i class="fa-solid fa-filter"></i>
            </button>
        </div>
        <div id="search-results-grid"></div>
    </div>
    `;

    let portfolioProjects = [];
    let recursosProjects = []; 
    let sheetMetrics = { Portafolio: {}, Recursos: {} };

    /* =====================================================
       CARGA DE ARCHIVOS JSON LOCALES Y SINCRO DE MÉTRICAS
    ===================================================== */
    async function fetchMetricsFromSheet(tabName) {
        if (!SHEET_BEST_API_URL || SHEET_BEST_API_URL.includes('TU_API_KEY_AQUI')) return {};
        try {
            const url = `${SHEET_BEST_API_URL}/tabs/${tabName}`;
            const res = await fetch(url);
            if (!res.ok) return {};
            const data = await res.json();
            
            const metricsMap = {};
            if (Array.isArray(data)) {
                data.forEach(row => {
                    if (row.titulo) {
                        metricsMap[row.titulo.trim().toLowerCase()] = {
                            likes: parseInt(row.likes) || 0,
                            vistas: parseInt(row.vistas) || 0
                        };
                    }
                });
            }
            return metricsMap;
        } catch (e) {
            console.warn(`No se pudieron obtener métricas de Sheet.best (${tabName}):`, e.message);
            return {};
        }
    }

    async function loadDataAndSyncCounters() {
        try {
            // 1. Cargar datos principales siempre desde los archivos JSON locales
            const [portRes, recRes] = await Promise.all([
                fetch('./data/portafolio/index.json').catch(() => null),
                fetch('./data/recursos/recursos.json').catch(() => null)
            ]);

            portfolioProjects = portRes && portRes.ok ? await portRes.json() : [];
            recursosProjects = recRes && recRes.ok ? await recRes.json() : [];

            // 2. Traer los contadores acumulados desde Google Sheets
            const [portMetrics, recMetrics] = await Promise.all([
                fetchMetricsFromSheet('Portafolio'),
                fetchMetricsFromSheet('Recursos')
            ]);

            sheetMetrics.Portafolio = portMetrics;
            sheetMetrics.Recursos = recMetrics;

            window.searchableData = [
                ...portfolioProjects,
                ...recursosProjects,
                { titulo: "Damian Cruz", descripcion: "Fundador | CEO", imagen: "assets/team/Damian.webp", url: "https://codetrax-web.github.io/Presentacion/" },
                { titulo: "Ricardo", descripcion: "Desarrollador Full Stack", imagen: "assets/team/ricardo.webp", url: "#" },
                { titulo: "DynsG", descripcion: "Diseñadora Gráfica", imagen: "assets/team/DynsG.webp", url: "https://youtube.com/@dyns.g-oficial?si=Nhl0NTcDzmamv2s7" },
                { titulo: "Tecno 730", descripcion: "Diseñador Multimedia", imagen: "assets/team/tecno.webp", url: "https://linktr.ee/__TECNO730__" },
                { titulo: "Miguel Pandares", descripcion: "Desarrollador Full Stack", imagen: "assets/team/Miguel.webp", url: "https://linktr.ee/migueltime" }
            ];

            renderPortfolio('Todos');
            initializeFilters();
        } catch (error) {
            console.error('Error al cargar datos locales/métricas:', error);
        }
    }

    /* =====================================================
       ENVIAR/ACTUALIZAR REGISTROS EN GOOGLE SHEETS
    ===================================================== */
    window.updateSheetCounter = async function(project, field, newValue, tabName) {
        if (!SHEET_BEST_API_URL || SHEET_BEST_API_URL.includes('TU_API_KEY_AQUI')) return;
        try {
            const encodedTitle = encodeURIComponent(project.titulo);
            const searchUrl = `${SHEET_BEST_API_URL}/tabs/${tabName}/titulo/${encodedTitle}`;
            
            // Comprobar si la fila del proyecto ya existe en Google Sheets
            const checkRes = await fetch(searchUrl);
            const existingRows = checkRes.ok ? await checkRes.json() : [];

            if (Array.isArray(existingRows) && existingRows.length > 0) {
                // Si existe, actualizamos el contador (PATCH)
                await fetch(searchUrl, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ [field]: newValue })
                });
            } else {
                // Si aún no está en la hoja de Excel, se registra la fila completa (POST)
                const newRow = {
                    titulo: project.titulo,
                    creador: project.creador || '',
                    categoria: project.categoria || '',
                    descripcion: project.descripcion || '',
                    imagen: project.imagen || '',
                    url: project.url || '',
                    likes: field === 'likes' ? newValue : (project.likes || 0),
                    vistas: field === 'vistas' ? newValue : 0
                };

                await fetch(`${SHEET_BEST_API_URL}/tabs/${tabName}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newRow)
                });
            }
        } catch (err) {
            console.error(`Error enviando datos a Sheet.best:`, err);
        }
    };

    /* =====================================================
       RENDERIZADO DE PORTAFOLIO
    ===================================================== */
    function renderPortfolio(category) {
        const grid = document.getElementById('portfolio-grid');
        if (!grid) return;

        let filteredProjects = category !== 'Todos' 
            ? portfolioProjects.filter(project => project.categoria?.toLowerCase() === category.toLowerCase())
            : portfolioProjects;

        if (filteredProjects.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: rgba(0,0,0,0.3); border-radius: 20px; backdrop-filter: blur(10px);">
                    <p style="color: #fff; font-size: 1.2rem;">No hay proyectos disponibles.</p>
                </div>`;
            return;
        }

        grid.innerHTML = filteredProjects.map(project => {
            const uniqueId = `port_${project.titulo.toLowerCase().replace(/\s+/g, '-')}`;
            const keyTitle = project.titulo.trim().toLowerCase();
            const sheetLikeCount = sheetMetrics.Portafolio[keyTitle]?.likes;

            const savedLikes = sheetLikeCount !== undefined 
                ? sheetLikeCount 
                : (localStorage.getItem(uniqueId) ? parseInt(localStorage.getItem(uniqueId)) : (parseInt(project.likes) || 0));

            const isLiked = localStorage.getItem(`${uniqueId}_liked`) === 'true';

            return `
                <div class="project-card" data-card-id="${uniqueId}" data-title="${project.titulo}" data-tab="Portafolio">
                    <div class="card-inner">
                        <div class="card-front">
                            <img src="${project.imagen}" alt="${project.titulo}" onerror="this.src='assets/placeholder.webp'">
                            <div class="card-divider"></div>
                            <h3>${project.titulo}</h3>
                            <p class="card-subtitle">Creador: ${project.creador || 'Desconocido'}</p>
                            <span class="card-category-badge">${project.categoria || 'General'}</span>
                        </div>
                        <div class="card-back">
                            <h3>${project.titulo}</h3>
                            <p class="card-description-text">${project.descripcion}</p>
                            <div class="card-back-actions">
                                <button class="like-btn ${isLiked ? 'liked' : ''}" data-id="${uniqueId}">
                                    <div class="like-content">
                                        <i class="fa-solid fa-heart"></i>
                                        <span>Likes</span>
                                    </div>
                                    <span class="like-count">${savedLikes}</span>
                                </button>
                                <a href="${project.url}" target="_blank" class="project-link" style="text-decoration: none;">
                                    <button class="button">
                                        <div class="blob1"></div>
                                        <div class="blob2"></div>
                                        <div class="inner" style="padding: 8px 18px; font-size: 0.85rem;">VER</div>
                                    </button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function initializeFilters() {
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                const section = document.querySelector('.about-section, .portfolio-page');
                if (section && section.querySelector('#portfolio-grid')) {
                    renderPortfolio(button.dataset.filter);
                } else if (section && section.querySelector('#recursos-container')) {
                    renderRecursos(button.dataset.filter);
                }
            });
        });
    }

    function animateCounters(){
        const counters = document.querySelectorAll(".counter");
        counters.forEach(counter => {
            const target = +counter.dataset.target;
            let current = 0;
            const increment = Math.max(1, Math.ceil(target / 100));
            const update = () => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    return;
                }
                counter.textContent = current;
                requestAnimationFrame(update);
            }
            update();
        });
    }

    /* =====================================================
       LÓGICA DE BÚSQUEDA
    ===================================================== */
    document.addEventListener('input', (e) => {
        if (e.target.id === 'gt-input-target') {
            const term = e.target.value.toLowerCase().trim();
            const resultsGrid = document.getElementById('search-results-grid');

            if (!term || !window.searchableData) { 
                if (resultsGrid) resultsGrid.innerHTML = ''; 
                return; 
            }

            const activeMenuLink = document.querySelector('.menu a.active');
            const currentSection = activeMenuLink ? activeMenuLink.getAttribute('data-section') : 'home';

            let dataSource = window.searchableData;

            if (currentSection === 'plans') {
                dataSource = recursosProjects;
            } else if (currentSection === 'settings') {
                dataSource = portfolioProjects;
            }

            const filtered = dataSource.filter(p => 
                (p.titulo && p.titulo.toLowerCase().includes(term)) || 
                (p.descripcion && p.descripcion.toLowerCase().includes(term)) ||
                (p.categoria && p.categoria.toLowerCase().includes(term))
            );

            if (filtered.length === 0) {
                resultsGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 15px;">
                        <p style="color: #fff;">No se encontró nada relacionado con "${term}" en este apartado.</p>
                    </div>`;
                return;
            }

            resultsGrid.innerHTML = filtered.map(p => `
                <div class="project-card">
                    <div class="card-inner">
                        <div class="card-front">
                            <img src="${p.imagen}" alt="${p.titulo}" onerror="this.src='assets/placeholder.webp'">
                            <div class="card-divider"></div>
                            <h3>${p.titulo}</h3>
                            <p class="card-subtitle">${p.creador || p.descripcion || ''}</p>
                            <span class="card-category-badge">${p.categoria || 'General'}</span>
                        </div>
                        <div class="card-back">
                            <h3>${p.titulo}</h3>
                            <p class="card-description-text">${p.descripcion || 'Sin descripción disponible.'}</p>
                            <div class="card-back-actions">
                                <a href="${p.url}" target="_blank" class="project-link" style="text-decoration: none; width: 100%;">
                                    <button class="button" style="width: 100%;">
                                        <div class="blob1"></div>
                                        <div class="blob2"></div>
                                        <div class="inner" style="padding: 8px 18px; font-size: 0.85rem; text-align: center;">VER</div>
                                    </button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    });

    document.addEventListener('click', (e) => {
        const searchBtn = e.target.closest('.search-btn');
        if (!searchBtn) return;
        const inputTarget = document.getElementById('gt-input-target');
        if (inputTarget) inputTarget.focus();
    });

    /* =====================================================
       GESTIÓN DE VISTAS
    ===================================================== */
    const views = { 
         // --- HOME ---
home: `
    <section class="about-section">
        <h1 class="about-title">✧.* 匚ㄖᗪ乇ㄒ尺卂乂 ✧.*</h1>
        <br>
        <h2>Donde la tecnología encuentra su identidad.</h2>
        <p>
            Somos un equipo multidisciplinario que fusiona creatividad, ingeniería y estrategia 
            para convertir ideas complejas en experiencias digitales de alto impacto.
        </p>
        <br>
        ${renderSearch()}
        <div id="search-results-grid"></div>
        <div class="social-container">
            INICIA TU PROYECTO AQUÍ...
        </div>
    </section>
    <section class="stats-section">
        <div class="stat-card">
            <h2 class="counter" data-target="20">0</h2>
            <p>Proyectos Ejecutados</p>
        </div>
        <div class="stat-card">
            <h2 class="counter" data-target="5">0</h2>
            <p>Expertos en Equipo</p>
        </div>
        <div class="stat-card">
            <h2 class="counter" data-target="2020">0</h2>
            <p>Año de Fundación</p>
        </div>
        <div class="stat-card">
            <h2 class="counter" data-target="5">0</h2>
            <p>Áreas de Servicio</p>
        </div>
    </section>
`,

// --- FILES (SOBRE NOSOTROS) ---
files: `
    <section class="about-section">
        <h1 class="about-title">『 𝙎𝙊𝘽𝙍𝙀 𝘾𝙊𝘿𝙀𝙏𝙍𝘼𝙓 』</h1>
        
        <div class="about-card">
            <h2>01 // ¿Qué es CodeTrax?</h2>
            <p>CodeTrax es una agencia de desarrollo digital integral. Transformamos conceptos en realidades tecnológicas mediante la sinergia de programación, diseño de interfaz, automatización inteligente y producción multimedia. No nos limitamos a un solo servicio; construimos ecosistemas digitales completos y personalizados adaptados al ADN de tu marca.</p>
        </div>

        <div class="about-card">
            <h2>02 // Servicios Estratégicos</h2>
            <p>✧ <b>Desarrollo:</b> Web, aplicaciones, sistemas a medida, automatización de procesos y optimización de infraestructura de código.</p>
            <p>✧ <b>Diseño:</b> Identidad visual, branding, interfaces (UI/UX), activos gráficos y material publicitario de alto impacto.</p>
            <p>✧ <b>Multimedia:</b> Diseño sonoro, composición musical, edición de video y producción de contenido para plataformas digitales.</p>
            <p>✧ <b>Videojuegos:</b> Creación de herramientas técnicas, mods y recursos gráficos especializados para la industria gaming.</p>
            <p>✧ <b>Consultoría:</b> Acompañamiento integral, desde la conceptualización técnica hasta el despliegue final del producto.</p>
        </div>

        <div class="about-card">
            <h2>03 // Nuestra Filosofía</h2>
            <p><b>Misión:</b> Desarrollar soluciones digitales escalables que aporten valor real. Creamos tecnología funcional y estéticamente impecable, diseñada para evolucionar.</p>
            <p><b>Valores:</b> Innovación constante, compromiso total con la calidad, enfoque en el usuario y aprendizaje tecnológico continuo.</p>
        </div>

        <div class="about-card">
            <h2>04 // Metodología de Trabajo</h2>
            <p>Nuestros proyectos se ejecutan bajo un flujo de trabajo ágil:</p>
            <p>1. <b>Discovery:</b> Escuchamos y analizamos tus necesidades reales.</p>
            <p>2. <b>Planificación:</b> Diseñamos la arquitectura técnica y visual del proyecto.</p>
            <p>3. <b>Desarrollo:</b> Implementamos soluciones con estándares de código limpio.</p>
            <p>4. <b>Entrega y Soporte:</b> Desplegamos el producto final con acompañamiento constante.</p>
        </div>
        
        <div class="about-card">
            <h2>05 // Infraestructura [Equipo]</h2>
            <div class="team-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                <!-- Tarjetas del equipo (Mantén tus clases, estructura optimizada) -->
               
      <div class="card red">
            <img src="assets/team/Damian.webp" alt="Foto" class="team-photo">
            <h2>Damian Cruz</h2>
            <div class="profile-tag">Fundador | CEO</div>
            <p>────── ·𖥸· ──────</p>
      <div class="social-links" style="margin-top: 10px; display: flex; justify-content: center; gap: 15px;">
            <a href="https://www.instagram.com/damia_ncv" target="_blank" style="color:white; font-size: 1.2rem;"><i class="fab fa-instagram"></i></a>
            <a href="https://github.com/Codetrax-web" target="_blank" style="color:white; font-size: 1.2rem;"><i class="fab fa-github"></i></a>
            <a href="https://www.tiktok.com/@damian_cdx?is_from_webapp=1&sender_device=pc" target="_blank" style="color:white; font-size: 1.2rem;"><i class="fab fa-tiktok"></i></a>
            <a href="https://discord.com/invite/rsAwuCg6xK" target="_blank" style="color:white; font-size: 1.2rem;"><i class="fab fa-discord"></i></a>
            <a href="https://www.youtube.com/@DAMIANCDX" target="_blank" style="color:white;"><i class="fab fa-youtube"></i></a>
      </div>
      </div>

      <div class="card yellow">
            <img src="assets/team/ricardo.webp" alt="Foto" class="team-photo">
            <h2>Ricardo</h2>
            <div class="profile-tag">Desarrollador Full Stack</div>
            <p>────── ·𖥸· ──────</p>
      <div class="social-links" style="margin-top: 15px; display: flex; justify-content: center; gap: 15px; font-size: 1.2rem;">

      </div>
      </div>

      <div class="card green">
            <img src="assets/team/Miguel.webp" alt="Foto" class="team-photo">
            <h2>Miguel Pandares</h2>
            <div class="profile-tag">Desarrollador Full Stack</div>
            <p>────── ·𖥸· ──────</p>
      <div class="social-links" style="margin-top: 15px; display: flex; justify-content: center; gap: 15px; font-size: 1.2rem;">
            <a href="https://github.com/MiguelTime" target="_blank" style="color:white;"><i class="fab fa-github"></i></a>
            <a href="https://www.tiktok.com/@migueltime_yt?is_from_webapp=1&sender_device=pc" target="_blank" style="color:white;"><i class="fab fa-tiktok"></i></a>
            <a href="https://www.instagram.com/migueltime_yt/" target="_blank" style="color:white;"><i class="fab fa-instagram"></i></a>
            <a href="https://discord.com/invite/SFffG38VFb" target="_blank" style="color:white;"><i class="fab fa-discord"></i></a>
            <a href="https://www.twitch.tv/migueltime" target="_blank" style="color:white;"><i class="fab fa-twitch"></i></a>
            <a href="https://www.youtube.com/channel/UC4UWTtlSDu8YyiQtpVXQ7LA" target="_blank" style="color:white;"><i class="fab fa-youtube"></i></a>

      </div>
      </div>

      <div class="card purple">
            <img src="assets/team/DynsG.webp" alt="Foto" class="team-photo">
            <h2>DynsG</h2>
            <div class="profile-tag">Diseñadora Gráfica</div>
            <p>────── ·𖥸· ──────</p>
      <div class="social-links" style="margin-top: 15px; display: flex; justify-content: center; gap: 15px; font-size: 1.2rem;">
            <a href="https://x.com/AltamarDyn3634" target="_blank" style="color:white;"><i class="fab fa-twitter"></i></a>
            <a href="https://www.youtube.com/@Dyns.g-Oficial/videos" target="_blank" style="color:white;"><i class="fab fa-youtube"></i></a>

      </div>
      </div>

      <div class="card blue">
            <img src="assets/team/tecno.webp" alt="Foto" class="team-photo">
            <h2>Tecno 730</h2>
            <div class="profile-tag">Diseñador Multimedia</div>
            <p>────── ·𖥸· ──────</p>
      <div class="social-links" style="margin-top: 15px; display: flex; justify-content: center; gap: 15px; font-size: 1.2rem;">
            <a href="https://www.tiktok.com/@tecno_730?is_from_webapp=1&sender_device=pc" target="_blank" style="color:white;"><i class="fab fa-tiktok"></i></a>
            <a href="https://www.instagram.com/tecno_730/" target="_blank" style="color:white;"><i class="fab fa-instagram"></i></a>
            <a href="https://discord.gg/tbUVxyGU" target="_blank" style="color:white;"><i class="fab fa-discord"></i></a>
            <a href="https://www.twitch.tv/tecno730" target="_blank" style="color:white;"><i class="fab fa-twitch"></i></a>
            <a href="https://www.youtube.com/@TECNO730" target="_blank" style="color:white;"><i class="fab fa-youtube"></i></a>
                    
      </div>
      </div>
                <!-- (Aplica la misma limpieza visual al resto de las tarjetas del equipo) -->
      </div>
      </div>
    </section>
`,

// --- PLANS (RECURSOS) ---
plans: `
    <div class="portfolio-page">
        <h1>『 𝙍𝙀𝘾𝙐𝙍𝙎𝙊𝙎 』</h1>
        <p>Explora nuestra biblioteca de aplicaciones, herramientas y proyectos open-source. Diseñados por CodeTrax para potenciar tu flujo de trabajo o tu propio desarrollo técnico.</p>
        <div class="portfolio-filters">
            <button class="filter-btn active" data-filter="Todos">Todos</button>
            <button class="filter-btn" data-filter="Aplicaciones">Apps</button>
            <button class="filter-btn" data-filter="juegos">Juegos</button>
            <button class="filter-btn" data-filter="office">Office</button>
            <button class="filter-btn" data-filter="Código">Código</button>
            <button class="filter-btn" data-filter="Robótica">Robótica</button>
        </div>
        <div id="recursos-container"></div>
    </div>
`,

// --- SETTINGS (PORTAFOLIO) ---
settings: `
    <section class="about-section">
        <h1 class="about-title">『 𝙋𝙊𝙍𝙏𝘼𝙁𝙊𝙇𝙄𝙊 』</h1>
        <p>Una selección curada de trabajos desarrollados por CodeTrax. Cada proyecto es testimonio de nuestra pasión por la programación, el diseño funcional y la innovación técnica.</p>
        <div class="portfolio-filters">
            <button class="filter-btn active" data-filter="Todos">Todos</button>
            <button class="filter-btn" data-filter="Damian">Damian</button>
            <button class="filter-btn" data-filter="Ricardo">Ricardo</button>
            <button class="filter-btn" data-filter="DynsG">DynsG</button>
            <button class="filter-btn" data-filter="Tecno">Tecno</button>
            <button class="filter-btn" data-filter="Miguel">Miguel</button>
        </div>
        <div id="portfolio-grid"></div>
    </section>
`,

// --- Contacto ---
contacto: `
    <section class="about-section">
        <h1 class="about-title">『 𝘾𝙊𝙉𝙏𝘼𝘾𝙏𝙊 』</h1>
        <p style="text-align: center;">¿Tienes una visión? Nosotros tenemos la tecnología. Colaboremos.</p>
        <div style="display: flex; justify-content: center; align-items: center; width: 100%; margin-top: 20px;">
            <div class="contact-hub">
                <div class="socials">
                    <a href="https://www.instagram.com/cod_etrax" target="_blank" title="Instagram"><i class="fa-brands fa-instagram"></i></a>
                    <a href="https://www.threads.net/@cod_etrax" target="_blank" title="Threads"><i class="fa-solid fa-at fa-threads-symbol"></i></a>
                    <a href="https://www.youtube.com/@DAMIANCDX" target="_blank" title="YouTube"><i class="fa-brands fa-youtube"></i></a>
                    <a href="https://www.tiktok.com/@damian_cdx" target="_blank" title="TikTok"><i class="fa-brands fa-tiktok"></i></a>
                    <a href="https://x.com/Code_trax" target="_blank" title="X"><i class="fa-brands fa-twitter"></i></a>
                </div>
                <div class="action-btns">
                    <a href="https://calendar.app.google/7iAyjJockVxnrkot9" target="_blank" class="action-btn">
                        <i class="fa-solid fa-video main-icon" style="color: #00ff5e;"></i>
                        <div class="btn-content">
                            <span class="btn-title">Google Meet</span>
                            <span class="btn-desc">Agendar consultoría</span>
                        </div>
                        <i class="fa-solid fa-chevron-right arrow-icon"></i>
                    </a>
                    <a href="https://scheduler.zoom.us/damian-m4ex7n/reuni-n-con-codetrax" target="_blank" class="action-btn">
                        <i class="fa-solid fa-video main-icon" style="color: #0062ff;"></i>
                        <div class="btn-content">
                            <span class="btn-title">Zoom</span>
                            <span class="btn-desc">Agendar reunión</span>
                        </div>
                        <i class="fa-solid fa-chevron-right arrow-icon"></i>
                    </a>
                    <a href="mailto:codetraxs@gmail.com?subject=Propuesta%20de%20Proyecto" class="action-btn">
                        <i class="fa-solid fa-envelope main-icon" style="color: #ff0000;"></i>
                        <div class="btn-content">
                            <span class="btn-title">Email Directo</span>
                            <span class="btn-desc">Contáctanos vía correo</span>
                        </div>
                        <i class="fa-solid fa-chevron-right arrow-icon"></i>
                    </a>
                </div>
            </div>
        </div>
    </section>
`
    };

    /* =====================================================
       LÓGICA DE RECURSOS
    ===================================================== */
    function renderRecursos(category) {
        const container = document.getElementById('recursos-container');
        if (!container) return;

        let filteredRecursos = category !== 'Todos' 
            ? recursosProjects.filter(item => item.categoria?.toLowerCase() === category.toLowerCase())
            : recursosProjects;

        if (filteredRecursos.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: rgba(0,0,0,0.3); border-radius: 20px; backdrop-filter: blur(10px);">
                    <p style="color: #fff; font-size: 1.2rem;">No hay recursos disponibles.</p>
                </div>`;
            return;
        }

        container.innerHTML = filteredRecursos.map(item => {
            const uniqueId = `rec_${item.titulo.toLowerCase().replace(/\s+/g, '-')}`;
            const keyTitle = item.titulo.trim().toLowerCase();
            const sheetLikeCount = sheetMetrics.Recursos[keyTitle]?.likes;

            const savedLikes = sheetLikeCount !== undefined 
                ? sheetLikeCount 
                : (localStorage.getItem(uniqueId) ? parseInt(localStorage.getItem(uniqueId)) : (parseInt(item.likes) || 0));

            const isLiked = localStorage.getItem(`${uniqueId}_liked`) === 'true';

            return `
                <div class="project-card" data-card-id="${uniqueId}" data-title="${item.titulo}" data-tab="Recursos">
                    <div class="card-inner">
                        <div class="card-front">
                            <img src="${item.imagen}" alt="${item.titulo}" onerror="this.src='assets/placeholder.webp'">
                            <div class="card-divider"></div>
                            <h3>${item.titulo}</h3>
                            <p class="card-subtitle">Creador: ${item.creador || 'Desconocido'}</p>
                            <span class="card-category-badge">${item.categoria || 'General'}</span>
                        </div>
                        <div class="card-back">
                            <h3>${item.titulo}</h3>
                            <p class="card-description-text">${item.descripcion}</p>
                            <div class="card-back-actions">
                                <button class="like-btn ${isLiked ? 'liked' : ''}" data-id="${uniqueId}">
                                    <div class="like-content">
                                        <i class="fa-solid fa-heart"></i>
                                        <span>Likes</span>
                                    </div>
                                    <span class="like-count">${savedLikes}</span>
                                </button>
                                <a href="${item.url}" target="_blank" class="project-link" style="text-decoration: none;">
                                    <button class="button">
                                        <div class="blob1"></div>
                                        <div class="blob2"></div>
                                        <div class="inner" style="padding: 8px 18px; font-size: 0.85rem;">VISITA</div>
                                    </button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /* =====================================================
       INICIALIZACIÓN Y NAVEGACIÓN
    ===================================================== */
    mainContent.innerHTML = views.home;
    animateCounters();

    document.querySelectorAll('.menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.menu a.active')?.classList.remove('active');
            link.classList.add('active');

            const section = link.getAttribute('data-section');
            mainContent.innerHTML = views[section];

            if (section === "home") setTimeout(animateCounters, 100);
            if (section === 'plans') {
                renderRecursos('Todos');
                initializeFilters();
            }
            if (section === 'settings') {
                renderPortfolio('Todos'); 
                initializeFilters();
            }
        });
    });

    // Búsqueda auxiliar de objeto por título
    window.findProjectByTitle = function(title, tabName) {
        const list = tabName === 'Recursos' ? recursosProjects : portfolioProjects;
        return list.find(p => p.titulo && p.titulo.toLowerCase() === title.toLowerCase()) || { titulo: title };
    };
});

/* =====================================================
   CONTROLADOR DE LIKES (ESCRIBE EN GOOGLE SHEETS)
===================================================== */
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.like-btn');
    if (!btn) return;

    e.stopPropagation();

    const card = btn.closest('.project-card');
    const id = btn.dataset.id;
    const projectTitle = card ? card.dataset.title : null;
    const tabName = card ? card.dataset.tab : 'Portafolio';

    const countSpan = btn.querySelector('.like-count');
    let currentLikes = parseInt(countSpan.textContent) || 0;
    
    const likedKey = `${id}_liked`;
    const isAlreadyLiked = localStorage.getItem(likedKey) === 'true';

    if (!isAlreadyLiked) {
        currentLikes++;
        localStorage.setItem(likedKey, 'true');
        btn.classList.add('liked');
    } else {
        currentLikes = Math.max(0, currentLikes - 1);
        localStorage.setItem(likedKey, 'false');
        btn.classList.remove('liked');
    }

    localStorage.setItem(id, currentLikes);
    countSpan.textContent = currentLikes;

    if (projectTitle) {
        const project = window.findProjectByTitle(projectTitle, tabName);
        window.updateSheetCounter(project, 'likes', currentLikes, tabName);
    }
});

/* =====================================================
   CONTROLADOR DE CLICS EN "VER" / "VISITA" (REGISTRA VISTAS)
===================================================== */
document.addEventListener('click', (e) => {
    const link = e.target.closest('.project-link');
    if (!link) return;

    const card = link.closest('.project-card');
    if (!card) return;

    const projectTitle = card.dataset.title;
    const tabName = card.dataset.tab;

    if (projectTitle) {
        let currentViews = parseInt(localStorage.getItem(`views_${projectTitle}`)) || 0;
        currentViews++;
        localStorage.setItem(`views_${projectTitle}`, currentViews);

        const project = window.findProjectByTitle(projectTitle, tabName);
        window.updateSheetCounter(project, 'vistas', currentViews, tabName);
    }
});

/* =====================================================
   CONTROLADOR DE GIRO DE TARJETAS (FLIP 3D)
===================================================== */
document.addEventListener('click', (e) => {
    if (e.target.closest('.like-btn') || e.target.closest('.project-link')) return;

    const card = e.target.closest('.project-card');
    if (!card) return;

    document.querySelectorAll('.project-card').forEach(c => {
        if (c !== card) c.classList.remove('flipped');
    });

    card.classList.toggle('flipped');
});