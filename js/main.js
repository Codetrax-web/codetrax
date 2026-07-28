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
        <span class="gt-input">
            <span class="gt-input__prompt">&gt;</span>
            <input type="text" id="gt-input-target" class="gt-input__control" placeholder="Buscar proyectos...">
        </span>
        <div id="search-results-grid"></div> </div>
`;

    let portfolioProjects = [];
    let recursosProjects = []; // Almacenar recursos para filtrar
    /* FIN ESTRUCTURAS DE DATOS */
   const searchableData = [
    ...portfolioProjects,

    [
   { titulo: "Damian cruz", descripcion: "Fundador | CEO" },
    { titulo: "Ricardo", descripcion: "Desarrollador Full Stack" },
    { titulo: "Tecno 730", descripcion: "Diseñador Multimedia" },
    { titulo: "Miguel Pandares", descripcion: "Desarrollador Full Stack" },
    { titulo: "DynsG", descripcion: "Diseñadora Gráfica" }

]
];

    /* =====================================================
       LÓGICA DEL PORTAFOLIO
       Carga datos externos y gestiona filtros
    ===================================================== */

   async function loadPortfolio() {
    try {
        // Carga ambos archivos en paralelo para optimizar
           const [portafolioRes, recursosRes] = await Promise.all([
    fetch('./data/portafolio/index.json'),
    fetch('./data/recursos/recursos.json')
]);

        const portafolioData = await portafolioRes.json();
        const recursosData = await recursosRes.json();

        portfolioProjects = portafolioData; // Para el renderizado normal
        recursosProjects = recursosData; // Almacenar para filtrar en Recursos

        // Fusiona ambos para el buscador, incluyendo al equipo

        window.searchableData = [
            ...portafolioData,
            ...recursosData,
           
           [
            { titulo: "Damian cruz", descripcion: "Fundador | CEO", imagen: "assets/team/Damian.jpg", url: "https://codetrax-web.github.io/presentasion/" },
            { titulo: "Ricardo", descripcion: "Desarrollador Full Stack", imagen: "assets/team/ricardo.jpg", url: "#" },
            { titulo: "DynsG", descripcion: "Diseñadora Gráfica", imagen: "assets/team/DynsG.jpg", url: "https://youtube.com/@dyns.g-oficial?si=Nhl0NTcDzmamv2s7" },
            { titulo: "Tecno 730", descripcion: "Diseñador Multimedia", imagen: "assets/team/tecno.jpg", url: "https://linktr.ee/__TECNO730__" },
            { titulo: "Miguel Pandares", descripcion: "Desarrollador Full Stack", imagen: "assets/team/Miguel.jpg", url: "https://linktr.ee/migueltime" }
            
]
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

    // Lógica de filtrado

    let filteredProjects = category !== 'Todos' 
        ? portfolioProjects.filter(project => project.categoria?.toLowerCase() === category.toLowerCase())
        : portfolioProjects;

    // Validación de estado vacío con estilo consistente
    if (filteredProjects.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: rgba(0,0,0,0.3); border-radius: 20px; backdrop-filter: blur(10px);">
                <p style="color: #fff; font-size: 1.2rem;">No hay proyectos disponibles.</p>
            </div>`;
        return;
    }

    // Renderizado de tarjetas

    grid.innerHTML = filteredProjects.map(project => `
        <div class="project-card">
            <img src="${project.imagen}" alt="${project.titulo}" onerror="this.src='assets/placeholder.jpg'">
            <h3>${project.titulo}</h3>
            <p style="font-size: 0.85rem; color: #a1a1aa;">Creador: ${project.creador || 'Desconocido'}</p>
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
    const counters=document.querySelectorAll(".counter");
    counters.forEach(counter=>{
        const target=+counter.dataset.target;
        let current=0;
        const increment=Math.max(1,Math.ceil(target/100));
        const update=()=>{
            current+=increment;
            if(current>=target){
                counter.textContent=target;
                return;
            }
            counter.textContent=current;
            requestAnimationFrame(update);
        }
        update();
    });
}

      document.addEventListener('input', (e) => {
          if (e.target.id === 'gt-input-target') {
           const term = e.target.value.toLowerCase();
           const resultsGrid = document.getElementById('search-results-grid');

        // Si no hay datos, no hace nada
        if (!term || !window.searchableData) { 
            if (resultsGrid) resultsGrid.innerHTML = ''; 
            return; 
        }

        const filtered = window.searchableData.filter(p => 
            p.titulo?.toLowerCase().includes(term) || 
            (p.descripcion && p.descripcion.toLowerCase().includes(term))
        );

        resultsGrid.innerHTML = filtered.map(p => `
            <div class="project-card">
                <img src="${p.imagen}" alt="${p.titulo}" onerror="this.src='assets/placeholder.jpg'">
                <h3>${p.titulo}</h3>
                <p>${p.descripcion}</p>
                <a href="${p.url}" target="_blank" class="project-link">
                    <button class="button"><div class="inner">Ver</div></button>
                </a>
            </div>
        `).join('');
    }
});

    /* FIN LÓGICA DEL PORTAFOLIO */

    /* =====================================================
       GESTIÓN DE VISTAS
       Definición de las plantillas HTML para cada sección
    ===================================================== */
    const views = { 
  home: `
    <section class="about-section">
        <h1 class="about-title">匚ㄖᗪ乇ㄒ尺卂乂</h1>
        <br>
        <h2>
            Donde las ideas se convierten en experiencias digitales.
        </h2>
        <p>
            Un equipo de creadores y desarrolladores que combina
            creatividad, tecnología y colaboración para construir
            proyectos digitales con identidad.
        </p>
        <br>
        ${renderSearch()}
        <div id="search-results-grid"></div>
        <div class="social-container">
            LETS_GO...
        </div>
    </section>
        <section class="stats-section">
    <div class="stat-card">
        <h2 class="counter" data-target="15">0</h2>
        <p>Proyectos</p>
    </div>
    <div class="stat-card">
        <h2 class="counter" data-target="5">0</h2>
        <p>Integrantes</p>
    </div>
    <div class="stat-card">
        <h2 class="counter" data-target="2026">0</h2>
        <p>Fundación</p>
    </div>
    <div class="stat-card">
        <h2 class="counter" data-target="6">0</h2>
        <p>Servicios</p>
    </div>
</section>
`,
      files: `
          <section class="about-section">
           <h1 class="about-title">『 𝑺𝒐𝒃𝒓𝒆 𝑪𝒐𝒅𝒆𝑻𝒓𝒂𝒙 』</h1>
           <div class="about-card">
            <h2>01 // ¿Qué es CodeTrax?</h2>
            <p>CodeTrax es una agencia de desarrollo digital especializada en crear soluciones tecnológicas y creativas. Nuestro trabajo combina programación, diseño, automatización y producción multimedia para desarrollar proyectos personalizados que se adaptan a las necesidades de cada cliente.
            No trabajamos con un único servicio; reunimos distintas disciplinas para construir desde una identidad visual hasta aplicaciones, sitios web, herramientas, contenido multimedia o sistemas automatizados. Cada proyecto es diferente y por eso buscamos la mejor solución para cada caso.</p>
        </div>
        <div class="about-card">
            <h2>02 // Servicios / Qué ofrecemos:</h2>
            <p>✧ [Desarrollo]:Desarrollo de sitios web, aplicaciones, sistemas personalizados, herramientas digitales, automatización, optimización de código e integración de tecnologías.</p>
            <p>✧ [Diseño]:Diseño de logotipos, banners, miniaturas, interfaces, identidad visual, material gráfico y recursos digitales para marcas y creadores.</p>
            <p>✧ [Multimedia]:Producción y edición de audio, música, efectos de sonido, contenido visual y recursos multimedia para proyectos digitales.</p>
            <p>✧ [Videojuegos]:Desarrollo de modificaciones (mods), herramientas, recursos gráficos y soluciones técnicas para videojuegos.</p>
            <p>✧ [Consultoría]:Asesoramos proyectos desde su planificación hasta su implementación, ayudando a convertir una idea en un producto real.</p>
        </div>
        <div class="about-card">
            <h2>03 // Filosofía [Misión y Valores]:</h2>
            <p>Misión:
            Nuestra misión es desarrollar soluciones digitales que realmente aporten valor. Combinamos creatividad, tecnología y experiencia para construir proyectos funcionales, estables y preparados para crecer junto con nuestros clientes.</p>
            <p>Valores:</p>
            <p>✧ [Innovación]: Siempre buscamos nuevas formas de resolver problemas mediante tecnología y creatividad.</p>
            <p>✧ [Calidad]: Cuidamos tanto el funcionamiento como la presentación de cada proyecto.</p>
            <p>✧ [Compromiso]: Trabajamos de manera cercana con cada cliente para entregar resultados que cumplan sus objetivos.</p>
            <p>✧ [Aprendizaje continuo]: La tecnología evoluciona constantemente y nosotros evolucionamos con ella.</p>
        </div>
        <div class="about-card">
            <h2>04 // Metodología / Cómo trabajamos:</h2>
            <p>Nuestra metodología se ejecuta en un ciclo cerrado de cuatro fases:</p>
            <p>1° [Escuchamos tu idea]: Analizamos tus objetivos y entendemos qué necesitas.</p>
            <p>2° [Diseñamos la solución]: Planificamos la estructura técnica y visual del proyecto.</p>
            <p>3° [Desarrollamos]: Construimos el proyecto aplicando buenas prácticas y pruebas constantes.</p>
            <p>4° [Entregamos y mejoramos]: Publicamos el proyecto y brindamos soporte cuando sea necesario.</p>
        </div>
        <div class="about-card">
            <h2>05 // Infraestructura [Equipo]:</h2>
            <div class="team-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
            
                <div class="card red">
                    <img src="assets/team/Damian.jpg" alt="Foto" class="team-photo">
                    <h2>Damian cruz</h2>
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

            </div>
        </div>
    </section>
`,

      plans: `
        <div class="portfolio-page">
            <h1>『 𝑹𝒆𝒄𝒖𝒓𝒔𝒐𝒔 』</h1>
            <p>Compartimos aplicaciones, herramientas, recursos y proyectos desarrollados por CodeTrax para que la comunidad pueda utilizarlos, aprender de ellos o incorporarlos a sus propios proyectos.</p>
   
            <div class="portfolio-filters">
                <button class="filter-btn active" data-filter="Todos">Todos</button>
                <button class="filter-btn" data-filter="Apps">Apps</button>
                <button class="filter-btn" data-filter="juegos">Juegos</button>
                <button class="filter-btn" data-filter="office">Office</button>
                <button class="filter-btn" data-filter="codigo">Código</button>
                <button class="filter-btn" data-filter="robotica">Robotica</button>
            </div>
            <div id="recursos-container"></div>
        </div>
      `,

       settings: `
    <section class="about-section">
        <h1 class="about-title">『 𝑷𝒐𝒓𝒕𝒂𝒇𝒐𝒍𝒊𝒐 』</h1>
        <p>Aquí encontrarás algunos de los proyectos desarrollados por el equipo de CodeTrax. Cada trabajo refleja nuestra experiencia en programación, diseño, automatización y desarrollo multimedia.</p>
        
        <div class="portfolio-filters">
            <button class="filter-btn active" data-filter="Todos">Todos</button>
            <button class="filter-btn" data-filter="Damian">Damian</button>
            <button class="filter-btn" data-filter="Ricardo">Ricardo</button>
            <button class="filter-btn" data-filter="DynsG">DynsG</button>
            <button class="filter-btn" data-filter="Tecno">Tecno</button>
            <button class="filter-btn" data-filter="Miguel">Miguel</button>
            <button class="filter-btn" data-filter="Tomas">Tomas</button>
        </div>
        <div id="portfolio-grid"></div>
    </section>
`,

    contacto: `
            <section class="about-section">
                <h1 class="about-title">『 𝑪𝒐𝒏𝒕𝒂𝒄𝒕𝒐 』</h1>
                <p style="text-align: center;">¿Tienes alguna propuesta o colaboración en mente? Estamos disponibles para conversar.</p>
                <div style="display: flex; justify-content: center; align-items: center; width: 100%; margin-top: 20px;">
                    <div class="contact-hub">
                        <div class="socials">
          <a href="https://www.instagram.com/cod_etrax?igsh=cnFuZW04OThpeXo4" target="_blank" class="ig" title="Instagram">
          <i class="fa-brands fa-instagram"></i>
          </a>
          <a href="https://www.threads.net/@cod_etrax" target="_blank" class="gh" title="Threads">
          <i class="fa-solid fa-at"></i>
          </a>
          <a href="https://www.youtube.com/@DAMIANCDX" target="_blank" class="dc" title="YouTube">
          <i class="fa-brands fa-youtube"></i>
          </a>
          <a href="https://www.tiktok.com/@damian_cdx?is_from_webapp=1&sender_device=pc" target="_blank" class="in" title="Tiktok">
          <i class="fa-brands fa-tiktok"></i>
          </a>
          <a href="https://x.com/Code_trax" target="_blank" class="in" title="twitter"><i class="fa-brands fa-linkedin-in"></i></a>
                        </div>
                        <div class="action-btns">
                            <a href="https://calendar.app.google/7iAyjJockVxnrkot9" target="_blank" class="action-btn meet">
                                <div class="icon-box"><i class="fa-solid fa-video"></i></div>
                                <div class="btn-content">
                                    <p class="btn-title">Google Meet</p>
                                    <p class="btn-sub">Agendar videollamada</p>
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
                                    <p class="btn-sub">Envíame un mensaje</p>
                                </div>
                                <div class="btn-arrow"><i class="fa-solid fa-chevron-right"></i></div>
   </a>
   </div>
   </div>
   </div>
   </section>
   `
    };

    /* FIN GESTIÓN DE VISTAS */

    /* =====================================================
       LÓGICA DE RECURSOS
       Carga dinámica de los recursos adicionales con filtrado
    ===================================================== */
    function renderRecursos(category) {
        const container = document.getElementById('recursos-container');
        if (!container) return;

        let filteredRecursos = category !== 'Todos' 
            ? recursosProjects.filter(item => item.categoria?.toLowerCase() === category.toLowerCase())
            : recursosProjects;

        // Validación de estado vacío
        if (filteredRecursos.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: rgba(0,0,0,0.3); border-radius: 20px; backdrop-filter: blur(10px);">
                    <p style="color: #fff; font-size: 1.2rem;">No hay recursos disponibles.</p>
                </div>`;
            return;
        }

        container.innerHTML = filteredRecursos.map(item => `
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
    /* FIN LÓGICA DE RECURSOS */

    /* =====================================================
       INICIALIZACIÓN Y EVENTOS GLOBALES
       Controla navegación, atajos de teclado y buscador
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
           if(section==="home"){
           setTimeout(()=>{
           animateCounters();
           },100);
           }

            // Lógica de carga limpia por sección
            if (section === 'plans') {
                loadRecursos();
            } 

            if (section === 'settings') {
                renderPortfolio('Todos'); 
                initializeFilters();
            }

            if (section === 'contacto') {
                // Animación para los botones del hub de contacto integrada correctamente
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
    /* FIN INICIALIZACIÓN Y EVENTOS GLOBALES */
});
