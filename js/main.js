/* =====================================================
   INICIALIZACIÓN DEL DOM
   Espera a que el HTML cargue para ejecutar la lógica
===================================================== */

document.addEventListener('DOMContentLoaded', () => {
    loadPortfolio().catch(err => console.error("Datos iniciales no disponibles:", err));
    console.log("CodeTrax inicializado correctamente.");
    const mainContent = document.getElementById('content');

    /* =====================================================
       ESTRUCTURAS DE DATOS Y RENDERIZADO
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

    /* =====================================================
       LÓGICA DEL PORTAFOLIO
       Carga datos externos y gestiona filtros
    ===================================================== */

    async function loadPortfolio() {
        try {
            const [portafolioRes, recursosRes] = await Promise.all([
                fetch('./data/portafolio/index.json'),
                fetch('./data/recursos/recursos.json')
            ]);

            const portafolioData = await portafolioRes.json();
            const recursosData = await recursosRes.json();

            portfolioProjects = portafolioData; 
            recursosProjects = recursosData; 

            window.searchableData = [
                ...portafolioData,
                ...recursosData,
                { titulo: "Damian Cruz", descripcion: "Fundador | CEO", imagen: "assets/team/Damian.jpg", url: "https://codetrax-web.github.io/presentasion/" },
                { titulo: "Ricardo", descripcion: "Desarrollador Full Stack", imagen: "assets/team/ricardo.jpg", url: "#" },
                { titulo: "DynsG", descripcion: "Diseñadora Gráfica", imagen: "assets/team/DynsG.jpg", url: "https://youtube.com/@dyns.g-oficial?si=Nhl0NTcDzmamv2s7" },
                { titulo: "Tecno 730", descripcion: "Diseñador Multimedia", imagen: "assets/team/tecno.jpg", url: "https://linktr.ee/__TECNO730__" },
                { titulo: "Miguel Pandares", descripcion: "Desarrollador Full Stack", imagen: "assets/team/Miguel.jpg", url: "https://linktr.ee/migueltime" }
            ];

            renderPortfolio('Todos');
            initializeFilters();
        } catch (error) {
            console.error('Error cargando datos:', error);
        }
    }

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
            const savedLikes = localStorage.getItem(uniqueId) ? parseInt(localStorage.getItem(uniqueId)) : (project.likes || 12);
            const isLiked = localStorage.getItem(`${uniqueId}_liked`) === 'true';

            return `
                <div class="project-card" data-card-id="${uniqueId}">
                    <div class="card-inner">
                        <!-- CARA FRONTAL -->
                        <div class="card-front">
                            <img src="${project.imagen}" alt="${project.titulo}" onerror="this.src='assets/placeholder.jpg'">
                            <div class="card-divider"></div>
                            <h3>${project.titulo}</h3>
                            <p class="card-subtitle">Creador: ${project.creador || 'Desconocido'}</p>
                            <span class="card-category-badge">${project.categoria || 'General'}</span>
                        </div>
                        
                        <!-- CARA POSTERIOR (AL GIRAR) -->
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

                                <a href="${project.url}" target="_blank" class="project-link" onclick="event.stopPropagation();" style="text-decoration: none;">
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
       LÓGICA DE BÚSQUEDA Y FILTRADO POR APARTADO
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
                            <img src="${p.imagen}" alt="${p.titulo}" onerror="this.src='assets/placeholder.jpg'">
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
        if (inputTarget) {
            inputTarget.focus();
        }
    });

    /* =====================================================
       GESTIÓN DE VISTAS
    ===================================================== */
    const views = { 
      // --- HOME ---
home: `
    <section class="about-section">
        <h1 class="about-title">匚ㄖᗪ乇TST尺卂乂</h1>
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
        <h1 class="about-title">『 𝑺𝒐𝒃𝒓𝒆 𝑪𝒐𝒅𝒆𝑻𝒓𝒂𝒙 』</h1>
        
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
            <img src="assets/team/Damian.jpg" alt="Foto" class="team-photo">
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
            <img src="assets/team/ricardo.jpg" alt="Foto" class="team-photo">
            <h2>Ricardo</h2>
            <div class="profile-tag">Desarrollador Full Stack</div>
            <p>────── ·𖥸· ──────</p>
      <div class="social-links" style="margin-top: 15px; display: flex; justify-content: center; gap: 15px; font-size: 1.2rem;">

      </div>
      </div>

      <div class="card green">
            <img src="assets/team/Miguel.jpg" alt="Foto" class="team-photo">
            <h2>Miguel Pandares</h2>
            <div class="profile-tag">Desarrollador Full Stack</div>
            <p>────── ·𖥸· ──────</p>
      <div class="social-links" style="margin-top: 15px; display: flex; justify-content: center; gap: 15px; font-size: 1.2rem;">
            <a href="https://github.com/MiguelTime" target="_blank" style="color:white;"><i class="fab fa-github"></i></a>
            <a href="https://www.tiktok.com/@migueltime_yt?is_from_webapp=1&sender_device=pc" target="_blank" style="color:white;"><i class="fab fa-tiktok"></i></a>
            <a href="https://www.instagram.com/migueltime" target="_blank" style="color:white;"><i class="fab fa-instagram"></i></a>
            <a href="https://discord.com/invite/SFffG38VFb" target="_blank" style="color:white;"><i class="fab fa-discord"></i></a>
            <a href="https://www.twitch.tv/migueltime" target="_blank" style="color:white;"><i class="fab fa-twitch"></i></a>
            <a href="https://www.youtube.com/channel/UC4UWTtlSDu8YyiQtpVXQ7LA" target="_blank" style="color:white;"><i class="fab fa-youtube"></i></a>

      </div>
      </div>

      <div class="card purple">
            <img src="assets/team/DynsG.jpg" alt="Foto" class="team-photo">
            <h2>DynsG</h2>
            <div class="profile-tag">Diseñadora Gráfica</div>
            <p>────── ·𖥸· ──────</p>
      <div class="social-links" style="margin-top: 15px; display: flex; justify-content: center; gap: 15px; font-size: 1.2rem;">
            <a href="https://x.com/AltamarDyn3634" target="_blank" style="color:white;"><i class="fab fa-twitter"></i></a>
            <a href="https://www.youtube.com/@Dyns.g-Oficial/videos" target="_blank" style="color:white;"><i class="fab fa-youtube"></i></a>

      </div>
      </div>

      <div class="card blue">
            <img src="assets/team/tecno.jpg" alt="Foto" class="team-photo">
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
        <h1>『 𝑹𝒆𝒄𝒖𝒓𝒔𝒐𝒔 𝑫𝒊𝒈𝒊𝒕𝒂𝒍𝒆𝒔 』</h1>
        <p>Explora nuestra biblioteca de aplicaciones, herramientas y proyectos open-source. Diseñados por CodeTrax para potenciar tu flujo de trabajo o tu propio desarrollo técnico.</p>
        <div class="portfolio-filters">
            <button class="filter-btn active" data-filter="Todos">Todos</button>
            <button class="filter-btn" data-filter="Apps">Apps</button>
            <button class="filter-btn" data-filter="juegos">Juegos</button>
            <button class="filter-btn" data-filter="office">Office</button>
            <button class="filter-btn" data-filter="codigo">Código</button>
            <button class="filter-btn" data-filter="robotica">Robótica</button>
        </div>
        <div id="recursos-container"></div>
    </div>
`,

// --- SETTINGS (PORTAFOLIO) ---
settings: `
    <section class="about-section">
        <h1 class="about-title">『 𝑷𝒐𝒓𝒕𝒂𝒇𝒐𝒍𝒊𝒐 𝒅𝒆 𝑷𝒓𝒐𝒚𝒆𝒄𝒕𝒐𝒔 』</h1>
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

// --- CONTACTO ---
contacto: `
    <section class="about-section">
        <h1 class="about-title">『 𝑪𝒐𝒏𝒕𝒂𝒄𝒕𝒐 』</h1>
        <p style="text-align: center;">¿Tienes una visión? Nosotros tenemos la tecnología. Colaboremos.</p>
        <div style="display: flex; justify-content: center; align-items: center; width: 100%; margin-top: 20px;">
            <div class="contact-hub">
                <div class="socials">
                    <a href="https://www.instagram.com/cod_etrax" target="_blank" title="Instagram"><i class="fa-brands fa-instagram"></i></a>
                    <a href="https://www.threads.net/@cod_etrax" target="_blank" title="Threads"><i class="fa-solid fa-at"></i></a>
                    <a href="https://www.youtube.com/@DAMIANCDX" target="_blank" title="YouTube"><i class="fa-brands fa-youtube"></i></a>
                    <a href="https://www.tiktok.com/@damian_cdx" target="_blank" title="TikTok"><i class="fa-brands fa-tiktok"></i></a>
                    <!-- Corregido el icono de X (Twitter) -->
                    <a href="https://x.com/Code_trax" target="_blank" title="X"><i class="fa-brands fa-x-twitter"></i></a>
                </div>
                <div class="action-btns">
                    <a href="https://calendar.app.google/7iAyjJockVxnrkot9" target="_blank" class="action-btn meet">
                        <div class="icon-box"><i class="fa-solid fa-video"></i></div>
                        <div class="btn-content">
                            <p class="btn-title">Google Meet</p>
                            <p class="btn-sub">Agendar consultoría</p>
                        </div>
                        <div class="btn-arrow"><i class="fa-solid fa-chevron-right"></i></div>
                    </a>
                    <a href="https://scheduler.zoom.us/damian-m4ex7n/reuni-n-con-codetrax" target="_blank" class="action-btn zoom">
                        <div class="icon-box"><i class="fa-solid fa-video"></i></div>
                        <div class="btn-content">
                            <p class="btn-title">Zoom</p>
                            <p class="btn-sub">Agendar reunión</p>
                        </div>
                        <div class="btn-arrow"><i class="fa-solid fa-chevron-right"></i></div>
                    </a>
                    <a href="mailto:codetraxs@gmail.com?subject=Propuesta%20de%20Proyecto" class="action-btn email">
                        <div class="icon-box"><i class="fa-solid fa-envelope"></i></div>
                        <div class="btn-content">
                            <p class="btn-title">Email Directo</p>
                            <p class="btn-sub">Contáctanos vía correo</p>
                        </div>
                        <div class="btn-arrow"><i class="fa-solid fa-chevron-right"></i></div>
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
            const savedLikes = localStorage.getItem(uniqueId) ? parseInt(localStorage.getItem(uniqueId)) : (item.likes || 24);
            const isLiked = localStorage.getItem(`${uniqueId}_liked`) === 'true';

            return `
                <div class="project-card" data-card-id="${uniqueId}">
                    <div class="card-inner">
                        <div class="card-front">
                            <img src="${item.imagen}" alt="${item.titulo}" onerror="this.src='assets/placeholder.jpg'">
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
                                <a href="${item.url}" target="_blank" class="project-link" onclick="event.stopPropagation();" style="text-decoration: none;">
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

    async function loadRecursos() {
        try {
            if (recursosProjects.length === 0) {
                const response = await fetch('./data/recursos/recursos.json');
                recursosProjects = await response.json();
            }
            renderRecursos('Todos');
            initializeFilters();
        } catch (error) {
            console.error('Error cargando recursos:', error);
            const container = document.getElementById('recursos-container');
            if (container) container.innerHTML = '<p>No se pudieron cargar los recursos.</p>';
        }
    }

    /* =====================================================
       INICIALIZACIÓN Y EVENTOS GLOBALES
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
            if(section === "home"){
               setTimeout(()=>{
               animateCounters();
               },100);
            }

            if (section === 'plans') {
                loadRecursos();
            } 

            if (section === 'settings') {
                renderPortfolio('Todos'); 
                initializeFilters();
            }

            if (section === 'contacto') {
                setTimeout(() => {
                    document.querySelectorAll('.action-btn').forEach(btn => {
                        btn.addEventListener('mousedown', function() { this.style.transform = 'scale(0.97)'; });
                        btn.addEventListener('mouseup', function() { this.style.transform = 'scale(1)'; });
                        btn.addEventListener('mouseleave', function() { this.style.transform = ''; });
                    });
                }, 100);
            }
        });
    });
});

/* =====================================================
   LÓGICA DE PARTÍCULAS DE FONDO (VERSIÓN MODIFICADA)
===================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('bg-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    const numberOfParticles = 120; 
    const katakana = "゠ァアィイゥウェエォオカガキギクグケゲコザシジスズセゼソダヂヅデドナニヌネノハバパヒビピフブプヘベペホボポマミムメモヤユヨラリルレロワンヷヸヹヺ・ーヽヾ";
    const symbolArray = katakana.split(''); 
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 10 + 14;
            this.speedX = 0; 
            this.speedY = Math.random() * 1 + 0.5; 
            const colors = ['#007bff', '#ff2d55', '#ffffff']; 
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.symbol = symbolArray[Math.floor(Math.random() * symbolArray.length)];
            this.opacity = Math.random(); 
        }
        update() {
            this.y += this.speedY;
            this.opacity = Math.random() * 0.5 + 0.5; 
            if (this.y > canvas.height) {
                this.y = 0;
                this.x = Math.random() * canvas.width;
                this.symbol = symbolArray[Math.floor(Math.random() * symbolArray.length)];
            }
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            ctx.font = `${this.size}px monospace`; 
            ctx.textAlign = 'center';
            ctx.globalAlpha = this.opacity; 
            ctx.fillText(this.symbol, this.x, this.y);
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1; 
        }
    }
    function initParticles() {
        particlesArray = [];
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particlesArray.forEach(particle => {
            particle.update();
            particle.draw();
        });
        requestAnimationFrame(animateParticles);
    }
    initParticles();
    animateParticles();
});

/* =====================================================
   LÓGICA DE LA INTRO DE VIDEO
===================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const introOverlay = document.getElementById('video-intro-overlay');
    const introVideo = document.getElementById('intro-video');
    const skipBtn = document.getElementById('skip-intro');

    if (!introOverlay || !introVideo) return;

    function hideIntro() {
        introOverlay.style.opacity = '0';
        setTimeout(() => {
            introOverlay.style.display = 'none';
            introVideo.pause();
            introVideo.currentTime = 0;
        }, 800);
    }

    introVideo.addEventListener('ended', hideIntro);

    if (skipBtn) {
        skipBtn.addEventListener('click', hideIntro);
    }

    introVideo.addEventListener('error', () => {
        console.warn("No se pudo cargar el video de introducción. Saltando intro.");
        hideIntro();
    });
});

/* =====================================================
   CONTROLADOR GLOBAL DE LIKES
===================================================== */
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.like-btn');
    if (!btn) return;

    const id = btn.dataset.id;
    const countSpan = btn.querySelector('.like-count');
    let currentLikes = parseInt(countSpan.textContent);
    
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
});

/* =====================================================
   CONTROLADOR DE GIRO DE TARJETAS (FLIP 3D)
===================================================== */
document.addEventListener('click', (e) => {
    if (e.target.closest('.like-btn') || e.target.closest('.project-link')) return;

    const card = e.target.closest('.project-card') || e.target.closest('.resource-card');
    if (!card) return;

    document.querySelectorAll('.project-card, .resource-card').forEach(c => {
        if (c !== card) c.classList.remove('flipped');
    });

    card.classList.toggle('flipped');
});
