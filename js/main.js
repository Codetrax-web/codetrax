/* =====================================================
   VARIABLES GLOBALES Y CONFIGURACIÓN
===================================================== */
let portfolioProjects = [];
let allData = []; // Para el buscador global

/* =====================================================
   LÓGICA DE DATOS
===================================================== */
async function loadPortfolio() {
    try {
        const [portafolioRes, recursosRes] = await Promise.all([
            fetch('./data/portafolio/index.json'),
            fetch('./data/recursos/recursos.json')
        ]);

        portfolioProjects = await portafolioRes.json();
        const recursosData = await recursosRes.json();

        // Datos para el buscador global
        allData = [...portfolioProjects, ...recursosData];
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

/* =====================================================
   FUNCIONES DE RENDERIZADO (Fuera del DOMContentLoaded)
===================================================== */
function renderPortfolio(category = 'Todos') {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;

    let filtered = category === 'Todos' 
        ? portfolioProjects 
        : portfolioProjects.filter(p => p.categoria?.toLowerCase() === category.toLowerCase());

    grid.innerHTML = filtered.map(p => `
        <div class="project-card">
            <img src="${p.imagen}" alt="${p.titulo}" onerror="this.src='assets/placeholder.jpg'">
            <h3>${p.titulo}</h3>
            <p>${p.descripcion}</p>
        </div>
    `).join('');
}

function initializeFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-btn.active')?.classList.remove('active');
            btn.classList.add('active');
            renderPortfolio(btn.getAttribute('data-filter'));
        });
    });
}

/* =====================================================
   INICIALIZACIÓN DEL DOM
===================================================== */
document.addEventListener('DOMContentLoaded', async () => {
    await loadPortfolio();
    const mainContent = document.getElementById('content');
    mainContent.innerHTML = views.home;

    // Lógica de navegación
    document.querySelectorAll('.menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            mainContent.innerHTML = views[section];
            
            if (section === 'settings') {
                renderPortfolio('Todos');
                initializeFilters();
            }
            if (section === 'plans') {
                loadRecursos();
            }
        });
    });
});
    /* FIN LÓGICA DEL PORTAFOLIO */

    /* ====================================================
       GESTIÓN DE VISTAS
       Definición de las plantillas HTML para cada sección
    ===================================================== */

    const views = {
     home: `
     <h1>Dashboard</h1>
     ${renderSearch()}
     <div id="search-results-grid"></div> 
     <div class="social-container">Buscando...</div>
      `,

      files: `
    <section class="about-section">
        <h1 class="about-title">Sobre CodeTrax</h1>

        <div class="about-card">
            <h2>01 // ¿Qué es CodeTrax?</h2>
            <p>En CodeTrax transformamos conceptos abstractos en infraestructura digital de alto rendimiento. Somos una agencia de desarrollo especializada en materializar ideas complejas mediante código limpio, interfaces avanzadas y soluciones tecnológicas reales que garantizan un despliegue impecable en el mercado.</p>
        </div>

        <div class="about-card">
            <h2>02 // Servicios / Qué ofrecemos:</h2>
            <p> Desarrollo Digital: Apps, plataformas y herramientas funcionales</p>
            <p> Consultoría de Proyectos: Planificamos y estructuramos tu proyecto para que sea viable, escalable y efectivo.</p>
            <p> Diseño y Experiencia: Cada proyecto se entrega con estética, usabilidad y funcionalidad optimizadas.</p>
        </div>

        <div class="about-card">
            <h2>03 // Filosofía [Misión y Valores]:</h2>
            <p>Misión: Desarrollar ingeniería digital que trabaje para ti. Elevamos el estándar técnico para que la tecnología no sea un obstáculo, sino tu mayor ventaja competitiva.</p>
            <p>Valores:</p>
            <p>+ Precisión</p>
            <p>+ Innovación</p>
            <p>+ Compromiso</p>
        </div>

        <div class="about-card">
            <h2>04 // Metodología / Cómo trabajamos:</h2>
            <p>Nuestra metodología se ejecuta en un ciclo cerrado de cuatro fases:</p>
            <p>1° [ANÁLISIS] Evaluamos los requerimientos técnicos y estructuramos la lógica del proyecto.</p>
            <p>2° [DESARROLLO] Traducimos la arquitectura planificada en código limpio y funcional.</p>
            <p>3° [OPTIMIZACIÓN] Sometemos el sistema a pruebas rigurosas de rendimiento y diseño responsivo.</p>
            <p>4° [DESPLIEGUE] Lanzamos la plataforma oficialmente al entorno de producción, lista para operar.</p>

        </div>
        <div class="about-card">
            <h2>05 // Infraestructura [Equipo]:</h2>
            <div class="team-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">

                <div class="card red">
                    <div class="profile-tag">Fundador: Mexico</div>
                    <img src="assets/team/Damian.jpg" alt="Foto" class="team-photo">
                    <h2>Damian cruz</h2>
                    <p>Desarrollador principal | Codetrax</p>
               <div class="social-links" style="margin-top: 10px; display: flex; justify-content: center; gap: 15px;">
                     <a href="https://www.instagram.com/damia_ncv" target="_blank" style="color:white; font-size: 1.2rem;"><i class="fab fa-instagram"></i></a>
                     <a href="https://github.com/Codetrax-web" target="_blank" style="color:white; font-size: 1.2rem;"><i class="fab fa-github"></i></a>
                     <a href="https://www.tiktok.com/@damian_cdx?is_from_webapp=1&sender_device=pc" target="_blank" target="_blank" style="color:white; font-size: 1.2rem;"><i class="fab fa-tiktok"></i></a>
                     <a href="https://discord.com/invite/rsAwuCg6xK" target="_blank" style="color:white; font-size: 1.2rem;"><i class="fab fa-discord"></i></a>
                    <a href="https://www.youtube.com/@DAMIANCDX" target="_blank" style="color:white;"><i class="fab fa-youtube"></i></a>
               </div>
                </div>
                
                <div class="card yellow">
                    <div class="profile-tag">Socio: Mexico</div>
                    <img src="assets/team/ricardo.jpg" alt="Foto" class="team-photo">
                    <h2>Ricardo</h2>
                    <p>Desarrollador | Codetrax</p>
               <div class="social-links" style="margin-top: 15px; display: flex; justify-content: center; gap: 15px; font-size: 1.2rem;">
               </div>
                </div>

               <div class="card purple">
                    <div class="profile-tag">Socia: Colombia</div>
                    <img src="assets/team/DynsG.jpg" alt="Foto" class="team-photo">
                    <h2>DynsG</h2>
                    <p>Diseñadora | Codetrax</p>
               <div class="social-links" style="margin-top: 15px; display: flex; justify-content: center; gap: 15px; font-size: 1.2rem;">
                     <a href="https://x.com/AltamarDyn3634" target="_blank" style="color:white;"><i class="fab fa-twitter"></i></a>
                     <a href="https://www.youtube.com/@Dyns.g-Oficial/videos" target="_blank" style="color:white;"><i class="fab fa-youtube"></i></a>
                </div>
                </div>
                
                <div class="card blue">
                    <div class="profile-tag">Socio: Venezuela</div>
                    <img src="assets/team/tecno.jpg" alt="Foto" class="team-photo">
                    <h2>Tecno 730</h2>
                    <p>Diseñador | tecno730</p>
               <div class="social-links" style="margin-top: 15px; display: flex; justify-content: center; gap: 15px; font-size: 1.2rem;">
                     <a href="https://www.tiktok.com/@tecno_730?is_from_webapp=1&sender_device=pc" target="_blank" style="color:white;"><i class="fab fa-tiktok"></i></a>
                     <a href="https://www.instagram.com/tecno_730/" target="_blank" style="color:white;"><i class="fab fa-instagram"></i></a>
                     <a href="https://discord.gg/tbUVxyGU" target="_blank" style="color:white;"><i class="fab fa-discord"></i></a>
                     <a href="https://www.twitch.tv/tecno730" target="_blank" style="color:white;"><i class="fab fa-twitch"></i></a>
                     <a href="https://www.youtube.com/@TECNO730" target="_blank" style="color:white;"><i class="fab fa-youtube"></i></a>
               </div>
                </div>

                <div class="card green">
                    <div class="profile-tag">Socio: Venezuela</div>
                    <img src="assets/team/Miguel.jpg" alt="Foto" class="team-photo">
                    <h2>Miguel Pandares</h2>
                    <p>Desarrollador | Axira studios</p>
               <div class="social-links" style="margin-top: 15px; display: flex; justify-content: center; gap: 15px; font-size: 1.2rem;">
                     <a href="https://github.com/MiguelTime" target="_blank" style="color:white;"><i class="fab fa-github"></i></a>
                     <a href="https://www.tiktok.com/@migueltime_yt?is_from_webapp=1&sender_device=pc" target="_blank" style="color:white;"><i class="fab fa-tiktok"></i></a>
                     <a href="hatgpt.com" target="_blank" style="color:white;"><i class="fab fa-instagram"></i></a>
                     <a href="https://discord.com/invite/SFffG38VFb" target="_blank" style="color:white;"><i class="fab fa-discord"></i></a>
                     <a href="https://www.twitch.tv/migueltime" target="_blank" style="color:white;"><i class="fab fa-twitch"></i></a>
                     <a href="https://www.youtube.com/channel/UC4UWTtlSDu8YyiQtpVXQ7LA" target="_blank" style="color:white;"><i class="fab fa-youtube"></i></a>
                  </div>
                </div>
            </div>
        </div>
    </section>
`,

      plans: `
        <div class="portfolio-page">
            <h1>Recursos</h1>
            <p>Un ecosistema integral de herramientas avanzadas, utilidades de optimización y recursos de desarrollo de alto rendimiento. Si los sistemas base no se adaptan por completo a la arquitectura de tu proyecto, puedes solicitar una personalización exclusiva a la medida de tus necesidades técnicas.</p>
            <div class="portfolio-filters">
                <button class="filter-btn active" data-filter="Todos">Todos</button>
                <button class="filter-btn" data-filter="Juegos">Juegos</button>
                <button class="filter-btn" data-filter="Office">Office</button>
                <button class="filter-btn" data-filter="Codigo">Código</button>
                <button class="filter-btn" data-filter="Robotica">Robotica</button>
            </div>
            <div id="recursos-container"></div>
        </div>
      `,

       settings: `
    <section class="about-section">
        <h1 class="about-title">Portafolio</h1>
        <p>Aquí se despliega la evidencia de nuestra capacidad técnica...</p>
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
                    <p><strong>Creador:</strong> ${item.creador || 'Desconocido'}</p>
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
        // Lógica de carga limpia: Cada sección hace exactamente lo que debe
if (section === 'plans') {
    // Solo carga Recursos en el contenedor de recursos
    loadRecursos();
} 

if (section === 'settings') {
    // Solo carga Portafolio en el contenedor de portafolio
    renderPortfolio('Todos'); 
    initializeFilters();
}
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
    console.log("CodeTrax inicializado correctamente.");
    /* FIN INICIALIZACIÓN Y EVENTOS GLOBALES */
}); 

